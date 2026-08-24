export type UserRole = "admin" | "staff";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  mobile_number?: string;
  status: "active" | "inactive";
}

export interface UserPermission {
  id: string;
  user_id: string;
  module: string;
  action: string;
}

export interface CompanySettings {
  id: string;
  company_name: string;
  address: string;
  city: string;
  state: string;
  pin_code: string;
  contact_number: string;
  alternate_contact: string;
  email: string;
  website: string;
  gst_number: string;
  business_reg_number: string;
  additional_info: string;
  logo_url: string;
}

export interface Employee {
  id: string;
  employee_code: string;
  name: string;
  contact_number: string;
  joining_date: string;
  status: "active" | "inactive";
  address: string;
  notes: string;
  department?: string;
}

export interface Item {
  id: string;
  item_code: string;
  name: string;
  status: "active" | "inactive";
}

export interface FilingRate {
  id: string;
  item_id: string;
  wastage_rate: number;
  amount_rate: number;
  effective_from: string;
  item?: Item;
}

export interface FilingOut {
  id: string;
  date: string;
  employee_id: string;
  item_id: string;
  weight: number;
  pieces: number;
  notes: string;
  employee?: Employee;
  item?: Item;
}

export interface FilingReturn {
  id: string;
  date: string;
  employee_id: string;
  item_id: string;
  weight: number;
  pieces: number;
  notes: string;
  employee?: Employee;
  item?: Item;
}

export interface WaxJobRate {
  id: string;
  category: string;
  rate: number;
  description: string;
}

export interface StoneSize {
  id: string;
  size_code: string;
  description: string;
  status: string;
}

export interface WaxOut {
  id: string;
  date: string;
  employee_id: string;
  item_id: string;
  wax_weight: number;
  wax_pieces: number;
  stone_weight: number;
  stone_count: number;
  stone_size_id: string;
  setting_category: string;
  job_rate_id: string;
  notes: string;
  employee?: Employee;
  item?: Item;
  stone_size?: StoneSize;
  job_rate?: WaxJobRate;
}

export interface WaxReturn {
  id: string;
  date: string;
  employee_id: string;
  item_id: string;
  wax_weight: number;
  wax_pieces: number;
  stone_weight: number;
  stone_count: number;
  setting_stone_count: number;
  notes: string;
  employee?: Employee;
  item?: Item;
}

export interface PolishRate {
  id: string;
  item_id: string;
  loss_rate: number;
  amount_rate: number;
  effective_from: string;
  item?: Item;
}

export interface PolishOut {
  id: string;
  date: string;
  employee_id: string;
  item_id: string;
  weight: number;
  pieces: number;
  notes: string;
  employee?: Employee;
  item?: Item;
}

export interface PolishReturn {
  id: string;
  date: string;
  employee_id: string;
  item_id: string;
  weight: number;
  pieces: number;
  notes: string;
  employee?: Employee;
  item?: Item;
}

export interface MachinePolishOut {
  id: string;
  date: string;
  employee_id: string;
  item_id: string;
  weight: number;
  pieces: number;
  notes: string;
  employee?: Employee;
  item?: Item;
}

export interface MachinePolishReturn {
  id: string;
  date: string;
  employee_id: string;
  item_id: string;
  weight: number;
  pieces: number;
  notes: string;
  employee?: Employee;
  item?: Item;
}

// ---- Calculation Results ----

export interface FilingCalculation {
  employee_id: string;
  employee_name: string;
  filing_out_weight: number;
  filing_return_weight: number;
  adjusted_return_weight: number;
  loss_as_filing: number;
  wastage: number;
  balance_silver: number;
  amount_payable: number;
}

export interface WaxCalculation {
  employee_id: string;
  employee_name: string;
  outward_wax_weight: number;
  return_wax_weight: number;
  outward_stone_weight: number;
  return_stone_weight: number;
  outward_stone_count: number;
  return_stone_count: number;
  return_wax_pieces: number;
  setting_stone_count: number;
  total_setting_count: number;
  amount: number;
  net_stone_weight: number;
  net_stone_count: number;
  inwards: number;
  outwards: number;
  dispute_weight: number;
}

export interface PolishCalculation {
  employee_id: string;
  employee_name: string;
  polish_out_weight: number;
  polish_return_weight: number;
  balance_silver: number;
  amount_payable: number;
}

export interface MachinePolishCalculation {
  employee_id: string;
  employee_name: string;
  machine_polish_out_weight: number;
  machine_polish_return_weight: number;
  machine_polish_loss: number;
}

export interface DashboardSummary {
  filing: {
    out: number;
    return: number;
    loss: number;
    wastage: number;
    balance_silver: number;
    amount_payable: number;
  };
  wax: {
    out_weight: number;
    return_weight: number;
    stone_weight: number;
    stone_pieces: number;
    setting_count: number;
    net_stone_weight: number;
    net_stone_count: number;
    dispute_weight: number;
    amount_payable: number;
  };
  polish: {
    out: number;
    return: number;
    balance_silver: number;
    loss: number;
    amount_payable: number;
  };
  machine_polish: {
    out: number;
    return: number;
    loss: number;
  };
}

export type DateFilter =
  | "today"
  | "yesterday"
  | "this_week"
  | "this_month"
  | "prev_month"
  | "custom";

export interface DateRange {
  from: string;
  to: string;
}

export type NavPage =
  | "dashboard"
  | "employee-list"
  | "employee-add"
  | "employee-profile"
  | "filing-out"
  | "filing-return"
  | "filing-calc"
  | "filing-report"
  | "filing-rates"
  | "wax-out"
  | "wax-return"
  | "wax-calc"
  | "wax-report"
  | "wax-job-rates"
  | "stone-sizes"
  | "polish-out"
  | "polish-return"
  | "polish-calc"
  | "polish-report"
  | "polish-rates"
  | "machine-polish"
  | "settings-users"
  | "settings-items"
  | "settings-system"
  | "about";

export interface Toast {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
}
