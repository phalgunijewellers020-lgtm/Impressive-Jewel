import TransactionPage from "../Transactions/TransactionPage";

const COLUMNS = [
  { key: "date", label: "Date" },
  { key: "employee", label: "Employee", render: (r: Record<string, unknown>) => { const e = r.employee as { name: string } | null; return e?.name ?? "—"; } },
  { key: "item", label: "Item", render: (r: Record<string, unknown>) => { const i = r.item as { name: string } | null; return i?.name ?? "—"; } },
  { key: "wax_weight", label: "Wax Wt (g)", render: (r: Record<string, unknown>) => <span className="font-mono-data text-sm">{Number(r.wax_weight).toFixed(3)}</span> },
  { key: "wax_pieces", label: "Pieces" },
  { key: "stone_weight", label: "Stone Wt (g)", render: (r: Record<string, unknown>) => <span className="font-mono-data text-sm">{Number(r.stone_weight).toFixed(3)}</span> },
  { key: "stone_count", label: "Stone Ct" },
  { key: "setting_stone_count", label: "Setting Stone Ct" },
];

const FIELDS = [
  { key: "date", label: "Date", type: "date" as const, required: true },
  { key: "employee_id", label: "Employee", type: "employee" as const, required: true, department: "Wax / Setting" },
  { key: "item_id", label: "Item", type: "item" as const, required: true },
  { key: "wax_weight", label: "Return Wax Weight (g)", type: "number" as const, required: true, step: "0.001", min: "0" },
  { key: "wax_pieces", label: "Return Wax Pieces", type: "number" as const, step: "1", min: "0" },
  { key: "stone_weight", label: "Return Stone Weight (g)", type: "number" as const, step: "0.001", min: "0" },
  { key: "stone_count", label: "Return Stone Count", type: "number" as const, step: "1", min: "0" },
  { key: "setting_stone_count", label: "Setting Stone Count (per piece)", type: "number" as const, step: "1", min: "0" },
  { key: "notes", label: "Notes", type: "textarea" as const },
];

export default function WaxReturn() {
  return (
    <TransactionPage
      title="Wax / Stone Return"
      subtitle="Record wax and stones returned after setting"
      table="wax_return"
      selectQuery="*, employee:employees(name,employee_code), item:items(name)"
      columns={COLUMNS}
      fields={FIELDS}
      emptyMessage="No Wax/Stone Return records in the selected date range."
      emptyIcon="↓"
      module="wax"
    />
  );
}
