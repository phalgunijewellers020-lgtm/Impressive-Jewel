import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useApp } from "../../context/AppContext";
import { PageHeader, Card, Table, Btn, Modal, Field, Input, Textarea } from "../UI";
import type { WaxJobRate } from "../../types";

export default function WaxJobRates() {
  const { addToast } = useApp();
  const [rates, setRates] = useState<WaxJobRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editRate, setEditRate] = useState<WaxJobRate | null>(null);
  const [form, setForm] = useState({ category: "", rate: "0.10", description: "" });
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("wax_job_rates").select("*").order("category");
    setRates(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openEdit(rate: WaxJobRate) {
    setEditRate(rate);
    setForm({ category: rate.category, rate: String(rate.rate), description: rate.description || "" });
    setFormOpen(true);
  }

  async function save() {
    setSaving(true);
    const payload = { category: form.category, rate: Number(form.rate), description: form.description };
    let error;
    if (editRate) ({ error } = await supabase.from("wax_job_rates").update(payload).eq("id", editRate.id));
    else ({ error } = await supabase.from("wax_job_rates").insert(payload));
    if (error) addToast("error", "Unable to save rate.");
    else { addToast("success", "Rate saved."); setFormOpen(false); load(); }
    setSaving(false);
  }

  const COLUMNS = [
    { key: "category", label: "Category" },
    { key: "rate", label: "Rate (₹ per stone)", render: (r: Record<string, unknown>) => <span className="font-mono-data">{Number(r.rate).toFixed(4)}</span> },
    { key: "description", label: "Description" },
    { key: "_actions", label: "Actions", render: (r: Record<string, unknown>) => <button onClick={() => openEdit(r as unknown as WaxJobRate)} className="text-xs text-[#B8952A] hover:underline">Edit</button> },
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="Job Rate Master — Wax / Setting" subtitle="Setting category rates" actions={<Btn onClick={() => { setEditRate(null); setForm({ category: "", rate: "0.10", description: "" }); setFormOpen(true); }}>+ Add Rate</Btn>} />
      <div className="bg-[#F5EDD6] border border-[#E8D9A8] rounded-md px-4 py-3 text-xs text-[#78716C]">
        <strong>Default rates:</strong> Setting &amp; Tatal = ₹0.10 | Only Setting = ₹0.05 | Only Tatal = ₹0.05. These are configurable per business requirement.
      </div>
      <Card><Table columns={COLUMNS} data={rates as unknown as Record<string, unknown>[]} loading={loading} /></Card>
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editRate ? "Edit Job Rate" : "Add Job Rate"}>
        <div className="space-y-4">
          <Field label="Category" required><Input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} placeholder="e.g. Setting &amp; Tatal" /></Field>
          <Field label="Rate (₹ per stone)" required><Input type="number" step="0.0001" value={form.rate} onChange={(e) => setForm((f) => ({ ...f, rate: e.target.value }))} /></Field>
          <Field label="Description"><Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></Field>
          <div className="flex gap-2 justify-end pt-2 border-t border-[#E7E0D8]">
            <Btn variant="secondary" onClick={() => setFormOpen(false)}>Cancel</Btn>
            <Btn loading={saving} onClick={save}>Save</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
