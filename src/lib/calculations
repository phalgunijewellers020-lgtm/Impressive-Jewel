/**
 * Central Calculation Engine
 * All business formulas are defined here — single source of truth.
 * Dashboard, Reports, and PDF all use these same functions.
 */

import type {
  FilingCalculation,
  WaxCalculation,
  PolishCalculation,
  MachinePolishCalculation,
} from "../types";
import { supabase } from "./supabase";
import { format } from "date-fns";

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}

// ── Filing Formulas ──────────────────────────────────────────────────────────

export function calcFilingLoss(outWeight: number, returnWeight: number): number {
  return round4(outWeight - returnWeight);
}

export function calcFilingWastage(adjustedReturnWeight: number, wastageRate: number): number {
  // Default rate 0.012 per spec
  return round4(adjustedReturnWeight * wastageRate);
}

export function calcFilingBalanceSilver(wastage: number, lossAsFiling: number): number {
  return round4(wastage - lossAsFiling);
}

export function calcFilingAmountPayable(adjustedReturnWeight: number, amountRate: number): number {
  // Default rate 2.5 per spec
  return round4(adjustedReturnWeight * amountRate);
}

// ── Wax / Setting Formulas ───────────────────────────────────────────────────

export function calcWaxTotalSettingCount(returnWaxPieces: number, settingStoneCount: number): number {
  return returnWaxPieces * settingStoneCount;
}

export function calcWaxAmount(totalSettingCount: number, jobRate: number): number {
  return round4(totalSettingCount * jobRate);
}

export function calcWaxNetStoneWeight(outwardStoneWeight: number, returnStoneWeight: number): number {
  return round4(outwardStoneWeight - returnStoneWeight);
}

export function calcWaxNetStoneCount(
  outwardStoneCount: number,
  returnStoneCount: number,
  settingStoneCount: number,
  returnWaxPieces: number
): number {
  return outwardStoneCount - (returnStoneCount + settingStoneCount * returnWaxPieces);
}

export function calcWaxInwards(returnStoneWeight: number, returnWaxWeight: number): number {
  return round4(returnStoneWeight + returnWaxWeight);
}

export function calcWaxOutwards(outwardStoneWeight: number, outwardWaxWeight: number): number {
  return round4(outwardStoneWeight + outwardWaxWeight);
}

export function calcWaxDisputeWeight(
  outwardWaxWeight: number,
  outwardStoneWeight: number,
  returnWaxWeight: number,
  returnStoneWeight: number
): number {
  return round4(
    (outwardWaxWeight + outwardStoneWeight) - (returnWaxWeight + returnStoneWeight)
  );
}

// ── Polish Formulas ──────────────────────────────────────────────────────────

export function calcPolishBalanceSilver(outWeight: number, returnWeight: number): number {
  return round4(outWeight - returnWeight);
}

// ── Machine Polish Formulas ──────────────────────────────────────────────────

export function calcMachinePolishLoss(outWeight: number, returnWeight: number): number {
  return round4(outWeight - returnWeight);
}

// ── Aggregation Queries ──────────────────────────────────────────────────────

export async function getDashboardSummary(fromDate: string, toDate: string) {
  const [filingOutRes, filingRetRes, waxOutRes, waxRetRes, polishOutRes, polishRetRes, mpOutRes, mpRetRes, filingRatesRes] =
    await Promise.all([
      supabase.from("filing_out").select("weight, item_id").gte("date", fromDate).lte("date", toDate),
      supabase.from("filing_return").select("weight, item_id").gte("date", fromDate).lte("date", toDate),
      supabase.from("wax_out").select("wax_weight, stone_weight, stone_count, job_rate_id").gte("date", fromDate).lte("date", toDate),
      supabase.from("wax_return").select("wax_weight, wax_pieces, stone_weight, stone_count, setting_stone_count").gte("date", fromDate).lte("date", toDate),
      supabase.from("polish_out").select("weight, item_id").gte("date", fromDate).lte("date", toDate),
      supabase.from("polish_return").select("weight, item_id").gte("date", fromDate).lte("date", toDate),
      supabase.from("machine_polish_out").select("weight").gte("date", fromDate).lte("date", toDate),
      supabase.from("machine_polish_return").select("weight").gte("date", fromDate).lte("date", toDate),
      supabase.from("filing_rates").select("wastage_rate, amount_rate"),
    ]);

  // Filing
  const filingOutTotal = (filingOutRes.data || []).reduce((s, r) => s + Number(r.weight), 0);
  const filingRetTotal = (filingRetRes.data || []).reduce((s, r) => s + Number(r.weight), 0);
  const defaultWastageRate = (filingRatesRes.data || [])[0]?.wastage_rate ?? 0.012;
  const defaultAmountRate = (filingRatesRes.data || [])[0]?.amount_rate ?? 2.5;
  const filingLoss = calcFilingLoss(filingOutTotal, filingRetTotal);
  const filingWastage = calcFilingWastage(filingRetTotal, defaultWastageRate);
  const filingBalance = calcFilingBalanceSilver(filingWastage, filingLoss);
  const filingAmount = calcFilingAmountPayable(filingRetTotal, defaultAmountRate);

  // Wax
  const waxOutWeight = (waxOutRes.data || []).reduce((s, r) => s + Number(r.wax_weight), 0);
  const waxRetWeight = (waxRetRes.data || []).reduce((s, r) => s + Number(r.wax_weight), 0);
  const waxOutStoneW = (waxOutRes.data || []).reduce((s, r) => s + Number(r.stone_weight), 0);
  const waxRetStoneW = (waxRetRes.data || []).reduce((s, r) => s + Number(r.stone_weight), 0);
  const waxOutStoneC = (waxOutRes.data || []).reduce((s, r) => s + Number(r.stone_count), 0);
  const waxRetStoneC = (waxRetRes.data || []).reduce((s, r) => s + Number(r.stone_count), 0);
  const waxRetPieces = (waxRetRes.data || []).reduce((s, r) => s + Number(r.wax_pieces), 0);
  const waxSettingC = (waxRetRes.data || []).reduce((s, r) => s + Number(r.setting_stone_count), 0);
  const waxTotalSettingCount = calcWaxTotalSettingCount(waxRetPieces, waxSettingC);
  const waxNetStoneW = calcWaxNetStoneWeight(waxOutStoneW, waxRetStoneW);
  const waxNetStoneC = calcWaxNetStoneCount(waxOutStoneC, waxRetStoneC, waxSettingC, waxRetPieces);
  const waxDispute = calcWaxDisputeWeight(waxOutWeight, waxOutStoneW, waxRetWeight, waxRetStoneW);

  // Polish
  const polishOutTotal = (polishOutRes.data || []).reduce((s, r) => s + Number(r.weight), 0);
  const polishRetTotal = (polishRetRes.data || []).reduce((s, r) => s + Number(r.weight), 0);
  const polishBalance = calcPolishBalanceSilver(polishOutTotal, polishRetTotal);

  // Machine Polish
  const mpOutTotal = (mpOutRes.data || []).reduce((s, r) => s + Number(r.weight), 0);
  const mpRetTotal = (mpRetRes.data || []).reduce((s, r) => s + Number(r.weight), 0);
  const mpLoss = calcMachinePolishLoss(mpOutTotal, mpRetTotal);

  return {
    filing: {
      out: round4(filingOutTotal),
      return: round4(filingRetTotal),
      loss: filingLoss,
      wastage: filingWastage,
      balance_silver: filingBalance,
      amount_payable: filingAmount,
    },
    wax: {
      out_weight: round4(waxOutWeight),
      return_weight: round4(waxRetWeight),
      stone_weight: round4(waxOutStoneW),
      stone_pieces: waxOutStoneC,
      setting_count: waxTotalSettingCount,
      net_stone_weight: waxNetStoneW,
      net_stone_count: waxNetStoneC,
      dispute_weight: waxDispute,
      amount_payable: 0,
    },
    polish: {
      out: round4(polishOutTotal),
      return: round4(polishRetTotal),
      balance_silver: polishBalance,
      loss: polishBalance,
      amount_payable: 0,
    },
    machine_polish: {
      out: round4(mpOutTotal),
      return: round4(mpRetTotal),
      loss: mpLoss,
    },
  };
}

export async function getFilingCalcByEmployee(
  employeeId: string,
  fromDate: string,
  toDate: string
): Promise<FilingCalculation | null> {
  const [outRes, retRes, empRes, ratesRes] = await Promise.all([
    supabase.from("filing_out").select("weight, item_id").eq("employee_id", employeeId).gte("date", fromDate).lte("date", toDate),
    supabase.from("filing_return").select("weight, item_id").eq("employee_id", employeeId).gte("date", fromDate).lte("date", toDate),
    supabase.from("employees").select("name").eq("id", employeeId).single(),
    supabase.from("filing_rates").select("wastage_rate, amount_rate").limit(1).single(),
  ]);

  if (empRes.error) return null;

  const outWeight = (outRes.data || []).reduce((s, r) => s + Number(r.weight), 0);
  const retWeight = (retRes.data || []).reduce((s, r) => s + Number(r.weight), 0);
  const wastageRate = ratesRes.data?.wastage_rate ?? 0.012;
  const amountRate = ratesRes.data?.amount_rate ?? 2.5;

  const loss = calcFilingLoss(outWeight, retWeight);
  const wastage = calcFilingWastage(retWeight, wastageRate);
  const balance = calcFilingBalanceSilver(wastage, loss);
  const amount = calcFilingAmountPayable(retWeight, amountRate);

  return {
    employee_id: employeeId,
    employee_name: empRes.data.name,
    filing_out_weight: round4(outWeight),
    filing_return_weight: round4(retWeight),
    adjusted_return_weight: round4(retWeight),
    loss_as_filing: loss,
    wastage,
    balance_silver: balance,
    amount_payable: amount,
  };
}

export async function getWaxCalcByEmployee(
  employeeId: string,
  fromDate: string,
  toDate: string
): Promise<WaxCalculation | null> {
  const [outRes, retRes, empRes] = await Promise.all([
    supabase.from("wax_out").select("wax_weight, stone_weight, stone_count, job_rate_id").eq("employee_id", employeeId).gte("date", fromDate).lte("date", toDate),
    supabase.from("wax_return").select("wax_weight, wax_pieces, stone_weight, stone_count, setting_stone_count").eq("employee_id", employeeId).gte("date", fromDate).lte("date", toDate),
    supabase.from("employees").select("name").eq("id", employeeId).single(),
  ]);

  if (empRes.error) return null;

  const outWaxW = (outRes.data || []).reduce((s, r) => s + Number(r.wax_weight), 0);
  const retWaxW = (retRes.data || []).reduce((s, r) => s + Number(r.wax_weight), 0);
  const outStoneW = (outRes.data || []).reduce((s, r) => s + Number(r.stone_weight), 0);
  const retStoneW = (retRes.data || []).reduce((s, r) => s + Number(r.stone_weight), 0);
  const outStoneC = (outRes.data || []).reduce((s, r) => s + Number(r.stone_count), 0);
  const retStoneC = (retRes.data || []).reduce((s, r) => s + Number(r.stone_count), 0);
  const retPieces = (retRes.data || []).reduce((s, r) => s + Number(r.wax_pieces), 0);
  const settingC = (retRes.data || []).reduce((s, r) => s + Number(r.setting_stone_count), 0);

  const totalSettingCount = calcWaxTotalSettingCount(retPieces, settingC);
  const netStoneW = calcWaxNetStoneWeight(outStoneW, retStoneW);
  const netStoneC = calcWaxNetStoneCount(outStoneC, retStoneC, settingC, retPieces);
  const inwards = calcWaxInwards(retStoneW, retWaxW);
  const outwards = calcWaxOutwards(outStoneW, outWaxW);
  const dispute = calcWaxDisputeWeight(outWaxW, outStoneW, retWaxW, retStoneW);

  return {
    employee_id: employeeId,
    employee_name: empRes.data.name,
    outward_wax_weight: round4(outWaxW),
    return_wax_weight: round4(retWaxW),
    outward_stone_weight: round4(outStoneW),
    return_stone_weight: round4(retStoneW),
    outward_stone_count: outStoneC,
    return_stone_count: retStoneC,
    return_wax_pieces: retPieces,
    setting_stone_count: settingC,
    total_setting_count: totalSettingCount,
    amount: 0,
    net_stone_weight: netStoneW,
    net_stone_count: netStoneC,
    inwards,
    outwards,
    dispute_weight: dispute,
  };
}

export async function getPolishCalcByEmployee(
  employeeId: string,
  fromDate: string,
  toDate: string
): Promise<PolishCalculation | null> {
  const [outRes, retRes, empRes] = await Promise.all([
    supabase.from("polish_out").select("weight").eq("employee_id", employeeId).gte("date", fromDate).lte("date", toDate),
    supabase.from("polish_return").select("weight").eq("employee_id", employeeId).gte("date", fromDate).lte("date", toDate),
    supabase.from("employees").select("name").eq("id", employeeId).single(),
  ]);

  if (empRes.error) return null;
  const outW = (outRes.data || []).reduce((s, r) => s + Number(r.weight), 0);
  const retW = (retRes.data || []).reduce((s, r) => s + Number(r.weight), 0);
  const balance = calcPolishBalanceSilver(outW, retW);

  return {
    employee_id: employeeId,
    employee_name: empRes.data.name,
    polish_out_weight: round4(outW),
    polish_return_weight: round4(retW),
    balance_silver: balance,
    amount_payable: 0,
  };
}

export async function getMachinePolishCalcByEmployee(
  employeeId: string,
  fromDate: string,
  toDate: string
): Promise<MachinePolishCalculation | null> {
  const [outRes, retRes, empRes] = await Promise.all([
    supabase.from("machine_polish_out").select("weight").eq("employee_id", employeeId).gte("date", fromDate).lte("date", toDate),
    supabase.from("machine_polish_return").select("weight").eq("employee_id", employeeId).gte("date", fromDate).lte("date", toDate),
    supabase.from("employees").select("name").eq("id", employeeId).single(),
  ]);

  if (empRes.error) return null;
  const outW = (outRes.data || []).reduce((s, r) => s + Number(r.weight), 0);
  const retW = (retRes.data || []).reduce((s, r) => s + Number(r.weight), 0);

  return {
    employee_id: employeeId,
    employee_name: empRes.data.name,
    machine_polish_out_weight: round4(outW),
    machine_polish_return_weight: round4(retW),
    machine_polish_loss: calcMachinePolishLoss(outW, retW),
  };
}

export function getDateRange(filter: string, custom?: { from: string; to: string }): { from: string; to: string } {
  const today = new Date();
  const fmt = (d: Date) => format(d, "yyyy-MM-dd");

  switch (filter) {
    case "today":
      return { from: fmt(today), to: fmt(today) };
    case "yesterday": {
      const y = new Date(today);
      y.setDate(y.getDate() - 1);
      return { from: fmt(y), to: fmt(y) };
    }
    case "this_week": {
      const start = new Date(today);
      start.setDate(today.getDate() - today.getDay());
      return { from: fmt(start), to: fmt(today) };
    }
    case "this_month":
      return { from: fmt(new Date(today.getFullYear(), today.getMonth(), 1)), to: fmt(today) };
    case "prev_month": {
      const first = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const last = new Date(today.getFullYear(), today.getMonth(), 0);
      return { from: fmt(first), to: fmt(last) };
    }
    case "custom":
      return custom || { from: fmt(today), to: fmt(today) };
    default:
      return { from: fmt(today), to: fmt(today) };
  }
}
