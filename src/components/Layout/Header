import { useApp } from "../../context/AppContext";

const pageTitles: Record<string, string> = {
  dashboard: "Dashboard",
  "employee-list": "Employee List",
  "employee-add": "Add Employee",
  "employee-profile": "Employee Profile",
  "filing-out": "Filing Out",
  "filing-return": "Filing Return",
  "filing-calc": "Employee Calculation — Filing",
  "filing-report": "Monthly Report — Filing",
  "filing-rates": "Rate Master — Filing",
  "wax-out": "Wax / Stone Out",
  "wax-return": "Wax / Stone Return",
  "wax-calc": "Employee Calculation — Wax",
  "wax-report": "Monthly Report — Wax",
  "wax-job-rates": "Job Rate Master",
  "stone-sizes": "Stone Size Master",
  "polish-out": "Polish Out",
  "polish-return": "Polish Return",
  "polish-calc": "Employee Calculation — Polish",
  "polish-report": "Monthly Report — Polish",
  "polish-rates": "Rate Master — Polish",
  "machine-polish": "Machine Polish",
  "settings-users": "User Management",
  "settings-items": "Item Master",
  "settings-system": "System Settings",
  about: "About",
};

interface HeaderProps {
  collapsed: boolean;
  onToggleSidebar: () => void;
  onMobileOpen: () => void;
}

export default function Header({ onToggleSidebar, onMobileOpen }: HeaderProps) {
  const { currentPage, profile, signOut } = useApp();
  const title = pageTitles[currentPage] || "Dashboard";

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-[#E7E0D8] flex items-center justify-between px-4 py-3 shrink-0">
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={onMobileOpen}
          className="lg:hidden flex flex-col gap-1.5 p-1"
          aria-label="Open menu"
        >
          <span className="block w-5 h-0.5 bg-[#44403C]" />
          <span className="block w-5 h-0.5 bg-[#44403C]" />
          <span className="block w-5 h-0.5 bg-[#44403C]" />
        </button>
        {/* Desktop toggle */}
        <button
          onClick={onToggleSidebar}
          className="hidden lg:flex flex-col gap-1.5 p-1 hover:bg-[#F0EBE3] rounded-md transition-colors"
          aria-label="Toggle sidebar"
        >
          <span className="block w-4 h-0.5 bg-[#44403C]" />
          <span className="block w-4 h-0.5 bg-[#44403C]" />
          <span className="block w-4 h-0.5 bg-[#44403C]" />
        </button>
        <h2 className="text-sm font-semibold text-[#1C1917]">{title}</h2>
      </div>

      <div className="flex items-center gap-3">
        {/* User info */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#1C1917] flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-semibold">
              {(profile?.full_name || profile?.email || "U")[0].toUpperCase()}
            </span>
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-medium text-[#1C1917] leading-tight">
              {profile?.full_name || profile?.email?.split("@")[0] || "User"}
            </p>
            <p className="text-[10px] text-[#78716C] capitalize leading-tight">{profile?.role || "staff"}</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="text-xs text-[#78716C] hover:text-[#C0392B] transition-colors px-2 py-1"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
