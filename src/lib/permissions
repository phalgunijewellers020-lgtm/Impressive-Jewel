export type ActionType = "view" | "add" | "edit" | "delete" | "export" | "print";

export interface ModuleDef {
  id: string;
  label: string;
  actions: ActionType[];
}

export const MODULES: ModuleDef[] = [
  { id: "dashboard", label: "Dashboard", actions: ["view"] },
  { id: "employees", label: "Employees", actions: ["view", "add", "edit", "delete"] },
  { id: "filing", label: "Filing", actions: ["view", "add", "edit", "delete", "export", "print"] },
  { id: "wax", label: "Wax / Setting", actions: ["view", "add", "edit", "delete", "export", "print"] },
  { id: "polish", label: "Polish", actions: ["view", "add", "edit", "delete", "export", "print"] },
  { id: "machine_polish", label: "Machine Polish", actions: ["view", "add", "edit", "delete"] },
  { id: "reports", label: "Reports", actions: ["view", "export", "print"] },
  { id: "rate_masters", label: "Rate Masters", actions: ["view", "add", "edit", "delete"] },
  { id: "settings", label: "Settings", actions: ["view", "edit"] },
  { id: "user_management", label: "User Management", actions: ["view", "add", "edit", "delete"] },
  { id: "company_settings", label: "Company Settings", actions: ["view", "edit"] },
  { id: "audit_logs", label: "Audit Logs", actions: ["view"] },
];

export const ACTION_LABELS: Record<ActionType, string> = {
  view: "View",
  add: "Add",
  edit: "Edit",
  delete: "Delete",
  export: "Export",
  print: "Print",
};

export function permKey(module: string, action: string): string {
  return `${module}:${action}`;
}

export function buildPermSet(rows: { module: string; action: string }[]): Set<string> {
  return new Set(rows.map((r) => permKey(r.module, r.action)));
}

/** Pages that require no permission (everyone who is logged in can see) */
export const UNGUARDED_PAGES = new Set(["about"]);

/** Map each NavPage to which module + action it requires */
export const PAGE_MODULE_MAP: Record<string, { module: string; action: ActionType }> = {
  dashboard: { module: "dashboard", action: "view" },
  "employee-list": { module: "employees", action: "view" },
  "employee-add": { module: "employees", action: "add" },
  "employee-profile": { module: "employees", action: "view" },
  "filing-out": { module: "filing", action: "view" },
  "filing-return": { module: "filing", action: "view" },
  "filing-calc": { module: "filing", action: "view" },
  "filing-report": { module: "reports", action: "view" },
  "filing-rates": { module: "rate_masters", action: "view" },
  "wax-out": { module: "wax", action: "view" },
  "wax-return": { module: "wax", action: "view" },
  "wax-calc": { module: "wax", action: "view" },
  "wax-report": { module: "reports", action: "view" },
  "wax-job-rates": { module: "rate_masters", action: "view" },
  "stone-sizes": { module: "rate_masters", action: "view" },
  "polish-out": { module: "polish", action: "view" },
  "polish-return": { module: "polish", action: "view" },
  "polish-calc": { module: "polish", action: "view" },
  "polish-report": { module: "reports", action: "view" },
  "polish-rates": { module: "rate_masters", action: "view" },
  "machine-polish": { module: "machine_polish", action: "view" },
  "settings-users": { module: "user_management", action: "view" },
  "settings-items": { module: "settings", action: "view" },
  "settings-system": { module: "company_settings", action: "view" },
};
