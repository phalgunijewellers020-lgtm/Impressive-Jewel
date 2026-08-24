import { useState, useEffect, type FormEvent } from "react";
import { supabase } from "../../lib/supabase";
import { useApp } from "../../context/AppContext";
import { Field, Input, Select, Textarea, Btn, Modal } from "../UI";
import type { Employee, Item } from "../../types";
import { format } from "date-fns";

interface TransactionFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  table: string;
  title: string;
  fields: FieldDef[];
  editRecord?: Record<string, unknown> | null;
}

interface FieldDef {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "employee" | "item" | "select" | "textarea";
  required?: boolean;
  options?: { value: string; label: string }[];
  step?: string;
  min?: string;
  department?: string;
}

export function TransactionForm({ open, onClose, onSaved, table, title, fields, editRecord }: TransactionFormProps) {
  const { addToast, session } = useApp();
  const [values, setValues] = useState<Record<string, string>>({});
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      // Load employees filtered by department when specified
      const empField = fields.find((f) => f.type === "employee");
      let empQuery = supabase.from("employees").select("*").eq("status", "active").order("name");
      if (empField?.department) empQuery = empQuery.eq("department", empField.department);
      empQuery.then(({ data }) => setEmployees(data || []));
      supabase.from("items").select("*").eq("status", "active").order("name").then(({ data }) => setItems(data || []));

      // Pre-fill form
      if (editRecord) {
        const initial: Record<string, string> = {};
        fields.forEach((f) => {
          initial[f.key] = String(editRecord[f.key] ?? "");
        });
        setValues(initial);
      } else {
        const initial: Record<string, string> = {};
        fields.forEach((f) => {
          if (f.type === "date") initial[f.key] = format(new Date(), "yyyy-MM-dd");
          else initial[f.key] = "";
        });
        setValues(initial);
      }
      setErrors({});
    }
  }, [open, editRecord]);

  function validate() {
    const errs: Record<string, string> = {};
    fields.forEach((f) => {
      if (f.required && !values[f.key]) {
        errs[f.key] = `${f.label} is required.`;
      }
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    const payload: Record<string, unknown> = {};
    fields.forEach((f) => {
      if (f.type === "number") payload[f.key] = Number(values[f.key]) || 0;
      else if (values[f.key] !== "") payload[f.key] = values[f.key];
    });

    if (!editRecord) {
      payload.created_by = session?.user.id;
    }

    let error;
    if (editRecord) {
      ({ error } = await supabase.from(table).update(payload).eq("id", editRecord.id));
    } else {
      ({ error } = await supabase.from(table).insert(payload));
    }

    if (error) {
      addToast("error", `Unable to save transaction: ${error.message}`);
    } else {
      addToast("success", editRecord ? "Transaction updated successfully." : "Transaction saved successfully.");
      onSaved();
      onClose();
    }
    setLoading(false);
  }

  return (
    <Modal open={open} onClose={onClose} title={title} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map((f) => (
            <Field key={f.key} label={f.label} required={f.required} error={errors[f.key]}>
              {f.type === "employee" ? (
                <Select
                  value={values[f.key] || ""}
                  onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                  error={!!errors[f.key]}
                >
                  <option value="">Select employee…</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.employee_code})</option>
                  ))}
                </Select>
              ) : f.type === "item" ? (
                <Select
                  value={values[f.key] || ""}
                  onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                  error={!!errors[f.key]}
                >
                  <option value="">Select item…</option>
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>{item.name} ({item.item_code})</option>
                  ))}
                </Select>
              ) : f.type === "select" ? (
                <Select
                  value={values[f.key] || ""}
                  onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                  error={!!errors[f.key]}
                >
                  <option value="">Select…</option>
                  {f.options?.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </Select>
              ) : f.type === "textarea" ? (
                <Textarea
                  value={values[f.key] || ""}
                  onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                  error={!!errors[f.key]}
                />
              ) : (
                <Input
                  type={f.type}
                  value={values[f.key] || ""}
                  onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                  step={f.step || (f.type === "number" ? "0.001" : undefined)}
                  min={f.min}
                  error={!!errors[f.key]}
                />
              )}
            </Field>
          ))}
        </div>
        <div className="flex gap-2 pt-2 justify-end border-t border-[#E7E0D8]">
          <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
          <Btn type="submit" loading={loading}>{editRecord ? "Update" : "Save"}</Btn>
        </div>
      </form>
    </Modal>
  );
}
