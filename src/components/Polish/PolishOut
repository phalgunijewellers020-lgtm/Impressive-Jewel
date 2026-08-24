import TransactionPage from "../Transactions/TransactionPage";

const COLUMNS = [
  { key: "date", label: "Date" },
  { key: "employee", label: "Employee", render: (r: Record<string, unknown>) => { const e = r.employee as { name: string } | null; return e?.name ?? "—"; } },
  { key: "item", label: "Item", render: (r: Record<string, unknown>) => { const i = r.item as { name: string } | null; return i?.name ?? "—"; } },
  { key: "weight", label: "Weight (g)", render: (r: Record<string, unknown>) => <span className="font-mono-data text-sm">{Number(r.weight).toFixed(3)}</span> },
  { key: "pieces", label: "Pieces", render: (r: Record<string, unknown>) => r.pieces ?? "—" },
  { key: "notes", label: "Notes", render: (r: Record<string, unknown>) => <span className="text-[#78716C] text-xs">{String(r.notes || "—")}</span> },
];

const FIELDS = [
  { key: "date", label: "Date", type: "date" as const, required: true },
  { key: "employee_id", label: "Employee", type: "employee" as const, required: true, department: "Polish" },
  { key: "item_id", label: "Item", type: "item" as const, required: true },
  { key: "weight", label: "Weight (g)", type: "number" as const, required: true, step: "0.001", min: "0" },
  { key: "pieces", label: "Pieces", type: "number" as const, step: "1", min: "0" },
  { key: "notes", label: "Notes", type: "textarea" as const },
];

export default function PolishOut() {
  return (
    <TransactionPage
      title="Polish Out"
      subtitle="Record silver given out for polishing"
      table="polish_out"
      selectQuery="*, employee:employees(name,employee_code), item:items(name)"
      columns={COLUMNS}
      fields={FIELDS}
      emptyMessage="No Polish Out records."
      emptyIcon="◎"
      module="polish"
    />
  );
}
