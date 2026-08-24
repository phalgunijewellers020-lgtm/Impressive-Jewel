import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useApp } from "../../context/AppContext";
import { PageHeader, Card, CardHeader, Field, Input, Textarea, Btn } from "../UI";
import type { CompanySettings } from "../../types";

export default function SystemSettings() {
  const { addToast } = useApp();
  const [settings, setSettings] = useState<Partial<CompanySettings>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("company_settings").select("*").limit(1).single().then(({ data }) => {
      setSettings(data || {});
      setLoading(false);
    });
  }, []);

  function update(key: keyof CompanySettings, value: string) {
    setSettings((s) => ({ ...s, [key]: value }));
  }

  async function save() {
    setSaving(true);
    let error;
    if (settings.id) {
      ({ error } = await supabase.from("company_settings").update(settings).eq("id", settings.id));
    } else {
      ({ error } = await supabase.from("company_settings").insert(settings));
    }
    if (error) addToast("error", "Unable to save settings.");
    else addToast("success", "Settings saved successfully.");
    setSaving(false);
  }

  if (loading) return <div className="text-sm text-[#78716C] p-4">Loading settings…</div>;

  const f = (key: keyof CompanySettings) => String(settings[key] || "");
  const s = (key: keyof CompanySettings) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => update(key, e.target.value);

  return (
    <div className="space-y-5 max-w-2xl">
      <PageHeader title="System Settings" subtitle="Company information used across the dashboard and PDFs" />

      <Card>
        <CardHeader title="Company Details" />
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Company Name" required><Input value={f("company_name")} onChange={s("company_name")} /></Field>
          <Field label="GST Number"><Input value={f("gst_number")} onChange={s("gst_number")} /></Field>
          <Field label="Business Registration Number"><Input value={f("business_reg_number")} onChange={s("business_reg_number")} /></Field>
          <Field label="Contact Number"><Input type="tel" value={f("contact_number")} onChange={s("contact_number")} /></Field>
          <Field label="Alternate Contact"><Input type="tel" value={f("alternate_contact")} onChange={s("alternate_contact")} /></Field>
          <Field label="Email"><Input type="email" value={f("email")} onChange={s("email")} /></Field>
          <Field label="Website"><Input type="url" value={f("website")} onChange={s("website")} /></Field>
          <div className="sm:col-span-2">
            <Field label="Address">
              <Textarea value={f("address")} onChange={s("address")} />
            </Field>
          </div>
          <Field label="City"><Input value={f("city")} onChange={s("city")} /></Field>
          <Field label="State"><Input value={f("state")} onChange={s("state")} /></Field>
          <Field label="PIN Code"><Input value={f("pin_code")} onChange={s("pin_code")} /></Field>
          <div className="sm:col-span-2">
            <Field label="Additional Information">
              <Textarea value={f("additional_info")} onChange={s("additional_info")} />
            </Field>
          </div>
        </div>
        <div className="px-5 py-3 border-t border-[#E7E0D8] flex justify-end">
          <Btn loading={saving} onClick={save}>Save Settings</Btn>
        </div>
      </Card>
    </div>
  );
}
