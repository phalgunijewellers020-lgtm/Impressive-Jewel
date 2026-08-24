import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { getWaxCalcByEmployee, getDateRange } from "../../lib/calculations";
import { PageHeader, Card, CardHeader, KPICard, Select, Field, Btn, EmptyState, SkeletonCard } from "../UI";
import type { Employee, WaxCalculation } from "../../types";
import { format } from "date-fns";

type DateF = "this_month" | "prev_month" | "custom";

export default function WaxCalc() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [dateFilter, setDateFilter] = useState<DateF>("this_month");
  const [customFrom, setCustomFrom] = useState(format(new Date(), "yyyy-01-01"));
  const [customTo, setCustomTo] = useState(format(new Date(), "yyyy-MM-dd"));
  const [result, setResult] = useState<WaxCalculation | null>(null);
  const [loading, setLoading] = useState(false);
  const [ran, setRan] = useState(false);

  useEffect(() => {
    supabase.from("employees").select("*").eq("status", "active").order("name").then(({ data }) => setEmployees(data || []));
  }, []);

  const { from, to } = getDateRange(dateFilter, { from: customFrom, to: customTo });

  async function runCalc() {
    if (!selectedEmployee) return;
    setLoading(true); setRan(true);
    const res = await getWaxCalcByEmployee(selectedEmployee, from, to);
    setResult(res);
    setLoading(false);
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Employee Calculation — Wax / Setting" subtitle="Calculate wax/stone setting summary per employee" />
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">{Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : !result ? (
        <EmptyState icon="◈" message="No wax/setting transactions found for this employee in the selected period." />
      ) : (
        <>
          <div>
            <h3 className="text-sm font-semibold text-[#1C1917]">{result.employee_name}</h3>
            <p className="text-xs text-[#78716C]">Period: {from} — {to}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <KPICard label="Outward Wax Weight" value={result.outward_wax_weight} unit="g" icon="↑" />
            <KPICard label="Return Wax Weight" value={result.return_wax_weight} unit="g" icon="↓" />
            <KPICard label="Outward Stone Weight" value={result.outward_stone_weight} unit="g" icon="◆" />
            <KPICard label="Return Stone Weight" value={result.return_stone_weight} unit="g" icon="◇" />
            <KPICard label="Return Wax Pieces" value={String(result.return_wax_pieces)} unit="pcs" icon="◻" />
            <KPICard label="Total Setting Count" value={String(result.total_setting_count)} unit="ct" icon="⊞" accent />
            <KPICard label="Net Stone Weight" value={result.net_stone_weight} unit="g" icon="=" />
            <KPICard label="Net Stone Count" value={String(result.net_stone_count)} unit="ct" icon="=" />
            <KPICard label="Inwards" value={result.inwards} unit="g" icon="↙" />
            <KPICard label="Outwards" value={result.outwards} unit="g" icon="↗" />
            <KPICard label="Dispute Weight" value={result.dispute_weight} unit="g" icon="⚠" accent={result.dispute_weight !== 0} />
          </div>
          <Card>
            <CardHeader title="Calculation Breakdown" />
            <div className="p-5 space-y-2 text-sm">
              {[
                ["Total Setting Count", `${result.return_wax_pieces} pieces × ${result.setting_stone_count} stones = ${result.total_setting_count}`],
                ["Net Stone Weight", `${result.outward_stone_weight.toFixed(3)}g − ${result.return_stone_weight.toFixed(3)}g = ${result.net_stone_weight.toFixed(3)}g`],
                ["Net Stone Count", `${result.outward_stone_count} − (${result.return_stone_count} + ${result.setting_stone_count} × ${result.return_wax_pieces}) = ${result.net_stone_count}`],
                ["Inwards", `${result.return_stone_weight.toFixed(3)}g + ${result.return_wax_weight.toFixed(3)}g = ${result.inwards.toFixed(3)}g`],
                ["Outwards", `${result.outward_stone_weight.toFixed(3)}g + ${result.outward_wax_weight.toFixed(3)}g = ${result.outwards.toFixed(3)}g`],
                ["Dispute Weight", `(${result.outward_wax_weight.toFixed(3)} + ${result.outward_stone_weight.toFixed(3)}) − (${result.return_wax_weight.toFixed(3)} + ${result.return_stone_weight.toFixed(3)}) = ${result.dispute_weight.toFixed(3)}g`],
              ].map(([label, calc]) => (
                <div key={label} className="flex items-start justify-between py-2 border-b border-[#F0EBE3] last:border-0">
                  <span className="text-[#44403C] font-medium w-44 shrink-0">{label}</span>
                  <span className="font-mono-data text-[#78716C] text-xs">{calc}</span>
                </div>
              ))}
            </div>
          </Card>
        </>
      ))}
    </div>
  );
}
