import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useApp } from "../../context/AppContext";
import { PageHeader, Card, Table, Btn, SearchInput, Confirm, EmptyState, Modal, Field, Input, Select, Textarea } from "../UI";
import type { Employee, Item, WaxJobRate, StoneSize } from "../../types";
import { format } from "date-fns";

export default function WaxOut() {
  const { addToast, session } = useApp();
  const [records, setRecords] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [jobRates, setJobRates] = useState<WaxJobRate[]>([]);
  const [stoneSizes, setStoneSizes] = useState<StoneSize[]>([]);
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState(() => format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), "yyyy-MM-dd"));
  const [toDate, setToDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [formOpen, setFormOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<Record<string, unknown> | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ date: format(new Date(), "yyyy-MM-dd"), employee_id: "", item_id: "", wax_weight: "", wax_pieces: "", stone_weight: "0", stone_count: "0", stone_size_id: "", job_rate_id: "", notes: "" });

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("wax_out").select("*, employee:employees(name,employee_code), item:items(name), stone_size:stone_sizes(size_code,description), job_rate:wax_job_rates(category,rate)").gte("date", fromDate).lte("date", toDate).order("date", { ascending: false });
    setRecords(data || []);
    setLoading(false);
  }, [fromDate, toDate]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    supabase.from("employees").select("*").eq("status", "active").eq("department", "Wax / Setting").order("name").then(({ data }) => setEmployees(data || []));
    supabase.from("items").select("*").eq("status", "active").order("name").then(({ data }) => setItems(data || []));
    supabase.from("wax_job_rates").select("*").order("category").then(({ data }) => setJobRates(data || []));
    supabase.from("stone_sizes").select("*").eq("status", "active").order("size_code").then(({ data }) => setStoneSizes(data || []));
  }, []);

  function openNew() {
    setEditRecord(null);
    setForm({ date: format(new Date(), "yyyy-MM-dd"), employee_id: "", item_id: "", wax_weight: "", wax_pieces: "", stone_weight: "0", stone_count: "0", stone_size_id: "", job_rate_id: "", notes: "" });
    setFormOpen(true);
  }

  async function save() {
    if (!form.employee_id || !form.item_id || !form.wax_weight) { addToast("error", "Please fill required fields."); return; }
    setSaving(true);
    const payload = { date: form.date, employee_id: form.employee_id, item_id: form.item_id, wax_weight: Number(form.wax_weight), wax_pieces: Number(form.wax_pieces) || 0, stone_weight: Number(form.stone_weight) || 0, stone_count: Number(form.stone_count) || 0, stone_size_id: form.stone_size_id || null, job_rate_id: form.job_rate_id || null, notes: form.notes, created_by: session?.user.id };
    let error;
    if (editRecord) ({ error } = await supabase.from("wax_out").update(payload).eq("id", editRecord.id));
    else ({ error } = await supabase.from("wax_out").insert(payload));
    if (error) addToast("error", "Unable to save.");
    else { addToast("success", "Saved successfully."); setFormOpen(false); load(); }
    setSaving(false);
  }

  async function del(id: string) {
    const { error } = await supabase.from("wax_out").delete().eq("id", id);
    if (error) addToast("error", "Unable to delete.");
    else { addToast("success", "Deleted."); load(); }
  }

  const filtered = records.filter((r) => !search || JSON.stringify(r).toLowerCase().includes(search.toLowerCase()));

  const COLUMNS = [
    { key: "date", label: "Date" },
    { key: "employee", label: "Employee", render: (r: Record<string, unknown>) => { const e = r.employee as { name: string } | null; return e?.name ?? "—"; } },
    { key: "item", label: "Item", render: (r: Record<string, unknown>) => { const i = r.item as { name: string } | null; return i?.name ?? "—"; } },
    { key: "wax_weight", label: "Wax Wt (g)", render: (r: Record<string, unknown>) => <span className="font-mono-data text-sm">{Number(r.wax_weight).toFixed(3)}</span> },
    { key: "wax_pieces", label: "Pieces" },
    { key: "stone_weight", label: "Stone Wt (g)", render: (r: Record<string, unknown>) => <span className="font-mono-data text-sm">{Number(r.stone_weight).toFixed(3)}</span> },
    { key: "stone_count", label: "Stone Ct" },
    { key: "job_rate", label: "Job", render: (r: Record<string, unknown>) => { const jr = r.job_rate as { category: string } | null; return jr?.category ?? "—"; } },
    {
      key: "_actions", label: "Actions", render: (r: Record<string, unknown>) => (
        <div className="flex gap-1">
          <button onClick={() => { setEditRecord(r); setForm({ date: String(r.date), employee_id: String(r.employee_id), item_id: String(r.item_id), wax_weight: String(r.wax_weight), wax_pieces: String(r.wax_pieces || ""), stone_weight: String(r.stone_weight || "0"), stone_count: String(r.stone_count || "0"), stone_size_id: String(r.stone_size_id || ""), job_rate_id: String(r.job_rate_id || ""), notes: String(r.notes || "") }); setFormOpen(true); }} className="text-xs text-[#44403C] hover:bg-[#F0EBE3] px-2 py-1 rounded">Edit</button>
          <button onClick={() => setDeleteId(String(r.id))} className="text-xs text-[#C0392B] hover:bg-[#FEE2E2] px-2 py-1 rounded">Delete</button>
        </div>
      ),
    },
  ];

  const f = (key: keyof typeof form) => form[key];
  const s = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm((v) => ({ ...v, [key]: e.target.value }));

  return (
    <div className="space-y-4">
      <PageHeader title="Wax / Stone Out" subtitle="Record wax and stones given out for setting" actions={<Btn onClick={openNew}>+ New Entry</Btn>} />
      <div className="flex flex-wrap gap-2">
        <SearchInput value={search} onChange={setSearch} />
        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="px-2 py-2 text-sm rounded-md border border-[#E7E0D8] bg-white focus:outline-none focus:ring-1 focus:ring-[#B8952A]" />
        <span className="text-xs text-[#78716C] self-center">to</span>
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="px-2 py-2 text-sm rounded-md border border-[#E7E0D8] bg-white focus:outline-none focus:ring-1 focus:ring-[#B8952A]" />
        <Btn variant="secondary" size="sm" onClick={load}>↻</Btn>
      </div>
      <Card>
        {filtered.length === 0 && !loading ? (
          <EmptyState icon="◈" message="No Wax/Stone Out records." action={<Btn onClick={openNew}>+ Add Entry</Btn>} />
        ) : (
          <Table columns={COLUMNS} data={filtered} loading={loading} />
        )}
      </Card>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editRecord ? "Edit Wax/Stone Out" : "New Wax/Stone Out"} size="xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Date" required><Input type="date" value={f("date")} onChange={s("date")} /></Field>
          <Field label="Employee" required><Select value={f("employee_id")} onChange={s("employee_id")}><option value="">Select…</option>{employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}</Select></Field>
          <Field label="Item" required><Select value={f("item_id")} onChange={s("item_id")}><option value="">Select…</option>{items.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}</Select></Field>
          <Field label="Job Rate"><Select value={f("job_rate_id")} onChange={s("job_rate_id")}><option value="">None</option>{jobRates.map((jr) => <option key={jr.id} value={jr.id}>{jr.category} (₹{jr.rate})</option>)}</Select></Field>
          <Field label="Wax Weight (g)" required><Input type="number" step="0.001" min="0" value={f("wax_weight")} onChange={s("wax_weight")} /></Field>
          <Field label="Wax Pieces"><Input type="number" step="1" min="0" value={f("wax_pieces")} onChange={s("wax_pieces")} /></Field>
          <Field label="Stone Weight (g)"><Input type="number" step="0.001" min="0" value={f("stone_weight")} onChange={s("stone_weight")} /></Field>
          <Field label="Stone Count"><Input type="number" step="1" min="0" value={f("stone_count")} onChange={s("stone_count")} /></Field>
          <Field label="Stone Size"><Select value={f("stone_size_id")} onChange={s("stone_size_id")}><option value="">None</option>{stoneSizes.map((ss) => <option key={ss.id} value={ss.id}>{ss.size_code} {ss.description ? `— ${ss.description}` : ""}</option>)}</Select></Field>
          <Field label="Notes"><Textarea value={f("notes")} onChange={s("notes")} /></Field>
        </div>
        <div className="flex gap-2 justify-end pt-4 mt-2 border-t border-[#E7E0D8]">
          <Btn variant="secondary" onClick={() => setFormOpen(false)}>Cancel</Btn>
          <Btn loading={saving} onClick={save}>Save</Btn>
        </div>
      </Modal>

      <Confirm open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && del(deleteId)} title="Delete Record" message="Delete this wax/stone out record?" confirmLabel="Delete" danger />
    </div>
  );
}
