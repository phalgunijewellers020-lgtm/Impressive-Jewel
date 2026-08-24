-- ============================================================
-- JEWELLERY FACTORY — PERMISSIONS SYSTEM MIGRATION
-- ============================================================
-- Run this script ONCE in your Supabase SQL Editor.
-- Prerequisites: setup.sql must have been run first.
--
-- What this script does:
--   1. Adds mobile_number + status columns to profiles
--   2. Adds entity_type, entity_id, details columns to audit_logs
--   3. Creates the user_permissions table
--   4. Creates an auth_is_admin() helper function (SECURITY DEFINER)
--   5. Adds RLS policies on user_permissions
--   6. Replaces the overly broad profiles RLS policy with
--      role-aware policies (admin: all; staff: select own only)
--
-- What this script does NOT do:
--   - Does not drop any existing table
--   - Does not delete any existing data
--   - Does not change Filing / Wax / Polish / Machine Polish logic
--   - Does not change any calculation rates or formulas
--   - Does not touch Supabase Auth (passwords stay in Auth)
--   - Does not disable RLS on any table
-- ============================================================


-- ── 0. Ensure uuid-ossp is available ─────────────────────────
-- (Already done in setup.sql, repeated here for safety)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ════════════════════════════════════════════════════════════
-- SECTION 1 — EXTEND EXISTING TABLES
-- ════════════════════════════════════════════════════════════

-- ── 1a. profiles: add mobile_number ──────────────────────────
-- Nullable. No effect on existing rows.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS mobile_number TEXT;

-- ── 1b. profiles: add status ─────────────────────────────────
-- NOT NULL with DEFAULT 'active' — all existing profile rows
-- will receive status = 'active' automatically.
-- Compatible with existing handle_new_user() trigger, which
-- omits this column; the DEFAULT fills it in on new signups.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive'));

-- ── 1c. audit_logs: add entity_type ──────────────────────────
-- The application writes entity_type (e.g. 'user') on every
-- permission / user-management audit event.
-- Existing columns (table_name, record_id, old_data, new_data)
-- are untouched.
ALTER TABLE audit_logs
  ADD COLUMN IF NOT EXISTS entity_type TEXT;

-- ── 1d. audit_logs: add entity_id ────────────────────────────
-- UUID of the target record being audited.
ALTER TABLE audit_logs
  ADD COLUMN IF NOT EXISTS entity_id UUID;

-- ── 1e. audit_logs: add details ──────────────────────────────
-- JSONB bag of event-specific metadata. Never contains passwords.
ALTER TABLE audit_logs
  ADD COLUMN IF NOT EXISTS details JSONB;


-- ════════════════════════════════════════════════════════════
-- SECTION 2 — CREATE user_permissions TABLE
-- ════════════════════════════════════════════════════════════

-- Stores exactly one row per (user, module, action) triple.
-- Linked to auth.users so rows are automatically removed if a
-- Supabase Auth user is deleted (ON DELETE CASCADE).
-- Columns match the exact fields the application inserts:
--   { user_id, module, action, granted_by }
CREATE TABLE IF NOT EXISTS user_permissions (
  id          UUID        NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module      TEXT        NOT NULL,   -- e.g. 'filing', 'wax', 'reports'
  action      TEXT        NOT NULL,   -- e.g. 'view', 'add', 'edit', 'delete'
  granted_by  UUID        REFERENCES auth.users(id),  -- admin who set this
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, module, action)
);

-- Enable RLS immediately — table is never accessible without a policy.
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;

-- Index for fast per-user lookups (used on every login).
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id
  ON user_permissions (user_id);


-- ════════════════════════════════════════════════════════════
-- SECTION 3 — ADMIN HELPER FUNCTION
-- ════════════════════════════════════════════════════════════

-- auth_is_admin() checks whether the currently authenticated
-- Supabase user has role = 'admin' in the profiles table.
--
-- SECURITY DEFINER: the function executes as its owner
-- (the postgres superuser), which bypasses RLS on profiles.
-- This prevents infinite recursion when profiles RLS policies
-- themselves call this function.
--
-- STABLE: result is stable within a single SQL statement,
-- allowing the planner to cache it across rows.
--
-- SET search_path = public: prevents search-path injection.
CREATE OR REPLACE FUNCTION auth_is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM   profiles
    WHERE  id   = auth.uid()
    AND    role = 'admin'
  );
$$;

-- Grant EXECUTE to the authenticated PostgREST role so the
-- function can be called from within RLS policy expressions.
GRANT EXECUTE ON FUNCTION auth_is_admin() TO authenticated;


-- ════════════════════════════════════════════════════════════
-- SECTION 4 — RLS POLICIES ON user_permissions
-- ════════════════════════════════════════════════════════════

-- Drop before recreate to make the script idempotent (safe to
-- re-run without creating duplicate policies).

-- Policy A: Admins have full read / write access to all rows.
DROP POLICY IF EXISTS "admins_full_access_permissions" ON user_permissions;
CREATE POLICY "admins_full_access_permissions"
  ON user_permissions
  FOR ALL
  TO authenticated
  USING     (auth_is_admin())
  WITH CHECK (auth_is_admin());

-- Policy B: Any authenticated user may SELECT their own rows.
-- (Staff load their own permissions on login; admins are also
--  covered by Policy A, so this is additive for them.)
DROP POLICY IF EXISTS "users_read_own_permissions" ON user_permissions;
CREATE POLICY "users_read_own_permissions"
  ON user_permissions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());


-- ════════════════════════════════════════════════════════════
-- SECTION 5 — REPLACE OVERLY BROAD profiles RLS POLICY
-- ════════════════════════════════════════════════════════════

-- The original setup.sql created a single permissive policy:
--
--   "auth_access_profiles"  FOR ALL  USING (auth.role() = 'authenticated')
--
-- This grants every authenticated user read AND write access
-- to every other user's profile row. That must be narrowed so
-- that Staff users cannot modify other accounts.
--
-- Replacement:
--   Policy C — Admins: full access to all profiles.
--   Policy D — Any user: SELECT their own profile only.
--
-- INSERT for new profiles is handled by the handle_new_user()
-- trigger (SECURITY DEFINER) — it does not depend on RLS.

-- Remove the original broad policy.
DROP POLICY IF EXISTS "auth_access_profiles" ON profiles;

-- Policy C: Admins can SELECT / INSERT / UPDATE / DELETE any profile.
DROP POLICY IF EXISTS "profiles_admin_all" ON profiles;
CREATE POLICY "profiles_admin_all"
  ON profiles
  FOR ALL
  TO authenticated
  USING     (auth_is_admin())
  WITH CHECK (auth_is_admin());

-- Policy D: Every authenticated user can read their own profile.
-- (Used by AppContext to fetch the current user's role/status.)
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);


-- ════════════════════════════════════════════════════════════
-- VERIFICATION QUERIES (read-only — run after the migration)
-- ════════════════════════════════════════════════════════════
--
-- 1. Confirm new profiles columns exist:
--    SELECT column_name, data_type, is_nullable, column_default
--    FROM   information_schema.columns
--    WHERE  table_name = 'profiles'
--    ORDER  BY ordinal_position;
--
-- 2. Confirm new audit_logs columns exist:
--    SELECT column_name, data_type
--    FROM   information_schema.columns
--    WHERE  table_name = 'audit_logs'
--    ORDER  BY ordinal_position;
--
-- 3. Confirm user_permissions table and index:
--    SELECT column_name, data_type, is_nullable
--    FROM   information_schema.columns
--    WHERE  table_name = 'user_permissions'
--    ORDER  BY ordinal_position;
--
--    SELECT indexname FROM pg_indexes
--    WHERE  tablename = 'user_permissions';
--
-- 4. Confirm active RLS policies:
--    SELECT policyname, tablename, cmd, qual
--    FROM   pg_policies
--    WHERE  tablename IN ('profiles', 'user_permissions')
--    ORDER  BY tablename, policyname;
--
-- 5. Confirm helper function exists:
--    SELECT proname, prosecdef
--    FROM   pg_proc
--    WHERE  proname = 'auth_is_admin';
--
-- ============================================================
-- END OF MIGRATION
-- ============================================================
