import { useApp, AppProvider } from "./context/AppContext";
import LoginPage from "./components/Auth/LoginPage";
import AppLayout from "./components/Layout/AppLayout";
import Dashboard from "./components/Dashboard/Dashboard";
import Employees from "./components/Employees/Employees";
import FilingOut from "./components/Filing/FilingOut";
import FilingReturn from "./components/Filing/FilingReturn";
import FilingCalc from "./components/Filing/FilingCalc";
import FilingRates from "./components/Filing/FilingRates";
import WaxOut from "./components/Wax/WaxOut";
import WaxReturn from "./components/Wax/WaxReturn";
import WaxCalc from "./components/Wax/WaxCalc";
import WaxJobRates from "./components/Wax/WaxJobRates";
import StoneSizes from "./components/Wax/StoneSizes";
import PolishOut from "./components/Polish/PolishOut";
import PolishReturn from "./components/Polish/PolishReturn";
import PolishCalc from "./components/Polish/PolishCalc";
import PolishRates from "./components/Polish/PolishRates";
import MachinePolish from "./components/Polish/MachinePolish";
import ItemMaster from "./components/Settings/ItemMaster";
import SystemSettings from "./components/Settings/SystemSettings";
import UserManagement from "./components/Settings/UserManagement";
import About from "./components/Settings/About";
import MonthlyReport from "./components/Reports/MonthlyReport";
import { ToastContainer } from "./components/UI";
import { isSupabaseConfigured } from "./lib/supabase";
import { PAGE_MODULE_MAP, UNGUARDED_PAGES } from "./lib/permissions";
import type { NavPage } from "./types";

function SetupBanner() {
  return (
    <div className="fixed inset-0 bg-[#FAF8F5] flex items-center justify-center p-6 z-50">
      <div className="max-w-lg w-full">
        <div className="w-12 h-12 rounded-lg bg-[#1C1917] flex items-center justify-center mb-6">
          <span className="text-[#B8952A] text-xl">◈</span>
        </div>
        <h1 className="font-display text-2xl font-bold text-[#1C1917] mb-2">Setup Required</h1>
        <p className="text-sm text-[#78716C] mb-6">
          Configure your Supabase credentials to start using the Jewellery Factory Dashboard.
        </p>
        <div className="bg-[#1C1917] rounded-md p-4 font-mono text-xs text-[#B8952A] mb-4">
          <p className="text-[#78716C] mb-1"># Create .env file in project root:</p>
          <p>VITE_SUPABASE_URL=https://your-project.supabase.co</p>
          <p>VITE_SUPABASE_ANON_KEY=your-anon-key</p>
        </div>
        <p className="text-xs text-[#78716C]">
          After adding credentials, also run the SQL setup script in your Supabase SQL editor. See <code>setup.sql</code> in the project files.
        </p>
      </div>
    </div>
  );
}

function AccessDenied({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <div className="w-14 h-14 rounded-full bg-[#FEE2E2] flex items-center justify-center mb-4">
        <span className="text-2xl">🔒</span>
      </div>
      <h2 className="font-display text-2xl font-semibold text-[#1C1917] mb-2">Access Denied</h2>
      <p className="text-sm text-[#78716C] max-w-xs mb-6">
        You do not have permission to view this page. Contact your administrator to request access.
      </p>
      <button
        onClick={onBack}
        className="px-4 py-2 text-sm rounded-md bg-[#1C1917] text-white hover:bg-[#292524] transition-colors"
      >
        ← Go to Dashboard
      </button>
    </div>
  );
}

function DeactivatedScreen({ onSignOut }: { onSignOut: () => void }) {
  return (
    <div className="fixed inset-0 bg-[#FAF8F5] flex items-center justify-center p-6 z-50">
      <div className="max-w-md w-full text-center">
        <div className="w-14 h-14 rounded-full bg-[#FEE2E2] flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">⛔</span>
        </div>
        <h2 className="font-display text-xl font-bold text-[#1C1917] mb-2">Account Deactivated</h2>
        <p className="text-sm text-[#78716C] mb-6">
          Your account has been deactivated. Please contact your administrator to restore access.
        </p>
        <button
          onClick={onSignOut}
          className="px-5 py-2 text-sm rounded-md bg-[#1C1917] text-white hover:bg-[#292524] transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

function PageRouter() {
  const { currentPage, can, navigate } = useApp();

  // Check page-level permission
  function isPageAllowed(page: NavPage): boolean {
    if (UNGUARDED_PAGES.has(page)) return true;
    const req = PAGE_MODULE_MAP[page];
    if (!req) return true; // unknown page — allow by default
    return can(req.module, req.action);
  }

  if (!isPageAllowed(currentPage)) {
    return <AccessDenied onBack={() => navigate("dashboard")} />;
  }

  const pages: Record<string, React.ReactNode> = {
    "dashboard": <Dashboard />,
    "employee-list": <Employees mode="list" />,
    "employee-add": <Employees mode="add" />,
    "employee-profile": <Employees mode="list" />,
    "filing-out": <FilingOut />,
    "filing-return": <FilingReturn />,
    "filing-calc": <FilingCalc />,
    "filing-report": <MonthlyReport module="filing" />,
    "filing-rates": <FilingRates />,
    "wax-out": <WaxOut />,
    "wax-return": <WaxReturn />,
    "wax-calc": <WaxCalc />,
    "wax-report": <MonthlyReport module="wax" />,
    "wax-job-rates": <WaxJobRates />,
    "stone-sizes": <StoneSizes />,
    "polish-out": <PolishOut />,
    "polish-return": <PolishReturn />,
    "polish-calc": <PolishCalc />,
    "polish-report": <MonthlyReport module="polish" />,
    "polish-rates": <PolishRates />,
    "machine-polish": <MachinePolish />,
    "settings-users": <UserManagement />,
    "settings-items": <ItemMaster />,
    "settings-system": <SystemSettings />,
    "about": <About />,
  };

  // Redirect admin from non-existent page to dashboard
  if (!pages[currentPage]) {
    navigate("dashboard");
    return null;
  }

  return <>{pages[currentPage]}</>;
}

function AuthedApp() {
  const { session, loading, profile, signOut } = useApp();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-lg bg-[#1C1917] flex items-center justify-center mx-auto mb-4">
            <span className="text-[#B8952A] text-lg">◈</span>
          </div>
          <div className="w-5 h-5 border-2 border-[#1C1917] border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  if (!session) return <LoginPage />;

  // Block deactivated users
  if (profile && profile.status === "inactive") {
    return <DeactivatedScreen onSignOut={signOut} />;
  }

  return (
    <>
      <AppLayout>
        <PageRouter />
      </AppLayout>
      <ToastContainer />
    </>
  );
}

export default function App() {
  if (!isSupabaseConfigured) return <SetupBanner />;
  return (
    <AppProvider>
      <AuthedApp />
    </AppProvider>
  );
}
