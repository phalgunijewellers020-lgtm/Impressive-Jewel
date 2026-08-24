import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useApp } from "../../context/AppContext";
import {
  PageHeader, Card, Table, Btn, Badge, Modal, Field, Input, Select, SearchInput,
} from "../UI";
import type { UserProfile } from "../../types";
import { MODULES, ACTION_LABELS, type ActionType } from "../../lib/permissions";
import { format } from "date-fns";

// ─── Local types ──────────────────────────────────────────────────────────────

interface UserRow extends UserProfile {
  created_at?: string;
  permission_count?: number;
}

type ModalMode = "create" | "edit" | "permissions" | "view" | null;

interface UserForm {
  full_name: string;
  email: string;
  mobile_number: string;
  role: "admin" | "staff";
  status: "active" | "inactive";
  password: string;
  confirm_password: string;
}

const EMPTY_FORM: UserForm = {
  full_name: "",
  email: "",
  mobile_number: "",
  role: "staff",
  status: "active",
  password: "",
  confirm_password: "",
};

// ─── Permission panel ─────────────────────────────────────────────────────────

interface PermPanelProps {
  perms: Set<string>;
  onChange: (next: Set<string>) => void;
}

function PermPanel({ perms, onChange }: PermPanelProps) {
  function toggle(module: string, action: string) {
    const key = `${module}:${action}`;
    const next = new Set(perms);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onChange(next);
  }

  function selectModule(module: string, actions: ActionType[]) {
    const next = new Set(perms);
    actions.forEach((a) => next.add(`${module}:${a}`));
    onChange(next);
  }

  function clearModule(module: string, actions: ActionType[]) {
    const next = new Set(perms);
    actions.forEach((a) => next.delete(`${module}:${a}`));
    onChange(next);
  }

  function selectAll() {
    const next = new Set<string>();
    MODULES.forEach((m) => m.actions.forEach((a) => next.add(`${m.id}:${a}`)));
    onChange(next);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-[#1C1917]">Access &amp; Permissions</h4>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={selectAll}
            className="text-xs px-2 py-1 rounded border border-[#B8952A] text-[#B8952A] hover:bg-[#F5EDD6] transition-colors"
          >
            Select All
          </button>
          <button
            type="button"
            onClick={() => onChange(new Set())}
            className="text-xs px-2 py-1 rounded border border-[#E7E0D8] text-[#78716C] hover:bg-[#F0EBE3] transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
        {MODULES.map((mod) => {
          const allChecked = mod.actions.every((a) => perms.has(`${mod.id}:${a}`));
          return (
            <div key={mod.id} className="border border-[#E7E0D8] rounded-md p-3 bg-[#FAF8F5]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#1C1917] uppercase tracking-wide">
                  {mod.label}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    allChecked
                      ? clearModule(mod.id, mod.actions)
                      : selectModule(mod.id, mod.actions)
                  }
                  className="text-[10px] px-1.5 py-0.5 rounded border border-[#E7E0D8] text-[#78716C] hover:border-[#B8952A] hover:text-[#B8952A] transition-colors"
                >
                  {allChecked ? "Clear" : "Select All"}
                </button>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                {mod.actions.map((action) => {
                  const key = `${mod.id}:${action}`;
                  const checked = perms.has(key);
                  return (
                    <label
                      key={action}
                      className="flex items-center gap-1.5 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(mod.id, action)}
                        className="w-3.5 h-3.5 rounded border-[#D1C9BE] accent-[#B8952A]"
                      />
                      <span className="text-xs text-[#44403C]">{ACTION_LABELS[action]}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function UserManagement() {
  const { addToast, profile: currentUserProfile, refreshPermissions, createAuthUser } = useApp();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [form, setForm] = useState<UserForm>(EMPTY_FORM);
  const [perms, setPerms] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [resetPwEmail, setResetPwEmail] = useState<string | null>(null);

  const isAdmin = currentUserProfile?.role === "admin";

  // ── Load all users ──────────────────────────────────────────────────────────

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("*")
      .order("full_name");

    // Count permissions per user for the "Permissions" column
    const { data: permsData } = await supabase
      .from("user_permissions")
      .select("user_id");

    const permCounts: Record<string, number> = {};
    (permsData || []).forEach((p: { user_id: string }) => {
      permCounts[p.user_id] = (permCounts[p.user_id] || 0) + 1;
    });

    setUsers(
      (profilesData || []).map((p) => ({
        ...p,
        permission_count: permCounts[p.id] ?? 0,
      }))
    );
    setLoading(false);
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  // ── Load individual user permissions ────────────────────────────────────────

  async function loadUserPerms(userId: string) {
    const { data } = await supabase
      .from("user_permissions")
      .select("module, action")
      .eq("user_id", userId);
    const s = new Set<string>();
    (data || []).forEach((r: { module: string; action: string }) =>
      s.add(`${r.module}:${r.action}`)
    );
    setPerms(s);
  }

  // ── Modal openers ───────────────────────────────────────────────────────────

  function openCreate() {
    setForm(EMPTY_FORM);
    setPerms(new Set());
    setSelectedUser(null);
    setModalMode("create");
  }

  function openEdit(user: UserRow) {
    setSelectedUser(user);
    setForm({
      full_name: user.full_name,
      email: user.email,
      mobile_number: user.mobile_number || "",
      role: user.role,
      status: user.status ?? "active",
      password: "",
      confirm_password: "",
    });
    setModalMode("edit");
  }

  async function openPermissions(user: UserRow) {
    setSelectedUser(user);
    await loadUserPerms(user.id);
    setModalMode("permissions");
  }

  function openView(user: UserRow) {
    setSelectedUser(user);
    setModalMode("view");
  }

  // ── Create user ─────────────────────────────────────────────────────────────

  async function handleCreateUser() {
    if (!form.full_name.trim() || !form.email.trim()) {
      addToast("error", "Full name and email are required.");
      return;
    }
    if (!form.password || form.password.length < 6) {
      addToast("error", "Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirm_password) {
      addToast("error", "Passwords do not match.");
      return;
    }

    setSaving(true);
    try {
      // createAuthUser handles sign-up + admin session restoration atomically.
      // Passwords are managed entirely by Supabase Auth — never stored in the DB.
      const { userId: newUserId, error: authError } = await createAuthUser(
        form.email.trim(),
        form.password,
        { full_name: form.full_name.trim(), role: form.role }
      );

      if (authError || !newUserId) throw new Error(authError ?? "User creation failed.");

      // Write the profile row (trigger may have already created one; upsert is safe)
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: newUserId,
        email: form.email.trim(),
        full_name: form.full_name.trim(),
        role: form.role,
        status: form.status,
        mobile_number: form.mobile_number.trim() || null,
      });
      if (profileError) throw profileError;

      // Insert permissions for staff users
      if (form.role === "staff" && perms.size > 0) {
        const permRows = Array.from(perms).map((key) => {
          const [module, action] = key.split(":");
          return {
            user_id: newUserId,
            module,
            action,
            granted_by: currentUserProfile?.id,
          };
        });
        await supabase.from("user_permissions").insert(permRows);
      }

      // Audit log — non-fatal if it fails
      supabase.from("audit_logs").insert({
        user_id: currentUserProfile?.id,
        action: "user_created",
        entity_type: "user",
        entity_id: newUserId,
        details: { email: form.email, role: form.role, full_name: form.full_name },
      }).then(() => null).catch(() => null);

      addToast("success", `User "${form.full_name}" created successfully.`);
      setModalMode(null);
      loadUsers();
    } catch (err: unknown) {
      addToast("error", err instanceof Error ? err.message : "Failed to create user.");
    } finally {
      setSaving(false);
    }
  }

  // ── Edit user ───────────────────────────────────────────────────────────────

  async function handleEditUser() {
    if (!selectedUser || !form.full_name.trim()) {
      addToast("error", "Full name is required.");
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: form.full_name.trim(),
          mobile_number: form.mobile_number.trim() || null,
          role: form.role,
          status: form.status,
        })
        .eq("id", selectedUser.id);
      if (error) throw error;

      supabase.from("audit_logs").insert({
        user_id: currentUserProfile?.id,
        action: "user_updated",
        entity_type: "user",
        entity_id: selectedUser.id,
        details: { role: form.role, status: form.status },
      }).then(() => null).catch(() => null);

      addToast("success", "User updated successfully.");
      setModalMode(null);
      loadUsers();
    } catch (err: unknown) {
      addToast("error", err instanceof Error ? err.message : "Update failed.");
    } finally {
      setSaving(false);
    }
  }

  // ── Save permissions ────────────────────────────────────────────────────────

  async function handleSavePermissions() {
    if (!selectedUser) return;
    setSaving(true);
    try {
      // Replace-all: delete then re-insert
      await supabase.from("user_permissions").delete().eq("user_id", selectedUser.id);

      if (perms.size > 0) {
        const permRows = Array.from(perms).map((key) => {
          const [module, action] = key.split(":");
          return { user_id: selectedUser.id, module, action, granted_by: currentUserProfile?.id };
        });
        const { error } = await supabase.from("user_permissions").insert(permRows);
        if (error) throw error;
      }

      supabase.from("audit_logs").insert({
        user_id: currentUserProfile?.id,
        action: "permissions_updated",
        entity_type: "user",
        entity_id: selectedUser.id,
        details: { permission_count: perms.size },
      }).then(() => null).catch(() => null);

      await refreshPermissions();
      addToast("success", "Permissions saved successfully.");
      setModalMode(null);
      loadUsers();
    } catch (err: unknown) {
      addToast("error", err instanceof Error ? err.message : "Failed to save permissions.");
    } finally {
      setSaving(false);
    }
  }

  // ── Activate / Deactivate ───────────────────────────────────────────────────

  async function handleToggleStatus(user: UserRow) {
    const newStatus = user.status === "active" ? "inactive" : "active";
    const { error } = await supabase
      .from("profiles")
      .update({ status: newStatus })
      .eq("id", user.id);

    if (error) {
      addToast("error", "Failed to update user status.");
      return;
    }

    supabase.from("audit_logs").insert({
      user_id: currentUserProfile?.id,
      action: newStatus === "active" ? "user_activated" : "user_deactivated",
      entity_type: "user",
      entity_id: user.id,
      details: {},
    }).then(() => null).catch(() => null);

    addToast("success", `User ${newStatus === "active" ? "activated" : "deactivated"}.`);
    loadUsers();
  }

  // ── Reset password ──────────────────────────────────────────────────────────

  async function handleResetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      addToast("error", "Failed to send password reset email.");
      return;
    }

    supabase.from("audit_logs").insert({
      user_id: currentUserProfile?.id,
      action: "password_reset_requested",
      entity_type: "user",
      entity_id: selectedUser?.id,
      details: { email },
    }).then(() => null).catch(() => null);

    addToast("success", `Password reset email sent to ${email}.`);
    setResetPwEmail(null);
  }

  // ── Table ───────────────────────────────────────────────────────────────────

  const filtered = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.full_name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  const COLUMNS = [
    {
      key: "full_name",
      label: "User Name",
      render: (r: Record<string, unknown>) => (
        <div>
          <p className="font-medium text-[#1C1917] text-sm">{(r.full_name as string) || "—"}</p>
          {r.mobile_number && (
            <p className="text-xs text-[#78716C]">{r.mobile_number as string}</p>
          )}
        </div>
      ),
    },
    {
      key: "email",
      label: "Email / Login ID",
      render: (r: Record<string, unknown>) => (
        <span className="text-xs font-mono text-[#44403C]">{r.email as string}</span>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (r: Record<string, unknown>) => (
        <Badge variant={r.role === "admin" ? "warning" : "info"}>
          {r.role === "admin" ? "Admin" : "Staff"}
        </Badge>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (r: Record<string, unknown>) => (
        <Badge variant={(r.status as string) === "active" ? "success" : "neutral"}>
          {(r.status as string) ?? "active"}
        </Badge>
      ),
    },
    {
      key: "permission_count",
      label: "Permissions",
      render: (r: Record<string, unknown>) =>
        r.role === "admin" ? (
          <span className="text-xs text-[#B8952A] font-medium">Full Access</span>
        ) : (
          <span className="text-xs text-[#78716C]">{r.permission_count as number} granted</span>
        ),
    },
    {
      key: "_actions",
      label: "Actions",
      render: (r: Record<string, unknown>) => {
        const u = r as unknown as UserRow;
        const isSelf = u.id === currentUserProfile?.id;
        return (
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => openView(u)}
              className="text-xs px-2 py-1 text-[#44403C] hover:bg-[#F0EBE3] rounded transition-colors"
            >
              View
            </button>
            {isAdmin && (
              <>
                <button
                  onClick={() => openEdit(u)}
                  className="text-xs px-2 py-1 text-[#44403C] hover:bg-[#F0EBE3] rounded transition-colors"
                >
                  Edit
                </button>
                {u.role !== "admin" && (
                  <button
                    onClick={() => openPermissions(u)}
                    className="text-xs px-2 py-1 text-[#B8952A] hover:bg-[#F5EDD6] rounded transition-colors font-medium"
                  >
                    Access
                  </button>
                )}
                <button
                  onClick={() => { setSelectedUser(u); setResetPwEmail(u.email); }}
                  className="text-xs px-2 py-1 text-[#44403C] hover:bg-[#F0EBE3] rounded transition-colors"
                >
                  Reset Pwd
                </button>
                {!isSelf && (
                  <button
                    onClick={() => handleToggleStatus(u)}
                    className={`text-xs px-2 py-1 rounded transition-colors ${
                      u.status === "active"
                        ? "text-[#C0392B] hover:bg-[#FEE2E2]"
                        : "text-[#2D7A4F] hover:bg-[#D1FAE5]"
                    }`}
                  >
                    {u.status === "active" ? "Deactivate" : "Activate"}
                  </button>
                )}
              </>
            )}
          </div>
        );
      },
    },
  ];

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      <PageHeader
        title="User Management"
        subtitle="Manage users, roles, and access permissions"
        actions={isAdmin ? <Btn onClick={openCreate}>+ Create User</Btn> : undefined}
      />

      {!isAdmin && (
        <div className="bg-[#FEF3C7] border border-[#FDE68A] rounded-md px-4 py-3 text-xs text-[#B45309]">
          Only administrators can manage users and permissions.
        </div>
      )}

      <div className="flex gap-2 items-center">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name, email, role…" />
        <span className="text-xs text-[#78716C] ml-auto">{filtered.length} users</span>
      </div>

      <Card>
        <Table
          columns={COLUMNS}
          data={filtered as unknown as Record<string, unknown>[]}
          loading={loading}
          emptyMessage="No users found."
        />
      </Card>

      {/* ── Create User Modal ─────────────────────────────────── */}
      <Modal
        open={modalMode === "create"}
        onClose={() => setModalMode(null)}
        title="Create New User"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Name" required>
              <Input
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                placeholder="Enter full name"
              />
            </Field>
            <Field label="Mobile Number">
              <Input
                value={form.mobile_number}
                onChange={(e) => setForm({ ...form, mobile_number: e.target.value })}
                placeholder="+91 98765 43210"
              />
            </Field>
          </div>

          <Field label="Email / Login ID" required>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="user@example.com"
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Password" required>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Min. 6 characters"
              />
            </Field>
            <Field label="Confirm Password" required>
              <Input
                type="password"
                value={form.confirm_password}
                onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
                placeholder="Re-enter password"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Role">
              <Select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as "admin" | "staff" })}
                options={[
                  { value: "staff", label: "Staff" },
                  { value: "admin", label: "Admin" },
                ]}
              />
            </Field>
            <Field label="Status">
              <Select
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as "active" | "inactive" })
                }
                options={[
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                ]}
              />
            </Field>
          </div>

          {form.role === "staff" && (
            <div className="border-t border-[#E7E0D8] pt-4">
              <PermPanel perms={perms} onChange={setPerms} />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-[#E7E0D8]">
            <Btn variant="secondary" onClick={() => setModalMode(null)} disabled={saving}>
              Cancel
            </Btn>
            <Btn onClick={handleCreateUser} disabled={saving}>
              {saving ? "Creating…" : "Create User"}
            </Btn>
          </div>
        </div>
      </Modal>

      {/* ── Edit User Modal ───────────────────────────────────── */}
      <Modal
        open={modalMode === "edit"}
        onClose={() => setModalMode(null)}
        title={`Edit User — ${selectedUser?.full_name}`}
        size="md"
      >
        <div className="space-y-4">
          <Field label="Full Name" required>
            <Input
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />
          </Field>
          <Field label="Mobile Number">
            <Input
              value={form.mobile_number}
              onChange={(e) => setForm({ ...form, mobile_number: e.target.value })}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Role">
              <Select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as "admin" | "staff" })}
                options={[
                  { value: "staff", label: "Staff" },
                  { value: "admin", label: "Admin" },
                ]}
              />
            </Field>
            <Field label="Status">
              <Select
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as "active" | "inactive" })
                }
                options={[
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                ]}
              />
            </Field>
          </div>
          <p className="text-xs text-[#78716C] bg-[#F0EBE3] rounded px-3 py-2">
            To adjust module access, use the <strong>Access</strong> button in the user list.
          </p>
          <div className="flex justify-end gap-2 pt-2 border-t border-[#E7E0D8]">
            <Btn variant="secondary" onClick={() => setModalMode(null)} disabled={saving}>
              Cancel
            </Btn>
            <Btn onClick={handleEditUser} disabled={saving}>
              {saving ? "Saving…" : "Save Changes"}
            </Btn>
          </div>
        </div>
      </Modal>

      {/* ── Manage Access Modal ───────────────────────────────── */}
      <Modal
        open={modalMode === "permissions"}
        onClose={() => setModalMode(null)}
        title={`Manage Access — ${selectedUser?.full_name}`}
        size="lg"
      >
        <div className="space-y-4">
          <div className="bg-[#F0EBE3] rounded-md px-3 py-2 text-xs text-[#78716C]">
            Permissions apply to Staff users only. Admin accounts always have full access.
          </div>
          <PermPanel perms={perms} onChange={setPerms} />
          <div className="flex justify-end gap-2 pt-2 border-t border-[#E7E0D8]">
            <Btn variant="secondary" onClick={() => setModalMode(null)} disabled={saving}>
              Cancel
            </Btn>
            <Btn onClick={handleSavePermissions} disabled={saving}>
              {saving ? "Saving…" : "Save Permissions"}
            </Btn>
          </div>
        </div>
      </Modal>

      {/* ── View User Modal ───────────────────────────────────── */}
      <Modal
        open={modalMode === "view"}
        onClose={() => setModalMode(null)}
        title="User Details"
        size="md"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-[#78716C] mb-0.5">Full Name</p>
                <p className="font-medium text-[#1C1917]">{selectedUser.full_name}</p>
              </div>
              <div>
                <p className="text-xs text-[#78716C] mb-0.5">Email</p>
                <p className="font-mono text-[#44403C] text-xs">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-xs text-[#78716C] mb-0.5">Mobile</p>
                <p className="text-[#44403C]">{selectedUser.mobile_number || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-[#78716C] mb-0.5">Role</p>
                <Badge variant={selectedUser.role === "admin" ? "warning" : "info"}>
                  {selectedUser.role === "admin" ? "Admin" : "Staff"}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-[#78716C] mb-0.5">Status</p>
                <Badge variant={selectedUser.status === "active" ? "success" : "neutral"}>
                  {selectedUser.status ?? "active"}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-[#78716C] mb-0.5">Permissions</p>
                <p className="text-[#44403C]">
                  {selectedUser.role === "admin"
                    ? "Full Access"
                    : `${selectedUser.permission_count ?? 0} granted`}
                </p>
              </div>
            </div>
            {selectedUser.created_at && (
              <p className="text-xs text-[#78716C]">
                Created: {format(new Date(selectedUser.created_at), "dd MMM yyyy, hh:mm a")}
              </p>
            )}
            <div className="flex justify-end pt-2 border-t border-[#E7E0D8]">
              <Btn variant="secondary" onClick={() => setModalMode(null)}>Close</Btn>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Reset Password Modal ──────────────────────────────── */}
      {resetPwEmail && (
        <Modal
          open
          onClose={() => setResetPwEmail(null)}
          title="Reset Password"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-sm text-[#44403C]">
              Send a secure password reset link to:
            </p>
            <p className="font-mono text-sm text-[#1C1917] bg-[#F0EBE3] rounded px-3 py-2">
              {resetPwEmail}
            </p>
            <p className="text-xs text-[#78716C]">
              The user receives a one-time link to set a new password. Passwords are never
              stored in the application database — Supabase Auth handles them exclusively.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-[#E7E0D8]">
              <Btn variant="secondary" onClick={() => setResetPwEmail(null)}>Cancel</Btn>
              <Btn onClick={() => handleResetPassword(resetPwEmail)}>Send Reset Link</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
