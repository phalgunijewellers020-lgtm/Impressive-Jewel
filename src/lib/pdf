import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { FilingCalculation, PolishCalculation, WaxCalculation } from "../types";

function addHeader(doc: jsPDF, title: string, employee: string, period: string) {
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Jewellery Factory", 14, 20);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 113, 108);
  doc.text("Work Management & Billing System", 14, 28);

  doc.setDrawColor(184, 149, 42);
  doc.setLineWidth(0.5);
  doc.line(14, 33, 196, 33);

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(28, 25, 23);
  doc.text(title, 14, 44);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(68, 64, 60);
  doc.text(`Employee: ${employee}`, 14, 53);
  doc.text(`Period: ${period}`, 14, 60);
  doc.text(`Generated: ${new Date().toLocaleString("en-IN")}`, 14, 67);

  doc.setTextColor(28, 25, 23);
}

function addFooter(doc: jsPDF) {
  const pageCount = (doc as jsPDF & { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(120, 113, 108);
    doc.text(`Page ${i} of ${pageCount}`, 100, 290, { align: "center" });
    doc.text("Jewellery Factory Work Management System", 14, 290);
  }
}

export function generateFilingPDF(calc: FilingCalculation, from: string, to: string) {
  const doc = new jsPDF();
  addHeader(doc, "Filing — Employee Calculation", calc.employee_name, `${from} to ${to}`);

  autoTable(doc, {
    startY: 75,
    head: [["Metric", "Formula", "Value"]],
    body: [
      ["Filing Out Weight", "—", `${calc.filing_out_weight.toFixed(3)} g`],
      ["Filing Return Weight", "—", `${calc.filing_return_weight.toFixed(3)} g`],
      ["Adjusted Return Weight", "= Return Weight", `${calc.adjusted_return_weight.toFixed(3)} g`],
      ["Loss as Filing", "= Out − Return", `${calc.loss_as_filing.toFixed(3)} g`],
      ["Wastage", "= Adj. Return × 0.012", `${calc.wastage.toFixed(3)} g`],
      ["Balance Silver", "= Wastage − Loss", `${calc.balance_silver.toFixed(3)} g`],
      ["Amount Payable", "= Adj. Return × 2.5", `₹ ${calc.amount_payable.toFixed(2)}`],
    ],
    styles: { fontSize: 10, cellPadding: 4 },
    headStyles: { fillColor: [28, 25, 23], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [250, 248, 245] },
    columnStyles: { 2: { fontStyle: "bold", halign: "right" } },
  });

  addFooter(doc);
  doc.save(`Filing_${calc.employee_name.replace(/\s/g, "_")}_${from}_to_${to}.pdf`);
}

export function generateWaxPDF(calc: WaxCalculation, from: string, to: string) {
  const doc = new jsPDF();
  addHeader(doc, "Wax / Setting — Employee Calculation", calc.employee_name, `${from} to ${to}`);

  autoTable(doc, {
    startY: 75,
    head: [["Metric", "Formula", "Value"]],
    body: [
      ["Outward Wax Weight", "—", `${calc.outward_wax_weight.toFixed(3)} g`],
      ["Return Wax Weight", "—", `${calc.return_wax_weight.toFixed(3)} g`],
      ["Outward Stone Weight", "—", `${calc.outward_stone_weight.toFixed(3)} g`],
      ["Return Stone Weight", "—", `${calc.return_stone_weight.toFixed(3)} g`],
      ["Outward Stone Count", "—", `${calc.outward_stone_count}`],
      ["Return Stone Count", "—", `${calc.return_stone_count}`],
      ["Return Wax Pieces", "—", `${calc.return_wax_pieces} pcs`],
      ["Setting Stone Count", "—", `${calc.setting_stone_count} per piece`],
      ["Total Setting Count", "= Pieces × Setting Ct", `${calc.total_setting_count}`],
      ["Net Stone Weight", "= Out Stone Wt − Ret Stone Wt", `${calc.net_stone_weight.toFixed(3)} g`],
      ["Net Stone Count", "= Out Ct − (Ret Ct + Setting×Pieces)", `${calc.net_stone_count}`],
      ["Inwards", "= Ret Stone Wt + Ret Wax Wt", `${calc.inwards.toFixed(3)} g`],
      ["Outwards", "= Out Stone Wt + Out Wax Wt", `${calc.outwards.toFixed(3)} g`],
      ["Dispute Weight", "= Outwards − Inwards", `${calc.dispute_weight.toFixed(3)} g`],
    ],
    styles: { fontSize: 10, cellPadding: 4 },
    headStyles: { fillColor: [28, 25, 23], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [250, 248, 245] },
    columnStyles: { 2: { fontStyle: "bold", halign: "right" } },
  });

  addFooter(doc);
  doc.save(`Wax_${calc.employee_name.replace(/\s/g, "_")}_${from}_to_${to}.pdf`);
}

export function generatePolishPDF(calc: PolishCalculation, from: string, to: string) {
  const doc = new jsPDF();
  addHeader(doc, "Polish — Employee Calculation", calc.employee_name, `${from} to ${to}`);

  autoTable(doc, {
    startY: 75,
    head: [["Metric", "Formula", "Value"]],
    body: [
      ["Polish Out Weight", "—", `${calc.polish_out_weight.toFixed(3)} g`],
      ["Polish Return Weight", "—", `${calc.polish_return_weight.toFixed(3)} g`],
      ["Balance Silver", "= Out − Return", `${calc.balance_silver.toFixed(3)} g`],
      ["Amount Payable", "—", `₹ ${calc.amount_payable.toFixed(2)}`],
    ],
    styles: { fontSize: 10, cellPadding: 4 },
    headStyles: { fillColor: [28, 25, 23], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [250, 248, 245] },
    columnStyles: { 2: { fontStyle: "bold", halign: "right" } },
  });

  addFooter(doc);
  doc.save(`Polish_${calc.employee_name.replace(/\s/g, "_")}_${from}_to_${to}.pdf`);
}
