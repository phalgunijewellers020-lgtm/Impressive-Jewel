import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useApp } from "../../context/AppContext";
import { PageHeader, Card, CardHeader, Table, Btn, Modal, Field, Input, Select } from "../UI";
import type { FilingRate, Item } from "../../types";

export default function FilingRates() {
  const { addToast } = useApp();
  const [rates, setRates] = useState<FilingRate[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editRate, setEditRate] = useState<FilingRate | null>(null);
  const [form, setForm] = useState({ item_id: "", wastage_rate: "0.012", amount_rate: "2.5", effective_from: new Date().toISOString().slice(0, 10) });
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const [ratesRes, itemsRes] = await Promise.all([
      supabase.from("filing_rates").select("*, item:items(name,item_code)").order("created_at", { ascending: false }),
      supabase.from("items").select("*").eq("status", "active").order("name"),
    ]);
    setRates((ratesRes.data || []) as FilingRate[]);
    setItems((itemsRes.data || []) as Item[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openNew() {
    setEditRate(null);
    setForm({ item_id: "", wastage_rate: "0.012", amount_rate: "2.5", effective_from: new Date().toISOString().slice(0, 10) });
    setFormOpen(true);
  }

  function openEdit(rate: FilingRate) {
    setEditRate(rate);
    setForm({ item_id: rate.item_id, wastage_rate: String(rate.wastage_rate), amount_rate: String(rate.amount_rate), effective_from: rate.effective_from });
    setFormOpen(true);
  }

  async function save() {
    setSaving(true);
    const payload = { item_id: form.item_id, wastage_rate: Number(form.wastage_rate), amount_rate: Number(form.amount_rate), effective_from: form.effective_from };
    let error;
    if (editRate) {
      ({ error } = await supabase.from("filing_rates").update(payload).eq("id", editRate.id));
    } else {
      ({ error } = await supabase.from("filing_rates").insert(payload));
    }
    if (error) addToast("error", "Unable to save rate.");
    else { addToast("success", "Rate saved successfully."); setFormOpen(false); load(); }
    setSaving(false);
  }

  const COLUMNS = [
    { key: "item", label: "Item", render: (r: Record<string, unknown>) => { const item = r.item as { name: string; item_code: string } | null; return item ? `${item.name} (${item.item_code})` : "—"; } },
    { key: "wastage_rate", label: "Wastage Rate", render: (r: Record<string, unknown>) => <span className="font-mono-data">{Number(r.wastage_rate).toFixed(4)}</span> },
    { key: "amount_rate", label: "Amount Rate (₹/g)", render: (r: Record<string, unknown>) => <span className="font-mono-data">{Number(r.amount_rate).toFixed(4)}</span> },
    { key: "effective_from", label: "Effective From" },
    { key: "_actions", label: "Actions", render: (r: Record<string, unknown>) => <button onClick={() => openEdit(r as unknown as FilingRate)} className="text-xs text-[#B8952A] hover:underline">Edit</button> },
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="Rate Master — Filing" subtitle="Item-based filing rates" actions={<Btn onClick={openNew}>+ Add Rate</Btn>} />
      <div className="bg-[#F5EDD6] border border-[#E8D9A8] rounded-md px-4 py-3 text-xs text-[#78716C]">
        <strong>Note:</strong> Filing rates are item-based. The same item uses the same rate regardless of employee. Wastage formula: Return Weight × Rate. Amount: Return Weight × Amount Rate.
      </div>
      <Card>
        <Table columns={COLUMNS} data={rates as unknown as Record<string, unknown>[]} loading={loading} emptyMessage="No filing rates configured." />
      </Card>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editRate ? "Edit Filing Rate" : "Add Filing Rate"}>
        <div className="space-y-4">
          <Field label="Item" required>
            <Select value={form.item_id} onChange={(e) => setForm((f) => ({ ...f, item_id: e.target.value }))}>
              <option value="">Select item…</option>
              {items.map((i) => <option key={i.id} value={i.id}>{i.name} ({i.item_code})</option>)}
            </Select>
          </Field>
          <Field label="Wastage Rate (e.g. 0.012 = 1.2%)" required>
            <Input type="number" step="0.0001" value={form.wastage_rate} onChange={(e) => setForm((f) => ({ ...f, wastage_rate: e.target.value }))} />
          </Field>
          <Field label="Amount Rate (₹ per gram)" required>
            <Input type="number" step="0.01" value={form.amount_rate} onChange={(e) => setForm((f) => ({ ...f, amount_rate: e.target.value }))} />
          </Field>
          <Field label="Effective From">
            <Input type="date" value={form.effective_from} onChange={(e) => setForm((f) => ({ ...f, effective_from: e.target.value }))} />
          </Field>
          <div className="flex gap-2 justify-end pt-2 border-t border-[#E7E0D8]">
            <Btn variant="secondary" onClick={() => setFormOpen(false)}>Cancel</Btn>
            <Btn loading={saving} onClick={save} disabled={!form.item_id}>Save Rate</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
