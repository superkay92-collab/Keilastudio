"use client";

import { useEffect, useState, useCallback } from "react";
import { Save, Store, CreditCard, Share2, Phone, Check } from "lucide-react";
import toast from "react-hot-toast";
import type { StoreSettings } from "@/app/api/settings/route";
import clsx from "clsx";

type Section = "store" | "contact" | "payment" | "socials";

const SECTIONS: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: "store", label: "Store Info", icon: Store },
  { id: "contact", label: "Contact", icon: Phone },
  { id: "payment", label: "Payment Details", icon: CreditCard },
  { id: "socials", label: "Social Media", icon: Share2 },
];

function Field({
  label, hint, value, onChange, type = "text", placeholder,
}: {
  label: string; hint?: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
        {label}
        {hint && <span className="ml-1 font-normal normal-case text-muted">— {hint}</span>}
      </label>
      <input
        type={type} value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-cream-dark bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-charcoal"
      />
    </div>
  );
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [active, setActive] = useState<Section>("store");
  const [saved, setSaved] = useState(false);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings", { cache: "no-store" });
      setSettings(await res.json());
    } catch { toast.error("Failed to load settings"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  function set<K extends keyof StoreSettings>(section: K, key: string, value: string) {
    setSettings((prev) => {
      if (!prev) return prev;
      return { ...prev, [section]: { ...prev[section], [key]: value } };
    });
  }

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      toast.success("Settings saved");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { toast.error("Failed to save settings"); }
    finally { setSaving(false); }
  }

  if (loading || !settings) {
    return (
      <div className="p-6 lg:p-8">
        <div className="h-8 w-48 bg-cream-dark animate-pulse mb-8" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-cream-dark animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-xs text-muted mt-0.5">Store information, payment details &amp; more</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={clsx(
            "flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-colors",
            saved
              ? "bg-green-600 text-white"
              : "bg-charcoal text-cream hover:bg-charcoal/90",
            saving && "opacity-50 cursor-not-allowed"
          )}
        >
          {saved ? <><Check size={14} /> Saved</> : saving ? <span className="animate-pulse">Saving…</span> : <><Save size={14} /> Save Changes</>}
        </button>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 mb-8 border-b border-cream-dark">
        {SECTIONS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActive(id)}
            className={clsx(
              "flex items-center gap-2 px-4 py-2.5 text-sm -mb-px border-b-2 transition-colors",
              active === id
                ? "border-charcoal text-charcoal font-medium"
                : "border-transparent text-muted hover:text-charcoal"
            )}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* Store Info */}
      {active === "store" && (
        <div className="space-y-5">
          <Field label="Store Name" value={settings.store.name}
            onChange={(v) => set("store", "name", v)} placeholder="Keila's Studio Extensions" />
          <Field label="Tagline" hint="shown under the logo"
            value={settings.store.tagline}
            onChange={(v) => set("store", "tagline", v)}
            placeholder="Premium Hair Extensions · Accra, Ghana" />
          <Field label="Location" value={settings.store.location}
            onChange={(v) => set("store", "location", v)} placeholder="Accra, Ghana" />
          <Field label="Default Currency" hint="GHS or USD"
            value={settings.store.currency}
            onChange={(v) => set("store", "currency", v)} placeholder="GHS" />
        </div>
      )}

      {/* Contact */}
      {active === "contact" && (
        <div className="space-y-5">
          <Field label="Support Email" type="email" value={settings.contact.email}
            onChange={(v) => set("contact", "email", v)}
            placeholder="support@keilastudio.com" />
          <Field label="Phone Number" type="tel" value={settings.contact.phone}
            onChange={(v) => set("contact", "phone", v)}
            placeholder="+233 XX XXX XXXX" />
          <Field label="WhatsApp Number" hint="digits only, no spaces (e.g. 233241234567)"
            value={settings.contact.whatsapp}
            onChange={(v) => set("contact", "whatsapp", v)}
            placeholder="233241234567" />
          {settings.contact.whatsapp && (
            <a
              href={`https://wa.me/${settings.contact.whatsapp}`}
              target="_blank" rel="noopener noreferrer"
              className="inline-block text-xs text-green-700 underline"
            >
              Preview WhatsApp link →
            </a>
          )}
        </div>
      )}

      {/* Payment */}
      {active === "payment" && (
        <div className="space-y-5">
          <p className="text-xs text-muted bg-cream-dark px-4 py-3">
            These details are shown to customers at checkout when paying manually.
          </p>
          <div className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Mobile Money</p>
            <Field label="MoMo Account Name" value={settings.paymentDetails.momoName}
              onChange={(v) => set("paymentDetails", "momoName", v)}
              placeholder="Keila's Studio" />
            <Field label="MoMo Number" value={settings.paymentDetails.momoNumber}
              onChange={(v) => set("paymentDetails", "momoNumber", v)}
              placeholder="024XXXXXXX" />
          </div>
          <hr className="border-cream-dark" />
          <div className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Bank Transfer</p>
            <Field label="Bank Name" value={settings.paymentDetails.bankName}
              onChange={(v) => set("paymentDetails", "bankName", v)}
              placeholder="e.g. GCB Bank" />
            <Field label="Account Number" value={settings.paymentDetails.accountNumber}
              onChange={(v) => set("paymentDetails", "accountNumber", v)}
              placeholder="1234567890" />
            <Field label="Account Name" value={settings.paymentDetails.accountName}
              onChange={(v) => set("paymentDetails", "accountName", v)}
              placeholder="Keila's Studio" />
          </div>
        </div>
      )}

      {/* Socials */}
      {active === "socials" && (
        <div className="space-y-5">
          <Field label="Instagram" hint="handle with @"
            value={settings.socials.instagram}
            onChange={(v) => set("socials", "instagram", v)}
            placeholder="@keilasstudio" />
          <Field label="Facebook" hint="full URL or page name"
            value={settings.socials.facebook}
            onChange={(v) => set("socials", "facebook", v)}
            placeholder="fb.com/keilasstudio" />
          <Field label="TikTok" hint="handle with @"
            value={settings.socials.tiktok}
            onChange={(v) => set("socials", "tiktok", v)}
            placeholder="@keilasstudio" />
        </div>
      )}

      {/* Save footer */}
      <div className="mt-10 pt-6 border-t border-cream-dark flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className={clsx(
            "flex items-center gap-2 px-8 py-3 text-sm font-medium transition-colors",
            saved ? "bg-green-600 text-white" : "bg-charcoal text-cream hover:bg-charcoal/90",
            saving && "opacity-50 cursor-not-allowed"
          )}
        >
          {saved ? <><Check size={14} /> Saved</> : saving ? <span className="animate-pulse">Saving…</span> : <><Save size={14} /> Save Changes</>}
        </button>
      </div>
    </div>
  );
}
