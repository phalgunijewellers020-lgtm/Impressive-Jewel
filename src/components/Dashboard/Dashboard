import { useState, useEffect, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line,
} from "recharts";
import { getDashboardSummary, getDateRange } from "../../lib/calculations";
import { supabase } from "../../lib/supabase";
import { useApp } from "../../context/AppContext";
import { KPICard, Card, CardHeader, Btn, SkeletonCard } from "../UI";
import type { DateFilter } from "../../types";
import { format } from "date-fns";

const DATE_FILTERS: { label: string; value: DateFilter }[] = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "This Week", value: "this_week" },
  { label: "This Month", value: "this_month" },
  { label: "Prev Month", value: "prev_month" },
  { label: "Custom", value: "custom" },
];

const QUICK_ACTIONS = [
  { label: "+ Filing Out", page: "filing-out" as const, color: "#B8952A" },
  { label: "+ Filing Return", page: "filing-return" as const, color: "#B8952A" },
  { label: "+ Wax/Stone Out", page: "wax-out" as const, color: "#1C1917" },
  { label: "+ Wax/Stone Return", page: "wax-return" as const, color: "#1C1917" },
  { label: "+ Polish Out", page: "polish-out" as const, color: "#44403C" },
  { label: "+ Polish Return", page: "polish-return" as const, color: "#44403C" },
  { label: "+ Machine Polish Out", page: "machine-polish" as const, color: "#78716C" },
  { label: "+ Add Employee", page: "employee-add" as const, color: "#2D7A4F" },
];

interface ChartDataPoint {
  month: string;
  filing_out: number;
  filing_return: number;
  wax_out: number;
  wax_return: number;
  polish_out: number;
  polish_return: number;
}

interface EmployeeChartPoint {
  name: string;
  filing: number;
  wax: number;
  polish: number;
}

export default function Dashboard() {
  const { navigate } = useApp();
  const [dateFilter, setDateFilter] = useState<DateFilter>("this_month");
  const [customFrom, setCustomFrom] = useState(format(new Date(), "yyyy-MM-dd"));
  const [customTo, setCustomTo] = useState(format(new Date(), "yyyy-MM-dd"));
  const [summary, setSummary] = useState<Awaited<ReturnType<typeof getDashboardSummary>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [employeeData, setEmployeeData] = useState<EmployeeChartPoint[]>([]);

  const { from, to } = getDateRange(
    dateFilter,
    dateFilter === "custom" ? { from: customFrom, to: customTo } : undefined
  );

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getDashboardSummary(from, to);
      setSummary(data);
      await loadCharts(from, to);
    } catch {
      setError("Unable to load dashboard data. Please try again.");
    }
    setLoading(false);
  }, [from, to]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  async function loadCharts(fromDate: string, toDate: string) {
    // Monthly trend (last 6 months)
    const months: ChartDataPoint[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mFrom = format(d, "yyyy-MM-01");
      const mTo = format(new Date(d.getFullYear(), d.getMonth() + 1, 0), "yyyy-MM-dd");
      const [fo, fr, wo, wr, po, pr] = await Promise.all([
        supabase.from("filing_out").select("weight").gte("date", mFrom).lte("date", mTo),
        supabase.from("filing_return").select("weight").gte("date", mFrom).lte("date", mTo),
        supabase.from("wax_out").select("wax_weight").gte("date", mFrom).lte("date", mTo),
        supabase.from("wax_return").select("wax_weight").gte("date", mFrom).lte("date", mTo),
        supabase.from("polish_out").select("weight").gte("date", mFrom).lte("date", mTo),
        supabase.from("polish_return").select("weight").gte("date", mFrom).lte("date", mTo),
      ]);
      months.push({
        month: format(d, "MMM yy"),
        filing_out: (fo.data || []).reduce((s, r) => s + Number(r.weight), 0),
        filing_return: (fr.data || []).reduce((s, r) => s + Number(r.weight), 0),
        wax_out: (wo.data || []).reduce((s, r) => s + Number(r.wax_weight), 0),
        wax_return: (wr.data || []).reduce((s, r) => s + Number(r.wax_weight), 0),
        polish_out: (po.data || []).reduce((s, r) => s + Number(r.weight), 0),
        polish_return: (pr.data || []).reduce((s, r) => s + Number(r.weight), 0),
      });
    }
    setChartData(months);

    // Employee-wise work
    const empRes = await supabase.from("employees").select("id, name").eq("status", "active").limit(8);
    if (empRes.data) {
      const empPoints: EmployeeChartPoint[] = await Promise.all(
        empRes.data.map(async (emp) => {
          const [fo, wo, po] = await Promise.all([
            supabase.from("filing_out").select("weight").eq("employee_id", emp.id).gte("date", fromDate).lte("date", toDate),
            supabase.from("wax_out").select("wax_weight").eq("employee_id", emp.id).gte("date", fromDate).lte("date", toDate),
            supabase.from("polish_out").select("weight").eq("employee_id", emp.id).gte("date", fromDate).lte("date", toDate),
          ]);
          return {
            name: emp.name.split(" ")[0],
            filing: (fo.data || []).reduce((s, r) => s + Number(r.weight), 0),
            wax: (wo.data || []).reduce((s, r) => s + Number(r.wax_weight), 0),
            polish: (po.data || []).reduce((s, r) => s + Number(r.weight), 0),
          };
        })
      );
      setEmployeeData(empPoints.filter((e) => e.filing + e.wax + e.polish > 0));
    }
  }

  const fmt3 = (n: number) =>
    n.toLocaleString("en-IN", { minimumFractionDigits: 3, maximumFractionDigits: 3 });

  const fmtINR = (n: number) =>
    "₹ " + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="space-y-5">
      {/* Date filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        {DATE_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setDateFilter(f.value)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              dateFilter === f.value
                ? "bg-[#1C1917] text-white"
                : "bg-white border border-[#E7E0D8] text-[#44403C] hover:bg-[#F0EBE3]"
            }`}
          >
            {f.label}
          </button>
        ))}
        {dateFilter === "custom" && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="px-2 py-1.5 text-xs rounded-md border border-[#E7E0D8] bg-white focus:outline-none focus:ring-1 focus:ring-[#B8952A]"
            />
            <span className="text-xs text-[#78716C]">to</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="px-2 py-1.5 text-xs rounded-md border border-[#E7E0D8] bg-white focus:outline-none focus:ring-1 focus:ring-[#B8952A]"
            />
          </div>
        )}
        <div className="ml-auto text-xs text-[#78716C] bg-white border border-[#E7E0D8] px-3 py-1.5 rounded-md">
          {from} — {to}
        </div>
        <button onClick={loadDashboard} className="text-xs text-[#78716C] hover:text-[#1C1917] border border-[#E7E0D8] px-3 py-1.5 rounded-md bg-white transition-colors">↻</button>
      </div>

      {error && (
        <div className="bg-[#FEE2E2] border border-[#FECACA] rounded-md px-4 py-3 text-sm text-[#C0392B]">
          {error}
        </div>
      )}

      {/* Filing KPIs */}
      <div>
        <h3 className="text-xs font-semibold text-[#78716C] uppercase tracking-widest mb-3 flex items-center gap-2">
          <span className="w-4 h-0.5 bg-[#B8952A] inline-block" />
          Filing
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          ) : !summary ? null : (
            <>
              <KPICard label="Filing Out" value={fmt3(summary.filing.out)} unit="g" icon="↑" />
              <KPICard label="Filing Return" value={fmt3(summary.filing.return)} unit="g" icon="↓" />
              <KPICard label="Loss as Filing" value={fmt3(summary.filing.loss)} unit="g" icon="△" />
              <KPICard label="Wastage" value={fmt3(summary.filing.wastage)} unit="g" icon="⊗" />
              <KPICard label="Balance Silver" value={fmt3(Math.abs(summary.filing.balance_silver))} unit="g" accent={summary.filing.balance_silver < 0} icon="⊖" />
              <KPICard label="Amount Payable" value={fmtINR(summary.filing.amount_payable)} icon="₹" accent />
            </>
          )}
        </div>
      </div>

      {/* Wax KPIs */}
      <div>
        <h3 className="text-xs font-semibold text-[#78716C] uppercase tracking-widest mb-3 flex items-center gap-2">
          <span className="w-4 h-0.5 bg-[#1C1917] inline-block" />
          Wax / Setting
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
          ) : !summary ? null : (
            <>
              <KPICard label="Wax/Stone Out" value={fmt3(summary.wax.out_weight)} unit="g" icon="↑" />
              <KPICard label="Wax/Stone Return" value={fmt3(summary.wax.return_weight)} unit="g" icon="↓" />
              <KPICard label="Stone Weight" value={fmt3(summary.wax.stone_weight)} unit="g" icon="◆" />
              <KPICard label="Net Stone Weight" value={fmt3(summary.wax.net_stone_weight)} unit="g" icon="◇" />
              <KPICard label="Dispute Weight" value={fmt3(Math.abs(summary.wax.dispute_weight))} unit="g" icon="⚠" />
            </>
          )}
        </div>
      </div>

      {/* Polish KPIs */}
      <div>
        <h3 className="text-xs font-semibold text-[#78716C] uppercase tracking-widest mb-3 flex items-center gap-2">
          <span className="w-4 h-0.5 bg-[#44403C] inline-block" />
          Polish
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
          ) : !summary ? null : (
            <>
              <KPICard label="Polish Out" value={fmt3(summary.polish.out)} unit="g" icon="↑" />
              <KPICard label="Polish Return" value={fmt3(summary.polish.return)} unit="g" icon="↓" />
              <KPICard label="Balance Silver" value={fmt3(summary.polish.balance_silver)} unit="g" icon="⊖" />
              <KPICard label="Machine Polish Out" value={fmt3(summary.machine_polish.out)} unit="g" icon="⚙" />
              <KPICard label="Machine Polish Loss" value={fmt3(summary.machine_polish.loss)} unit="g" icon="△" />
            </>
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Filing chart */}
        <Card>
          <CardHeader title="Filing Out vs Return (6 Months)" />
          <div className="p-4">
            {chartData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-sm text-[#78716C]">
                No filing data available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0EBE3" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#78716C" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#78716C" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid #E7E0D8" }} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="filing_out" name="Out" fill="#B8952A" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="filing_return" name="Return" fill="#E8D9A8" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Wax chart */}
        <Card>
          <CardHeader title="Wax/Stone Out vs Return (6 Months)" />
          <div className="p-4">
            {chartData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-sm text-[#78716C]">
                No wax data available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0EBE3" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#78716C" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#78716C" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid #E7E0D8" }} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="wax_out" name="Out" fill="#1C1917" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="wax_return" name="Return" fill="#78716C" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Polish chart */}
        <Card>
          <CardHeader title="Polish Out vs Return (6 Months)" />
          <div className="p-4">
            {chartData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-sm text-[#78716C]">
                No polish data available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0EBE3" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#78716C" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#78716C" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid #E7E0D8" }} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="polish_out" name="Out" stroke="#44403C" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="polish_return" name="Return" stroke="#A8A29E" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Employee-wise chart */}
        <Card>
          <CardHeader title="Employee-wise Work (Selected Period)" />
          <div className="p-4">
            {employeeData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-sm text-[#78716C]">
                No employee work data available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={employeeData} layout="vertical" barGap={1}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0EBE3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#78716C" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#44403C" }} axisLine={false} tickLine={false} width={55} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid #E7E0D8" }} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="filing" name="Filing" fill="#B8952A" radius={[0, 2, 2, 0]} />
                  <Bar dataKey="wax" name="Wax" fill="#1C1917" radius={[0, 2, 2, 0]} />
                  <Bar dataKey="polish" name="Polish" fill="#78716C" radius={[0, 2, 2, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader title="Quick Actions" />
        <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {QUICK_ACTIONS.map((qa) => (
            <button
              key={qa.page}
              onClick={() => navigate(qa.page)}
              style={{ borderColor: qa.color + "40", color: qa.color }}
              className="px-3 py-2.5 rounded-md text-xs font-medium border bg-white hover:bg-[#FAF8F5] transition-colors text-left"
            >
              {qa.label}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
