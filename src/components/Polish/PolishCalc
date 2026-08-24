import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { getPolishCalcByEmployee, getMachinePolishCalcByEmployee, getDateRange } from "../../lib/calculations";
import { PageHeader, Card, CardHeader, KPICard, Select, Field, Btn, EmptyState, SkeletonCard } from "../UI";
import type { Employee, PolishCalculation, MachinePolishCalculation } from "../../types";
import { format } from "date-fns";

type DateF = "this_month" | "prev_month" | "custom";

export default function PolishCalc() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [dateFilter, setDateFilter] = useState<DateF>("this_month");
  const [customFrom, setCustomFrom] = useState(format(new Date(), "yyyy-01-01"));
  const [customTo, setCustomTo] = useState(format(new Date(), "yyyy-MM-dd"));
  const [polishResult, setPolishResult] = useState<PolishCalculation | null>(null);
  const [machineResult, setMachineResult] = useState<MachinePolishCalculation | null>(null);
  const [loading, setLoading] = useState(false);
  const [ran, setRan] = useState(false);

  useEffect(() => {
    supabase.from("employees").select("*").eq("status", "active").order("name").then(({ data }) => setEmployees(data || []));
  }, []);

  const { from, to } = getDateRange(dateFilter, { from: customFrom, to: customTo });

  async function runCalc() {
    if (!selectedEmployee) return;
    setLoading(true); setRan(true);
    const [p, m] = await Promise.all([
      getPolishCalcByEmployee(selectedEmployee, from, to),
      getMachinePolishCalcByEmployee(selectedEmployee, from, to),
    ]);
    setPolishResult(p);
    setMachineResult(m);
    setLoading(false);
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Employee Calculation — Polish" subtitle="Polish and machine polish summary per employee" />
      <Card>
        <CardHeader title="Select Employee & Period" />
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Field label="Employee" required>
            <Select value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)}>
              <option value="">Select employee…</option>
              {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.name} ({emp.employee_code})</option>)}
            </Select>
          </Field>
          <Field label="Period">
            <Select value={dateFilter} onChange={(e) => setDateFilter(e.target.value as DateF)}>
              <option value="this_month">This Month</option>
              <option value="prev_month">Previous Month</option>
              <option value="custom">Custom</option>
            </Select>
          </Field>
          {dateFilter === "custom" && (
            <>
              <Field label="From"><input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="w-full px-3 py-2 text-sm rounded-md border border-[#E7E0D8] focus:outline-none focus:ring-1 focus:ring-[#B8952A]" /></Field>
              <Field label="To"><input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="w-full px-3 py-2 text-sm rounded-md border border-[#E7E0D8] focus:outline-none focus:ring-1 focus:ring-[#B8952A]" /></Field>
            </>
          )}
          <div className="flex items-end"><Btn onClick={runCalc} loading={loading} disabled={!selectedEmployee}>Calculate</Btn></div>
        </div>
      </Card>

      {ran && (loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">{Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : (
        <div className="space-y-5">
          {polishResult && (
            <>
              <div>
                <h3 className="text-sm font-semibold text-[#1C1917]">{polishResult.employee_name} — Polish</h3>
                <p className="text-xs text-[#78716C]">Period: {from} — {to}</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <KPICard label="Polish Out" value={polishResult.polish_out_weight} unit="g" icon="↑" />
                <KPICard label="Polish Return" value={polishResult.polish_return_weight} unit="g" icon="↓" />
                <KPICard label="Balance Silver" value={polishResult.balance_silver} unit="g" icon="=" accent />
                <KPICard label="Amount Payable" value={`₹ ${polishResult.amount_payable.toFixed(2)}`} icon="₹" accent />
              </div>
              <Card>
                <CardHeader title="Polish Calculation" />
                <div className="p-5 text-sm">
                  <div className="flex items-start justify-between py-2">
                    <span className="text-[#44403C] font-medium">Balance Silver</span>
                    <span className="font-mono-data text-[#78716C] text-xs">{polishResult.polish_out_weight.toFixed(3)}g − {polishResult.polish_return_weight.toFixed(3)}g = {polishResult.balance_silver.toFixed(3)}g</span>
                  </div>
                </div>
              </Card>
            </>
          )}

          {machineResult && (
            <>
              <h3 className="text-sm font-semibold text-[#1C1917] border-t border-[#E7E0D8] pt-4">Machine Polish</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <KPICard label="Machine Polish Out" value={machineResult.machine_polish_out_weight} unit="g" icon="⚙" />
                <KPICard label="Machine Polish Return" value={machineResult.machine_polish_return_weight} unit="g" icon="↓" />
                <KPICard label="Machine Polish Loss" value={machineResult.machine_polish_loss} unit="g" icon="△" accent={machineResult.machine_polish_loss > 0} />
              </div>
            </>
          )}

          {!polishResult && !machineResult && (
            <EmptyState icon="◎" message="No polish transactions found for this employee in the selected period." />
          )}
        </div>
      ))}
    </div>
  );
}
