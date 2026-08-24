import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { getFilingCalcByEmployee, getDateRange } from "../../lib/calculations";
import { PageHeader, Card, CardHeader, KPICard, Select, Field, Btn, EmptyState, SkeletonCard } from "../UI";
import type { Employee, FilingCalculation } from "../../types";
import { format } from "date-fns";
import { generateFilingPDF } from "../../lib/pdf";

type DateF = "this_month" | "prev_month" | "custom";

export default function FilingCalc() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [dateFilter, setDateFilter] = useState<DateF>("this_month");
  const [customFrom, setCustomFrom] = useState(format(new Date(), "yyyy-01-01"));
  const [customTo, setCustomTo] = useState(format(new Date(), "yyyy-MM-dd"));
  const [result, setResult] = useState<FilingCalculation | null>(null);
  const [loading, setLoading] = useState(false);
  const [ran, setRan] = useState(false);

  useEffect(() => {
    supabase.from("employees").select("*").eq("status", "active").order("name").then(({ data }) => setEmployees(data || []));
  }, []);

  const { from, to } = getDateRange(dateFilter, { from: customFrom, to: customTo });

  async function runCalc() {
    if (!selectedEmployee) return;
    setLoading(true);
    setRan(true);
    const res = await getFilingCalcByEmployee(selectedEmployee, from, to);
    setResult(res);
    setLoading(false);
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Employee Calculation — Filing" subtitle="Calculate filing summary per employee for a date range" />

      <Card>
        <CardHeader title="Select Employee & Period" />
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Field label="Employee" required>
            <Select value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)}>
              <option value="">Select employee…</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.name} ({emp.employee_code})</option>
              ))}
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
              <Field label="From Date">
                <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="w-full px-3 py-2 text-sm rounded-md border border-[#E7E0D8] focus:outline-none focus:ring-1 focus:ring-[#B8952A]" />
              </Field>
              <Field label="To Date">
                <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="w-full px-3 py-2 text-sm rounded-md border border-[#E7E0D8] focus:outline-none focus:ring-1 focus:ring-[#B8952A]" />
              </Field>
            </>
          )}
          <div className="flex items-end">
            <Btn onClick={runCalc} loading={loading} disabled={!selectedEmployee}>Calculate</Btn>
          </div>
        </div>
      </Card>

      {ran && (
        loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Array.from({ length: 7 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : !result ? (
          <EmptyState icon="📋" message="No filing transactions found for this employee in the selected period." />
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#1C1917]">{result.employee_name}</h3>
                <p className="text-xs text-[#78716C]">Period: {from} — {to}</p>
              </div>
              <Btn variant="secondary" size="sm" onClick={() => generateFilingPDF(result, from, to)}>
                ⬇ PDF
              </Btn>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <KPICard label="Filing Out Weight" value={result.filing_out_weight} unit="g" icon="↑" />
              <KPICard label="Filing Return Weight" value={result.filing_return_weight} unit="g" icon="↓" />
              <KPICard label="Adjusted Return Weight" value={result.adjusted_return_weight} unit="g" icon="=" />
              <KPICard label="Loss as Filing" value={result.loss_as_filing} unit="g" icon="△" />
              <KPICard label="Wastage (×0.012)" value={result.wastage} unit="g" icon="⊗" />
              <KPICard label="Balance Silver" value={result.balance_silver} unit="g" icon="⊖" accent={result.balance_silver < 0} />
              <KPICard label="Amount Payable (×2.5)" value={result.amount_payable} unit="₹" accent icon="₹" />
            </div>

            {/* Calculation detail */}
            <Card>
              <CardHeader title="Calculation Breakdown" />
              <div className="p-5 space-y-2 text-sm">
                {[
                  ["Loss as Filing", `${result.filing_out_weight.toFixed(3)} − ${result.filing_return_weight.toFixed(3)} = ${result.loss_as_filing.toFixed(3)} g`],
                  ["Wastage", `${result.adjusted_return_weight.toFixed(3)} × 0.012 = ${result.wastage.toFixed(3)} g`],
                  ["Balance Silver", `${result.wastage.toFixed(3)} − ${result.loss_as_filing.toFixed(3)} = ${result.balance_silver.toFixed(3)} g`],
                  ["Amount Payable", `${result.adjusted_return_weight.toFixed(3)} × 2.5 = ₹ ${result.amount_payable.toFixed(2)}`],
                ].map(([label, calc]) => (
                  <div key={label} className="flex items-start justify-between py-2 border-b border-[#F0EBE3] last:border-0">
                    <span className="text-[#44403C] font-medium w-44 shrink-0">{label}</span>
                    <span className="font-mono-data text-[#78716C] text-xs">{calc}</span>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )
      )}
    </div>
  );
}
