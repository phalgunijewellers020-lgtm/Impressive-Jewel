import TransactionPage from "../Transactions/TransactionPage";

const COLUMNS = [
  { key: "date", label: "Date" },
  {
    key: "employee",
    label: "Employee",
    render: (r: Record<string, unknown>) => {
      const emp = r.employee as { name: string; employee_code: string } | null;
      return emp ? `${emp.name} (${emp.employee_code})` : "—";
    },
  },
  {
    key: "item",
    label: "Item",
    render: (r: Record<string, unknown>) => {
      const item = r.item as { name: string } | null;
      return item?.name ?? "—";
    },
  },
  {
    key: "weight",
    label: "Return Weight (g)",
    render: (r: Record<string, unknown>) => (
      <span className="font-mono-data text-sm">{Number(r.weight).toFixed(3)}</span>
    ),
  },
  { key: "pieces", label: "Pieces", render: (r: Record<string, unknown>) => r.pieces ?? "—" },
  {
    key: "notes",
    label: "Notes",
    render: (r: Record<string, unknown>) => (
      <span className="text-[#78716C] text-xs">{String(r.notes || "—")}</span>
    ),
  },
];

const FIELDS = [
  { key: "date", label: "Date", type: "date" as const, required: true },
  { key: "employee_id", label: "Employee", type: "employee" as const, required: true, department: "Filing" },
  { key: "item_id", label: "Item", type: "item" as const, required: true },
  { key: "weight", label: "Return Weight (g)", type: "number" as const, required: true, step: "0.001", min: "0" },
  { key: "pieces", label: "Pieces", type: "number" as const, step: "1", min: "0" },
  { key: "notes", label: "Notes", type: "textarea" as const },
];

export default function FilingReturn() {
  return (
    <TransactionPage
      title="Filing Return"
      subtitle="Record silver returned after filing"
      table="filing_return"
      selectQuery="*, employee:employees(name,employee_code), item:items(name)"
      columns={COLUMNS}
      fields={FIELDS}
      emptyMessage="No Filing Return records in the selected date range."
      emptyIcon="↓"
      module="filing"
    />
  );
}
