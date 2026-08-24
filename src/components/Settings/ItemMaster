import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useApp } from "../../context/AppContext";
import { PageHeader, Card, Table, Btn, Badge, Modal, Field, Input, SearchInput } from "../UI";
import type { Item } from "../../types";

export default function ItemMaster() {
  const { addToast } = useApp();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<Item | null>(null);
  const [form, setForm] = useState({ item_code: "", name: "", status: "active" as "active" | "inactive" });
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("items").select("*").order("name");
    setItems(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function save() {
    if (!form.item_code || !form.name) { addToast("error", "Item code and name are required."); return; }
    setSaving(true);
    let error;
    if (editItem) ({ error } = await supabase.from("items").update(form).eq("id", editItem.id));
    else ({ error } = await supabase.from("items").insert(form));
    if (error) addToast("error", `Unable to save: ${error.message}`);
    else { addToast("success", "Item saved."); setFormOpen(false); load(); }
    setSaving(false);
  }

  async function toggleStatus(item: Item) {
    const { error } = await supabase.from("items").update({ status: item.status === "active" ? "inactive" : "active" }).eq("id", item.id);
    if (error) addToast("error", "Unable to update status.");
    else { addToast("success", "Status updated."); load(); }
  }

  const filtered = items.filter((i) => !search || `${i.name} ${i.item_code}`.toLowerCase().includes(search.toLowerCase()));

  const COLUMNS = [
    { key: "item_code", label: "Code" },
    { key: "name", label: "Item Name" },
    { key: "status", label: "Status", render: (r: Record<string, unknown>) => <Badge variant={r.status === "active" ? "success" : "neutral"}>{r.status as string}</Badge> },
    {
      key: "_actions", label: "Actions", render: (r: Record<string, unknown>) => {
        const item = r as unknown as Item;
        return (
          <div className="flex gap-1">
            <button onClick={() => { setEditItem(item); setForm({ item_code: item.item_code, name: item.name, status: item.status }); setFormOpen(true); }} className="text-xs text-[#44403C] hover:bg-[#F0EBE3] px-2 py-1 rounded">Edit</button>
            <button onClick={() => toggleStatus(item)} className="text-xs text-[#B45309] hover:bg-[#FEF3C7] px-2 py-1 rounded">{item.status === "active" ? "Deactivate" : "Activate"}</button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Item Master" subtitle="Manage jewellery items" actions={<Btn onClick={() => { setEditItem(null); setForm({ item_code: "", name: "", status: "active" }); setFormOpen(true); }}>+ Add Item</Btn>} />
      <div className="flex gap-2"><SearchInput value={search} onChange={setSearch} placeholder="Search items…" /></div>
      <Card><Table columns={COLUMNS} data={filtered as unknown as Record<string, unknown>[]} loading={loading} emptyMessage="No items found." /></Card>
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editItem ? "Edit Item" : "Add Item"}>
        <div className="space-y-4">
          <Field label="Item Code" required><Input value={form.item_code} onChange={(e) => setForm((f) => ({ ...f, item_code: e.target.value }))} placeholder="e.g. RING-001" /></Field>
          <Field label="Item Name" required><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Gold Ring" /></Field>
          <div className="flex gap-2 justify-end pt-2 border-t border-[#E7E0D8]">
            <Btn variant="secondary" onClick={() => setFormOpen(false)}>Cancel</Btn>
            <Btn loading={saving} onClick={save}>Save</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
