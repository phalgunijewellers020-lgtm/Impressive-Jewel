import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { supabase } from "../lib/supabase";
import type { UserProfile, Toast, NavPage } from "../types";
import type { Session } from "@supabase/supabase-js";
import { buildPermSet, permKey } from "../lib/permissions";

interface CreateAuthUserResult {
  userId: string | null;
  error: string | null;
}

interface AppContextValue {
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  currentPage: NavPage;
  navigate: (page: NavPage) => void;
  toasts: Toast[];
  addToast: (type: Toast["type"], message: string) => void;
  removeToast: (id: string) => void;
  signOut: () => Promise<void>;
  can: (module: string, action: string) => boolean;
  refreshPermissions: () => Promise<void>;
  /**
   * Creates a new Supabase Auth user from the admin context.
   * Handles session capture → signUp → session restore atomically
   * so the admin is never logged out during the operation.
   * Never stores passwords in the database.
   */
  createAuthUser: (
    email: string,
    password: string,
    metadata: { full_name: string; role: string }
  ) => Promise<CreateAuthUserResult>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<NavPage>("dashboard");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [permissions, setPermissions] = useState<Set<string>>(new Set());

  // When true the onAuthStateChange listener does nothing.
  // Used during the admin → createUser → restoreAdmin cycle to prevent
  // the UI from briefly showing a different user's session.
  const suppressAuthChange = useRef(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s) fetchProfileAndPermissions(s.user.id);
      else setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      if (suppressAuthChange.current) return;
      setSession(s);
      if (s) fetchProfileAndPermissions(s.user.id);
      else {
        setProfile(null);
        setPermissions(new Set());
        setLoading(false);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function fetchProfileAndPermissions(userId: string) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        // Table may not exist yet or RLS blocks access — fall back to auth metadata.
        console.warn("Profile fetch error:", error.message);
        const { data: authUser } = await supabase.auth.getUser();
        if (authUser?.user) {
          setProfile({
            id: authUser.user.id,
            email: authUser.user.email ?? "",
            full_name:
              authUser.user.user_metadata?.full_name ??
              authUser.user.email?.split("@")[0] ??
              "User",
            role: (authUser.user.user_metadata?.role as "admin" | "staff") ?? "admin",
            status: "active",
          });
          setPermissions(new Set());
        }
      } else {
        const p = data as UserProfile;
        setProfile(p);
        if (p.role !== "admin") {
          await loadPermissions(userId);
        } else {
          setPermissions(new Set()); // admin — can() always returns true
        }
      }
    } catch (err) {
      console.error("Unexpected profile fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadPermissions(userId: string) {
    try {
      const { data } = await supabase
        .from("user_permissions")
        .select("module, action")
        .eq("user_id", userId);
      setPermissions(buildPermSet(data || []));
    } catch {
      setPermissions(new Set());
    }
  }

  /**
   * Creates a new Supabase Auth user without disrupting the admin session.
   *
   * Flow:
   *  1. Snapshot the current admin tokens.
   *  2. Suppress all onAuthStateChange events.
   *  3. Call signUp() — Supabase internally switches to the new user's session.
   *  4. Immediately call setSession() with the admin tokens to restore the session
   *     at the Supabase-client level.
   *  5. Manually push the admin session back into React state (since we suppressed
   *     the onAuthStateChange event that would have done it).
   *  6. Unsuppress after a short delay to allow any in-flight events to settle.
   *
   * Passwords are handled entirely by Supabase Auth and are never stored in the
   * application database.
   */
  const createAuthUser = useCallback(
    async (
      email: string,
      password: string,
      metadata: { full_name: string; role: string }
    ): Promise<CreateAuthUserResult> => {
      // Snapshot admin session before anything changes
      const { data: { session: adminSession } } = await supabase.auth.getSession();
      if (!adminSession) return { userId: null, error: "No active admin session." };

      // Block onAuthStateChange for the entire sign-up + restore sequence
      suppressAuthChange.current = true;

      try {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: metadata },
        });

        if (signUpError) throw new Error(signUpError.message);
        if (!signUpData.user) throw new Error("Sign-up returned no user — check Supabase Auth settings.");

        const newUserId = signUpData.user.id;

        // Restore admin session at the Supabase-client level
        await supabase.auth.setSession({
          access_token: adminSession.access_token,
          refresh_token: adminSession.refresh_token,
        });

        // Manually restore React state — the suppressed listener won't do it for us
        setSession(adminSession);

        return { userId: newUserId, error: null };
      } catch (err) {
        // Best-effort restore on failure too
        try {
          await supabase.auth.setSession({
            access_token: adminSession.access_token,
            refresh_token: adminSession.refresh_token,
          });
          setSession(adminSession);
        } catch { /* ignore */ }

        return {
          userId: null,
          error: err instanceof Error ? err.message : "Unknown error during user creation.",
        };
      } finally {
        // Unsuppress after a short delay so any pending events settle first
        setTimeout(() => { suppressAuthChange.current = false; }, 800);
      }
    },
    []
  );

  const refreshPermissions = useCallback(async () => {
    if (!session) return;
    const { data: p } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();
    if (p?.role !== "admin") {
      await loadPermissions(session.user.id);
    }
  }, [session]);

  const can = useCallback(
    (module: string, action: string): boolean => {
      if (!profile) return false;
      if (profile.role === "admin") return true;
      return permissions.has(permKey(module, action));
    },
    [profile, permissions]
  );

  const navigate = useCallback((page: NavPage) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  }, []);

  const addToast = useCallback((type: Toast["type"], message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return (
    <AppContext.Provider
      value={{
        session,
        profile,
        loading,
        currentPage,
        navigate,
        toasts,
        addToast,
        removeToast,
        signOut,
        can,
        refreshPermissions,
        createAuthUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
