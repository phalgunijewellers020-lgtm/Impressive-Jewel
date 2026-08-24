import { useState } from "react";
import { useApp } from "../../context/AppContext";
import type { NavPage } from "../../types";

interface NavItem {
  id: string;
  label: string;
  icon: string;
  page?: NavPage;
  module?: string; // permission module for view-access check
  children?: { label: string; page: NavPage; module?: string }[];
}

const NAV: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: "⊞", page: "dashboard", module: "dashboard" },
  {
    id: "employees",
    label: "Employees",
    icon: "◎",
    module: "employees",
    children: [
      { label: "Employee List", page: "employee-list", module: "employees" },
      { label: "Add Employee", page: "employee-add", module: "employees" },
    ],
  },
  {
    id: "filing",
    label: "Filing",
    icon: "◧",
    module: "filing",
    children: [
      { label: "Filing Out", page: "filing-out", module: "filing" },
      { label: "Filing Return", page: "filing-return", module: "filing" },
      { label: "Employee Calculation", page: "filing-calc", module: "filing" },
      { label: "Monthly Report", page: "filing-report", module: "reports" },
      { label: "Rate Master", page: "filing-rates", module: "rate_masters" },
    ],
  },
  {
    id: "wax",
    label: "Wax / Setting",
    icon: "◈",
    module: "wax",
    children: [
      { label: "Wax / Stone Out", page: "wax-out", module: "wax" },
      { label: "Wax / Stone Return", page: "wax-return", module: "wax" },
      { label: "Employee Calculation", page: "wax-calc", module: "wax" },
      { label: "Monthly Report", page: "wax-report", module: "reports" },
      { label: "Job Rate Master", page: "wax-job-rates", module: "rate_masters" },
      { label: "Stone Size Master", page: "stone-sizes", module: "rate_masters" },
    ],
  },
  {
    id: "polish",
    label: "Polish",
    icon: "◎",
    module: "polish",
    children: [
      { label: "Polish Out", page: "polish-out", module: "polish" },
      { label: "Polish Return", page: "polish-return", module: "polish" },
      { label: "Employee Calculation", page: "polish-calc", module: "polish" },
      { label: "Monthly Report", page: "polish-report", module: "reports" },
      { label: "Rate Master", page: "polish-rates", module: "rate_masters" },
      { label: "Machine Polish", page: "machine-polish", module: "machine_polish" },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    icon: "⚙",
    module: "settings",
    children: [
      { label: "User Management", page: "settings-users", module: "user_management" },
      { label: "Item Master", page: "settings-items", module: "settings" },
      { label: "System Settings", page: "settings-system", module: "company_settings" },
    ],
  },
  { id: "about", label: "About", icon: "ℹ", page: "about" },
];

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ collapsed, mobileOpen, onMobileClose }: SidebarProps) {
  const { currentPage, navigate, signOut, profile, can } = useApp();
  const [openMenus, setOpenMenus] = useState<Set<string>>(new Set(["filing"]));

  function toggleMenu(id: string) {
    setOpenMenus((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleNavClick(page: NavPage) {
    navigate(page);
    onMobileClose();
  }

  const isChildActive = (item: NavItem) =>
    item.children?.some((c) => c.page === currentPage);

  // Permission check: no module = always visible (e.g. About)
  function canSeeItem(module?: string): boolean {
    if (!module) return true;
    return can(module, "view");
  }

  const sidebarContent = (
    <div className="flex flex-col h-full" style={{ background: "#1C1917" }}>
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-[#292524] shrink-0 ${collapsed ? "justify-center" : ""}`}>
        <div className="w-8 h-8 rounded flex items-center justify-center shrink-0" style={{ background: "#B8952A" }}>
          <span className="text-white text-sm">◈</span>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm truncate">Jewel Factory</p>
            <p className="text-[#78716C] text-xs truncate">{profile?.role === "admin" ? "Administrator" : "Staff"}</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {NAV.map((item) => {
          // Top-level items: check if the item or any of its visible children are accessible
          if (!item.children) {
            if (!canSeeItem(item.module)) return null;
            const isActive = item.page === currentPage;
            return (
              <button
                key={item.id}
                onClick={() => item.page && handleNavClick(item.page)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors mb-0.5 ${
                  isActive
                    ? "bg-[#B8952A] text-white"
                    : "text-[#A8A29E] hover:bg-[#292524] hover:text-white"
                } ${collapsed ? "justify-center" : ""}`}
              >
                <span className="text-base shrink-0">{item.icon}</span>
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          }

          // Group items: filter visible children
          const visibleChildren = item.children.filter((c) => canSeeItem(c.module));
          // Also show the group if the parent module itself is visible (even if no children pass)
          if (visibleChildren.length === 0 && !canSeeItem(item.module)) return null;
          // If no visible children but parent is visible, still show collapsed icon for desktop
          const isActive = item.page === currentPage || isChildActive(item);
          const isOpen = openMenus.has(item.id);

          return (
            <div key={item.id} className="mb-0.5">
              <button
                onClick={() => toggleMenu(item.id)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                  isActive
                    ? "bg-[#292524] text-white"
                    : "text-[#A8A29E] hover:bg-[#292524] hover:text-white"
                } ${collapsed ? "justify-center" : ""}`}
              >
                <span className="text-base shrink-0">{item.icon}</span>
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left truncate">{item.label}</span>
                    <span
                      className="text-xs shrink-0 transition-transform duration-200"
                      style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }}
                    >
                      ›
                    </span>
                  </>
                )}
              </button>

              {!collapsed && visibleChildren.length > 0 && (
                <div
                  className="accordion-content overflow-hidden"
                  style={{ maxHeight: isOpen ? `${visibleChildren.length * 36 + 8}px` : "0px" }}
                >
                  <div className="ml-7 mt-1 space-y-0.5">
                    {visibleChildren.map((child) => (
                      <button
                        key={child.page}
                        onClick={() => handleNavClick(child.page)}
                        className={`w-full text-left px-3 py-1.5 rounded-md text-xs transition-colors ${
                          currentPage === child.page
                            ? "text-[#B8952A] bg-[#292524] font-medium"
                            : "text-[#78716C] hover:text-white hover:bg-[#292524]"
                        }`}
                      >
                        {child.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-2 py-3 border-t border-[#292524] shrink-0">
        <button
          onClick={signOut}
          title={collapsed ? "Logout" : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-[#78716C] hover:bg-[#292524] hover:text-white transition-colors ${collapsed ? "justify-center" : ""}`}
        >
          <span className="text-base shrink-0">⏻</span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div
        className={`hidden lg:flex flex-col sidebar-transition shrink-0 ${collapsed ? "w-16" : "w-60"}`}
        style={{ height: "100vh", position: "sticky", top: 0 }}
      >
        {sidebarContent}
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/50" onClick={onMobileClose} />
          <div className="relative w-60 z-50 sidebar-transition">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
