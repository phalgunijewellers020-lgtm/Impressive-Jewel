import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useApp } from "../../context/AppContext";
import { PageHeader, Card, Table, Btn, Modal, Field, Input, Select } from "../UI";
import type { PolishRate, Item } from "../../types";

export default function PolishRates() {
  const { addToast } = useApp();
  const [rates, setRates] = useState<PolishRate[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editRate, setEditRate] = useState<PolishRate | null>(null);
  const [form, setForm] = useState({ item_id: "", loss_rate: "0", amount_rate: "0", effective_from: new Date().toISOString().slice(0, 10) });
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const [ratesRes, itemsRes] = await Promise.all([
      supabase.from("polish_rates").select("*, item:items(name,item_code)").order("created_at", { ascending: false }),
      supabase.from("items").select("*").eq("status", "active").order("name"),
    ]);
    setRates((ratesRes.data || []) as PolishRate[]);
    setItems((itemsRes.data || []) as Item[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function save() {
    setSaving(true);
    const payload = { item_id: form.item_id, loss_rate: Number(form.loss_rate), amount_rate: Number(form.amount_rate), effective_from: form.effective_from };
    let error;
    if (editRate) ({ error } = await supabase.from("polish_rates").update(payload).eq("id", editRate.id));
    else ({ error } = await supabase.from("polish_rates").insert(payload));
    if (error) addToast("error", "Unable to save rate.");
    else { addToast("success", "Rate saved."); setFormOpen(false); load(); }
    setSaving(false);
  }

  const COLUMNS = [
    { key: "item", label: "Item", render: (r: Record<string, unknown>) => { const item = r.item as { name: string; item_code: string } | null; return item ? `${item.name} (${item.item_code})` : "—"; } },
    { key: "loss_rate", label: "Loss Rate", render: (r: Record<string, unknown>) => <span className="font-mono-data">{Number(r.loss_rate).toFixed(4)}</span> },
    { key: "amount_rate", label: "Amount Rate (₹/g)", render: (r: Record<string, unknown>) => <span className="font-mono-data">{Number(r.amount_rate).toFixed(4)}</span> },
    { key: "effective_from", label: "Effective From" },
    { key: "_actions", label: "Actions", render: (r: Record<string, unknown>) => <button onClick={() => { setEditRate(r as unknown as PolishRate); setForm({ item_id: String(r.item_id), loss_rate: String(r.loss_rate), amount_rate: String(r.amount_rate), effective_from: String(r.effective_from) }); setFormOpen(true); }} className="text-xs text-[#B8952A] hover:underline">Edit</button> },
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="Rate Master — Polish" subtitle="Item-based polish rates" actions={<Btn onClick={() => { setEditRate(null); setForm({ item_id: "", loss_rate: "0", amount_rate: "0", effective_from: new Date().toISOString().slice(0, 10) }); setFormOpen(true); }}>+ Add Rate</Btn>} />
      <Card><Table columns={COLUMNS} data={rates as unknown as Record<string, unknown>[]} loading={loading} emptyMessage="No polish rates configured." /></Card>
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editRate ? "Edit Polish Rate" : "Add Polish Rate"}>
        <div className="space-y-4">
          <Field label="Item" required><Select value={form.item_id} onChange={(e) => setForm((f) => ({ ...f, item_id: e.target.value }))}><option value="">Select item…</option>{items.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}</Select></Field>
          <Field label="Loss Rate"><Input type="number" step="0.0001" value={form.loss_rate} onChange={(e) => setForm((f) => ({ ...f, loss_rate: e.target.value }))} /></Field>
          <Field label="Amount Rate (₹/g)"><Input type="number" step="0.01" value={form.amount_rate} onChange={(e) => setForm((f) => ({ ...f, amount_rate: e.target.value }))} /></Field>
          <Field label="Effective From"><Input type="date" value={form.effective_from} onChange={(e) => setForm((f) => ({ ...f, effective_from: e.target.value }))} /></Field>
          <div className="flex gap-2 justify-end pt-2 border-t border-[#E7E0D8]">
            <Btn variant="secondary" onClick={() => setFormOpen(false)}>Cancel</Btn>
            <Btn loading={saving} onClick={save} disabled={!form.item_id}>Save Rate</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
