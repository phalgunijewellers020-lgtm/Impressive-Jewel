import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useApp } from "../../context/AppContext";
import {
  PageHeader, Card, Table, Btn, Badge, SearchInput, Confirm, EmptyState,
} from "../UI";
import { TransactionForm } from "./TransactionForm";
import { format } from "date-fns";

interface Column {
  key: string;
  label: string;
  render?: (row: Record<string, unknown>) => React.ReactNode;
}

interface FieldDef {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "employee" | "item" | "select" | "textarea";
  required?: boolean;
  options?: { value: string; label: string }[];
  step?: string;
  min?: string;
}

interface TransactionPageProps {
  title: string;
  subtitle?: string;
  table: string;
  selectQuery: string;
  columns: Column[];
  fields: FieldDef[];
  emptyMessage?: string;
  emptyIcon?: string;
  /** Permission module name for action-level checks (e.g. "filing", "wax") */
  module?: string;
}

export default function TransactionPage({
  title,
  subtitle,
  table,
  selectQuery,
  columns,
  fields,
  emptyMessage = "No records found.",
  emptyIcon = "📋",
  module,
}: TransactionPageProps) {
  const { addToast, can } = useApp();
  const [records, setRecords] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    return format(new Date(d.getFullYear(), d.getMonth(), 1), "yyyy-MM-dd");
  });
  const [toDate, setToDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [formOpen, setFormOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<Record<string, unknown> | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const canAdd = !module || can(module, "add");
  const canEdit = !module || can(module, "edit");
  const canDelete = !module || can(module, "delete");

  const loadData = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from(table)
      .select(selectQuery)
      .gte("date", fromDate)
      .lte("date", toDate)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      addToast("error", "Unable to load data. Please try again.");
    } else {
      setRecords(data || []);
    }
    setLoading(false);
  }, [table, selectQuery, fromDate, toDate, addToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleDelete(id: string) {
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) {
      addToast("error", "Unable to delete transaction.");
    } else {
      addToast("success", "Transaction deleted successfully.");
      loadData();
    }
  }

  const filtered = records.filter((r) => {
    if (!search) return true;
    const haystack = Object.values(r).join(" ").toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  const actionColumn: Column = {
    key: "_actions",
    label: "Actions",
    render: (row) => (
      <div className="flex gap-1">
        {canEdit && (
          <button
            onClick={() => { setEditRecord(row); setFormOpen(true); }}
            className="px-2 py-1 text-xs text-[#44403C] hover:bg-[#F0EBE3] rounded transition-colors"
          >
            Edit
          </button>
        )}
        {canDelete && (
          <button
            onClick={() => setDeleteId(String(row.id))}
            className="px-2 py-1 text-xs text-[#C0392B] hover:bg-[#FEE2E2] rounded transition-colors"
          >
            Delete
          </button>
        )}
        {!canEdit && !canDelete && (
          <span className="text-xs text-[#A8A29E] px-2 py-1">View only</span>
        )}
      </div>
    ),
  };

  const fullColumns: Column[] = [...columns, actionColumn];

  return (
    <div className="space-y-4">
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={
          canAdd ? (
            <Btn onClick={() => { setEditRecord(null); setFormOpen(true); }}>
              + New Entry
            </Btn>
          ) : undefined
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <SearchInput value={search} onChange={setSearch} placeholder="Search records…" />
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="px-2 py-2 text-sm rounded-md border border-[#E7E0D8] bg-white focus:outline-none focus:ring-1 focus:ring-[#B8952A]"
        />
        <span className="text-xs text-[#78716C]">to</span>
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="px-2 py-2 text-sm rounded-md border border-[#E7E0D8] bg-white focus:outline-none focus:ring-1 focus:ring-[#B8952A]"
        />
        <Btn variant="secondary" size="sm" onClick={loadData}>↻ Refresh</Btn>
        <span className="text-xs text-[#78716C] ml-auto">{filtered.length} records</span>
      </div>

      <Card>
        {filtered.length === 0 && !loading ? (
          <EmptyState
            icon={emptyIcon}
            message={emptyMessage}
            action={
              canAdd ? (
                <Btn onClick={() => { setEditRecord(null); setFormOpen(true); }}>
                  + Add First Entry
                </Btn>
              ) : undefined
            }
          />
        ) : (
          <Table
            columns={fullColumns}
            data={filtered}
            loading={loading}
            emptyMessage={emptyMessage}
          />
        )}
      </Card>

      {(canAdd || canEdit) && (
        <TransactionForm
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onSaved={loadData}
          table={table}
          title={editRecord ? `Edit ${title}` : `New ${title}`}
          fields={fields}
          editRecord={editRecord}
        />
      )}

      <Confirm
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This action cannot be undone."
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
