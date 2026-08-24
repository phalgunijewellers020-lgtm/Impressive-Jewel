import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useApp } from "../../context/AppContext";
import {
  PageHeader, Card, Table, Btn, Badge, Modal, Field, Input, Select, Textarea, SearchInput, Confirm, EmptyState,
} from "../UI";
import type { Employee } from "../../types";
import { DEPARTMENTS } from "../../lib/departments";

interface EmployeesProps {
  mode?: "list" | "add";
}

export default function Employees({ mode = "list" }: EmployeesProps) {
  const { addToast } = useApp();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("active");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [formOpen, setFormOpen] = useState(mode === "add");
  const [editEmp, setEditEmp] = useState<Employee | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    employee_code: "", name: "", department: "", contact_number: "",
    joining_date: new Date().toISOString().slice(0, 10),
    status: "active" as "active" | "inactive", address: "", notes: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase.from("employees").select("*").order("name");
    if (statusFilter !== "all") q = q.eq("status", statusFilter);
    if (deptFilter !== "all") q = q.eq("department", deptFilter);
    const { data } = await q;
    setEmployees(data || []);
    setLoading(false);
  }, [statusFilter, deptFilter]);

  useEffect(() => { load(); }, [load]);

  function openNew() {
    setEditEmp(null);
    setForm({
      employee_code: "", name: "", department: "", contact_number: "",
      joining_date: new Date().toISOString().slice(0, 10), status: "active", address: "", notes: "",
    });
    setFormOpen(true);
  }

  function openEdit(emp: Employee) {
    setEditEmp(emp);
    setForm({
      employee_code: emp.employee_code,
      name: emp.name,
      department: emp.department || "",
      contact_number: emp.contact_number || "",
      joining_date: emp.joining_date || new Date().toISOString().slice(0, 10),
      status: emp.status,
      address: emp.address || "",
      notes: emp.notes || "",
    });
    setFormOpen(true);
  }

  async function save() {
    if (!form.name || !form.employee_code) { addToast("error", "Name and employee code are required."); return; }
    if (!form.department) { addToast("error", "Please select a department."); return; }
    setSaving(true);
    const payload = { ...form, department: form.department || null };
    let error;
    if (editEmp) ({ error } = await supabase.from("employees").update(payload).eq("id", editEmp.id));
    else ({ error } = await supabase.from("employees").insert(payload));
    if (error) addToast("error", `Unable to save: ${error.message}`);
    else { addToast("success", editEmp ? "Employee updated." : "Employee added successfully."); setFormOpen(false); load(); }
    setSaving(false);
  }

  async function toggleStatus(emp: Employee) {
    const newStatus = emp.status === "active" ? "inactive" : "active";
    const { error } = await supabase.from("employees").update({ status: newStatus }).eq("id", emp.id);
    if (error) addToast("error", "Unable to update status.");
    else { addToast("success", `Employee ${newStatus === "active" ? "activated" : "deactivated"}.`); load(); }
  }

  const filtered = employees.filter((e) =>
    !search || `${e.name} ${e.employee_code} ${e.contact_number} ${e.department || ""}`.toLowerCase().includes(search.toLowerCase())
  );

  const COLUMNS = [
    { key: "employee_code", label: "Code" },
    { key: "name", label: "Name" },
    {
      key: "department", label: "Department", render: (r: Record<string, unknown>) => {
        const dept = r.department as string | null;
        return dept
          ? <Badge variant="info">{dept}</Badge>
          : <span className="text-[#78716C] text-xs italic">Not Assigned</span>;
      },
    },
    { key: "contact_number", label: "Contact", render: (r: Record<string, unknown>) => r.contact_number as string || "—" },
    { key: "joining_date", label: "Joining Date", render: (r: Record<string, unknown>) => r.joining_date as string || "—" },
    {
      key: "status", label: "Status", render: (r: Record<string, unknown>) => (
        <Badge variant={r.status === "active" ? "success" : "neutral"}>
          {r.status as string}
        </Badge>
      ),
    },
    {
      key: "_actions", label: "Actions", render: (r: Record<string, unknown>) => {
        const emp = r as unknown as Employee;
        return (
          <div className="flex gap-1">
            <button onClick={() => openEdit(emp)} className="text-xs text-[#44403C] hover:bg-[#F0EBE3] px-2 py-1 rounded">Edit</button>
            <button
              onClick={() => toggleStatus(emp)}
              className={`text-xs px-2 py-1 rounded ${emp.status === "active" ? "text-[#B45309] hover:bg-[#FEF3C7]" : "text-[#2D7A4F] hover:bg-[#D1FAE5]"}`}
            >
              {emp.status === "active" ? "Deactivate" : "Activate"}
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Employees"
        subtitle="Manage factory employees"
        actions={<Btn onClick={openNew}>+ Add Employee</Btn>}
      />

      <div className="flex flex-wrap gap-2 items-center">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name or code…" />
        <Select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="w-44">
          <option value="all">All Departments</option>
          {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </Select>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")} className="w-32">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </Select>
        <span className="ml-auto text-xs text-[#78716C]">{filtered.length} employees</span>
      </div>

      <Card>
        {filtered.length === 0 && !loading ? (
          <EmptyState icon="◎" message="No employees found." action={<Btn onClick={openNew}>+ Add Employee</Btn>} />
        ) : (
          <Table columns={COLUMNS} data={filtered as unknown as Record<string, unknown>[]} loading={loading} emptyMessage="No employees found." />
        )}
      </Card>

      {/* Form Modal */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editEmp ? "Edit Employee" : "Add Employee"} size="lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Employee Code" required>
            <Input value={form.employee_code} onChange={(e) => setForm((f) => ({ ...f, employee_code: e.target.value }))} placeholder="e.g. EMP001" />
          </Field>
          <Field label="Full Name" required>
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Employee full name" />
          </Field>
          <Field label="Department" required>
            <Select value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}>
              <option value="">— Select Department —</option>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </Select>
          </Field>
          <Field label="Contact Number">
            <Input type="tel" value={form.contact_number} onChange={(e) => setForm((f) => ({ ...f, contact_number: e.target.value }))} />
          </Field>
          <Field label="Joining Date">
            <Input type="date" value={form.joining_date} onChange={(e) => setForm((f) => ({ ...f, joining_date: e.target.value }))} />
          </Field>
          <Field label="Status">
            <Select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as "active" | "inactive" }))}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </Field>
          <Field label="Address">
            <Textarea value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Notes">
              <Textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
            </Field>
          </div>
        </div>
        <div className="flex gap-2 justify-end pt-4 mt-2 border-t border-[#E7E0D8]">
          <Btn variant="secondary" onClick={() => setFormOpen(false)}>Cancel</Btn>
          <Btn loading={saving} onClick={save}>{editEmp ? "Update" : "Add Employee"}</Btn>
        </div>
      </Modal>

      <Confirm open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => { setDeleteId(null); }} title="Delete Employee" message="Are you sure you want to delete this employee?" confirmLabel="Delete" danger />
    </div>
  );
}
