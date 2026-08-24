import { useState, useEffect, type FormEvent } from "react";
import { supabase } from "../../lib/supabase";
import { projectId } from "../../../utils/supabase/info";

type SetupStatus = "checking" | "ready" | "needs-setup";

function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials") || m.includes("invalid_credentials") || m.includes("user not found") || m.includes("wrong password")) {
    return "Invalid email or password. Please check your credentials and try again.";
  }
  if (m.includes("email not confirmed")) {
    return "Your email address has not been confirmed. Please check your inbox for a confirmation link.";
  }
  if (m.includes("too many requests") || m.includes("rate limit")) {
    return "Too many sign-in attempts. Please wait a few minutes before trying again.";
  }
  if (m.includes("network") || m.includes("fetch") || m.includes("failed to fetch")) {
    return "Unable to reach the authentication server. Please check your internet connection.";
  }
  // Unknown error — show sanitised version in UI, full error in console
  console.error("Supabase auth error:", message);
  return "Sign-in failed. Please try again or contact your administrator.";
}

async function checkDatabaseSetup(): Promise<SetupStatus> {
  try {
    const { error } = await supabase.from("profiles").select("id").limit(1);
    if (error) {
      // "relation does not exist" or similar → setup.sql not run yet
      const msg = error.message.toLowerCase();
      if (msg.includes("relation") || msg.includes("does not exist") || msg.includes("42p01")) {
        return "needs-setup";
      }
    }
    return "ready";
  } catch {
    return "needs-setup";
  }
}

const supabaseDashboardUrl = `https://supabase.com/dashboard/project/${projectId}`;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [setupStatus, setSetupStatus] = useState<SetupStatus>("checking");
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    checkDatabaseSetup().then(setSetupStatus);
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(friendlyAuthError(error.message));
    }
    setLoading(false);
  }

  const needsSetup = setupStatus === "needs-setup";

  return (
    <div className="min-h-screen flex" style={{ background: "linear-gradient(135deg, #1C1917 60%, #292524 100%)" }}>
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded flex items-center justify-center" style={{ background: "#B8952A" }}>
            <span className="text-white text-base">◈</span>
          </div>
          <span className="text-white font-semibold text-sm tracking-wide">Jewel Factory</span>
        </div>
        <div>
          <h1 className="font-display text-5xl font-bold text-white leading-tight mb-4">
            Factory<br />Intelligence<br />Dashboard
          </h1>
          <p className="text-[#A8A29E] text-sm leading-relaxed max-w-sm">
            Complete work management and billing system for your jewellery manufacturing operations.
          </p>
          <div className="mt-10 flex gap-6">
            {["Filing", "Wax / Setting", "Polish", "Machine Polish"].map((m) => (
              <div key={m} className="text-center">
                <div className="w-px h-8 bg-[#B8952A] mx-auto mb-2" />
                <p className="text-[#78716C] text-xs">{m}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-[#57534E] text-xs">© 2025 Jewellery Factory Management System</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[#FAF8F5] overflow-y-auto">
        <div className="w-full max-w-sm py-8">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-7 h-7 rounded flex items-center justify-center bg-[#B8952A]">
              <span className="text-white text-sm">◈</span>
            </div>
            <span className="font-semibold text-[#1C1917] text-sm">Jewel Factory</span>
          </div>

          {/* Database not set up warning */}
          {needsSetup && (
            <div className="mb-6 p-4 rounded-md bg-[#FEF3C7] border border-[#FDE68A]">
              <div className="flex items-start gap-2">
                <span className="text-[#B45309] text-sm mt-0.5">⚠</span>
                <div>
                  <p className="text-xs font-semibold text-[#B45309] mb-1">Database setup required</p>
                  <p className="text-xs text-[#78716C]">
                    The database tables have not been created yet. Complete the one-time setup below before signing in.
                  </p>
                </div>
              </div>
            </div>
          )}

          <h2 className="font-display text-2xl font-semibold text-[#1C1917] mb-1">Sign in</h2>
          <p className="text-sm text-[#78716C] mb-6">Enter your credentials to access the dashboard.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#44403C] mb-1">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="your@email.com"
                className="w-full px-3 py-2.5 text-sm rounded-md border border-[#E7E0D8] bg-white text-[#1C1917] placeholder-[#A8A29E] focus:outline-none focus:ring-1 focus:ring-[#B8952A] focus:border-[#B8952A] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#44403C] mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full px-3 py-2.5 text-sm rounded-md border border-[#E7E0D8] bg-white text-[#1C1917] placeholder-[#A8A29E] focus:outline-none focus:ring-1 focus:ring-[#B8952A] focus:border-[#B8952A] transition-colors"
              />
            </div>
            {error && (
              <div className="text-sm text-[#C0392B] bg-[#FEE2E2] border border-[#FECACA] px-3 py-2.5 rounded-md">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-md bg-[#1C1917] text-white text-sm font-medium hover:bg-[#292524] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          {/* Setup accordion */}
          <div className="mt-6 rounded-md border border-[#E7E0D8] overflow-hidden">
            <button
              onClick={() => setShowSetup((s) => !s)}
              className="w-full flex items-center justify-between px-4 py-3 bg-[#F5EDD6] border-b border-[#E8D9A8] text-left"
            >
              <div className="flex items-center gap-2">
                {setupStatus === "checking" && <span className="w-3 h-3 border-2 border-[#B8952A] border-t-transparent rounded-full animate-spin inline-block" />}
                {setupStatus === "ready" && <span className="text-[#2D7A4F] text-xs">✓</span>}
                {setupStatus === "needs-setup" && <span className="text-[#B45309] text-xs">!</span>}
                <span className="text-xs font-semibold text-[#78716C]">
                  {setupStatus === "ready" ? "Database connected — first-time user setup" : "First-time setup instructions"}
                </span>
              </div>
              <span className="text-[#A8A29E] text-xs transition-transform duration-200" style={{ transform: showSetup ? "rotate(90deg)" : "rotate(0deg)" }}>›</span>
            </button>

            {showSetup && (
              <div className="px-4 py-4 bg-white space-y-4 text-xs text-[#44403C]">

                {/* Step 1 — only shown if setup needed */}
                {needsSetup && (
                  <div>
                    <p className="font-semibold text-[#1C1917] mb-1">Step 1 — Run the database setup SQL</p>
                    <ol className="list-decimal list-inside space-y-1 text-[#78716C]">
                      <li>Open your <a href={`${supabaseDashboardUrl}/sql/new`} target="_blank" rel="noreferrer" className="text-[#B8952A] underline">Supabase SQL Editor ↗</a></li>
                      <li>Copy the full contents of <code className="bg-[#F0EBE3] px-1 rounded">setup.sql</code> from the project root</li>
                      <li>Paste and click <strong>Run</strong></li>
                    </ol>
                  </div>
                )}

                {/* Step 2 — create user */}
                <div>
                  <p className="font-semibold text-[#1C1917] mb-1">{needsSetup ? "Step 2" : "Step 1"} — Create your admin user</p>
                  <ol className="list-decimal list-inside space-y-1 text-[#78716C]">
                    <li>
                      Open <a href={`${supabaseDashboardUrl}/auth/users`} target="_blank" rel="noreferrer" className="text-[#B8952A] underline">Supabase Auth → Users ↗</a>
                    </li>
                    <li>Click <strong>Add user → Create new user</strong></li>
                    <li>Enter your email and a strong password</li>
                    <li>Click <strong>Create user</strong></li>
                  </ol>
                </div>

                {/* Step 3 — set admin role */}
                <div>
                  <p className="font-semibold text-[#1C1917] mb-1">{needsSetup ? "Step 3" : "Step 2"} — Set admin role</p>
                  <p className="text-[#78716C] mb-1">In the <a href={`${supabaseDashboardUrl}/sql/new`} target="_blank" rel="noreferrer" className="text-[#B8952A] underline">SQL Editor ↗</a>, run:</p>
                  <div className="bg-[#1C1917] rounded p-2 font-mono text-[#B8952A] text-[10px] leading-relaxed">
                    UPDATE profiles SET role = 'admin'<br />
                    WHERE email = 'your@email.com';
                  </div>
                  <p className="text-[#A8A29E] mt-1">Replace with the email you created above.</p>
                </div>

                {/* Step 4 — sign in */}
                <div>
                  <p className="font-semibold text-[#1C1917] mb-1">{needsSetup ? "Step 4" : "Step 3"} — Sign in above</p>
                  <p className="text-[#78716C]">Use the email and password you created in Supabase Auth.</p>
                </div>

                <div className="pt-2 border-t border-[#E7E0D8]">
                  <p className="text-[#A8A29E]">
                    Project: <span className="font-mono">{projectId}</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
