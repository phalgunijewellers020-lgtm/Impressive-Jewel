import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useApp } from "../../context/AppContext";
import { PageHeader, Card, Table, Btn, Modal, Field, Input, Textarea, Badge } from "../UI";
import type { StoneSize } from "../../types";

export default function StoneSizes() {
  const { addToast } = useApp();
  const [sizes, setSizes] = useState<StoneSize[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editSize, setEditSize] = useState<StoneSize | null>(null);
  const [form, setForm] = useState({ size_code: "", description: "", status: "active" });
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("stone_sizes").select("*").order("size_code");
    setSizes(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function save() {
    if (!form.size_code) { addToast("error", "Size code is required."); return; }
    setSaving(true);
    let error;
    if (editSize) ({ error } = await supabase.from("stone_sizes").update(form).eq("id", editSize.id));
    else ({ error } = await supabase.from("stone_sizes").insert(form));
    if (error) addToast("error", `Unable to save: ${error.message}`);
    else { addToast("success", "Stone size saved."); setFormOpen(false); load(); }
    setSaving(false);
  }

  const COLUMNS = [
    { key: "size_code", label: "Size Code" },
    { key: "description", label: "Description", render: (r: Record<string, unknown>) => r.description as string || "—" },
    { key: "status", label: "Status", render: (r: Record<string, unknown>) => <Badge variant={r.status === "active" ? "success" : "neutral"}>{r.status as string}</Badge> },
    { key: "_actions", label: "Actions", render: (r: Record<string, unknown>) => <button onClick={() => { const s = r as unknown as StoneSize; setEditSize(s); setForm({ size_code: s.size_code, description: s.description || "", status: s.status }); setFormOpen(true); }} className="text-xs text-[#B8952A] hover:underline">Edit</button> },
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="Stone Size Master" actions={<Btn onClick={() => { setEditSize(null); setForm({ size_code: "", description: "", status: "active" }); setFormOpen(true); }}>+ Add Size</Btn>} />
      <Card><Table columns={COLUMNS} data={sizes as unknown as Record<string, unknown>[]} loading={loading} emptyMessage="No stone sizes configured." /></Card>
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editSize ? "Edit Stone Size" : "Add Stone Size"}>
        <div className="space-y-4">
          <Field label="Size Code" required><Input value={form.size_code} onChange={(e) => setForm((f) => ({ ...f, size_code: e.target.value }))} placeholder="e.g. 1.25mm" /></Field>
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
