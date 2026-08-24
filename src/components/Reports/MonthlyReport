import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import {
  getFilingCalcByEmployee, getWaxCalcByEmployee, getPolishCalcByEmployee,
  getMachinePolishCalcByEmployee, getDateRange,
} from "../../lib/calculations";
import { generateFilingPDF, generateWaxPDF, generatePolishPDF } from "../../lib/pdf";
import { PageHeader, Card, CardHeader, Btn, Select, Field, EmptyState } from "../UI";
import type { Employee } from "../../types";
import { format } from "date-fns";

type Module = "filing" | "wax" | "polish" | "machine";
type DateF = "this_month" | "prev_month" | "custom";

interface ReportRow {
  employee_name: string;
  col1: string;
  col2: string;
  col3: string;
  col4: string;
  col5?: string;
}

interface MonthlyReportProps {
  module?: Module;
}

export default function MonthlyReport({ module = "filing" }: MonthlyReportProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [dateFilter, setDateFilter] = useState<DateF>("this_month");
  const [customFrom, setCustomFrom] = useState(format(new Date(), "yyyy-01-01"));
  const [customTo, setCustomTo] = useState(format(new Date(), "yyyy-MM-dd"));
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(false);

  const { from, to } = getDateRange(dateFilter, { from: customFrom, to: customTo });

  useEffect(() => {
    supabase.from("employees").select("*").eq("status", "active").order("name").then(({ data }) => setEmployees(data || []));
  }, []);

  async function runReport() {
    setLoading(true);
    const results: ReportRow[] = [];

    for (const emp of employees) {
      if (module === "filing") {
        const r = await getFilingCalcByEmployee(emp.id, from, to);
        if (r && (r.filing_out_weight > 0 || r.filing_return_weight > 0)) {
          results.push({
            employee_name: r.employee_name,
            col1: r.filing_out_weight.toFixed(3) + " g",
            col2: r.filing_return_weight.toFixed(3) + " g",
            col3: r.loss_as_filing.toFixed(3) + " g",
            col4: r.wastage.toFixed(3) + " g",
            col5: "₹ " + r.amount_payable.toFixed(2),
          });
        }
      } else if (module === "wax") {
        const r = await getWaxCalcByEmployee(emp.id, from, to);
        if (r && (r.outward_wax_weight > 0 || r.return_wax_weight > 0)) {
          results.push({
            employee_name: r.employee_name,
            col1: r.outward_wax_weight.toFixed(3) + " g",
            col2: r.return_wax_weight.toFixed(3) + " g",
            col3: r.net_stone_weight.toFixed(3) + " g",
            col4: r.dispute_weight.toFixed(3) + " g",
            col5: String(r.total_setting_count) + " ct",
          });
        }
      } else if (module === "polish") {
        const r = await getPolishCalcByEmployee(emp.id, from, to);
        if (r && (r.polish_out_weight > 0 || r.polish_return_weight > 0)) {
          results.push({
            employee_name: r.employee_name,
            col1: r.polish_out_weight.toFixed(3) + " g",
            col2: r.polish_return_weight.toFixed(3) + " g",
            col3: r.balance_silver.toFixed(3) + " g",
            col4: "₹ " + r.amount_payable.toFixed(2),
          });
        }
      } else if (module === "machine") {
        const r = await getMachinePolishCalcByEmployee(emp.id, from, to);
        if (r && (r.machine_polish_out_weight > 0 || r.machine_polish_return_weight > 0)) {
          results.push({
            employee_name: r.employee_name,
            col1: r.machine_polish_out_weight.toFixed(3) + " g",
            col2: r.machine_polish_return_weight.toFixed(3) + " g",
            col3: r.machine_polish_loss.toFixed(3) + " g",
            col4: "—",
          });
        }
      }
    }

    setRows(results);
    setLoading(false);
  }

  const headers: Record<Module, string[]> = {
    filing: ["Employee", "Out Weight", "Return Weight", "Loss", "Wastage", "Amount"],
    wax: ["Employee", "Wax Out", "Wax Return", "Net Stone Wt", "Dispute Wt", "Setting Count"],
    polish: ["Employee", "Polish Out", "Polish Return", "Balance Silver", "Amount"],
    machine: ["Employee", "Machine Out", "Machine Return", "Loss"],
  };

  const titles: Record<Module, string> = {
    filing: "Monthly Report — Filing",
    wax: "Monthly Report — Wax / Setting",
    polish: "Monthly Report — Polish",
    machine: "Monthly Report — Machine Polish",
  };

  const cols = headers[module];

  return (
    <div className="space-y-5">
      <PageHeader title={titles[module]} subtitle={`All employees, ${from} to ${to}`} />
      <Card>
        <CardHeader title="Report Parameters" />
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
          <div className="flex items-end gap-2">
            <Btn onClick={runReport} loading={loading}>Generate Report</Btn>
          </div>
        </div>
      </Card>

      {rows.length === 0 && !loading ? (
        <EmptyState icon="📊" message="Click 'Generate Report' to calculate monthly summary for all active employees." />
      ) : (
        <Card>
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E7E0D8]">
            <p className="text-sm font-semibold">{titles[module]}</p>
            <p className="text-xs text-[#78716C]">{from} — {to} · {rows.length} employees</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E7E0D8]">
                  {cols.map((c) => (
                    <th key={c} className="text-left py-2.5 px-3 text-xs font-semibold text-[#78716C] uppercase tracking-wide">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={cols.length} className="py-8 text-center text-sm text-[#78716C]">Calculating…</td></tr>
                ) : (
                  rows.map((row, i) => (
                    <tr key={i} className="border-b border-[#F0EBE3] hover:bg-[#FAF8F5]">
                      <td className="py-3 px-3 font-medium">{row.employee_name}</td>
                      <td className="py-3 px-3 font-mono-data text-sm">{row.col1}</td>
                      <td className="py-3 px-3 font-mono-data text-sm">{row.col2}</td>
                      <td className="py-3 px-3 font-mono-data text-sm">{row.col3}</td>
                      <td className="py-3 px-3 font-mono-data text-sm">{row.col4}</td>
                      {row.col5 !== undefined && <td className="py-3 px-3 font-mono-data text-sm text-[#B8952A] font-semibold">{row.col5}</td>}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
