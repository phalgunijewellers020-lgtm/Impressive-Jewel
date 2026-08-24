import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Card, CardHeader } from "../UI";
import type { CompanySettings } from "../../types";

export default function About() {
  const [company, setCompany] = useState<Partial<CompanySettings>>({});

  useEffect(() => {
    supabase.from("company_settings").select("*").limit(1).single().then(({ data }) => setCompany(data || {}));
  }, []);

  const field = (label: string, value: string | undefined) =>
    value ? (
      <div className="flex items-start gap-3 py-2 border-b border-[#F0EBE3] last:border-0">
        <span className="text-xs font-medium text-[#78716C] w-36 shrink-0">{label}</span>
        <span className="text-sm text-[#1C1917]">{value}</span>
      </div>
    ) : null;

  return (
    <div className="space-y-5 max-w-xl">
      <div className="text-center py-6">
        <div className="w-16 h-16 rounded-xl bg-[#1C1917] flex items-center justify-center mx-auto mb-4">
          <span className="text-[#B8952A] text-3xl">◈</span>
        </div>
        <h1 className="font-display text-2xl font-bold text-[#1C1917] mb-1">{company.company_name || "Jewellery Factory"}</h1>
        <p className="text-sm text-[#78716C]">Work Management & Billing System</p>
      </div>

      <Card>
        <CardHeader title="Company Information" />
        <div className="px-5 py-2">
          {field("Address", company.address)}
          {field("City", company.city)}
          {field("State", company.state)}
          {field("PIN Code", company.pin_code)}
          {field("Contact", company.contact_number)}
          {field("Alternate Contact", company.alternate_contact)}
          {field("Email", company.email)}
          {field("Website", company.website)}
          {field("GST Number", company.gst_number)}
          {field("Business Reg.", company.business_reg_number)}
          {field("Additional Info", company.additional_info)}
        </div>
      </Card>

      <Card>
        <CardHeader title="System Information" />
        <div className="px-5 py-2">
          {field("Version", "1.0.0")}
          {field("Modules", "Filing, Wax/Setting, Polish, Machine Polish")}
          {field("Database", "Supabase PostgreSQL")}
          {field("Built with", "React 19 + Vite + Tailwind CSS v4")}
        </div>
      </Card>
    </div>
  );
}
