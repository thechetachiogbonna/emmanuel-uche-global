"use client";

import { useState, type FormEvent } from "react";
import { updateSettingsAction, type SettingsDraft } from "@/lib/actions/admin-settings";

export default function SettingsForm({ initial }: { initial: SettingsDraft }) {
  const [form, setForm] = useState(initial);
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await updateSettingsAction(form);
    setSubmitting(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl grid gap-5">
      <div>
        <label className="block text-[12px] tracking-wide uppercase text-ink-soft mb-2">
          Store Name
        </label>
        <input
          value={form.storeName}
          onChange={(e) => setForm({ ...form, storeName: e.target.value })}
          className="w-full border border-ink/20 px-3 py-2.5 text-sm outline-none focus:border-clay transition-colors"
        />
      </div>

      <div>
        <label className="block text-[12px] tracking-wide uppercase text-ink-soft mb-2">
          Studio Location
        </label>
        <input
          value={form.studioLocation}
          onChange={(e) => setForm({ ...form, studioLocation: e.target.value })}
          className="w-full border border-ink/20 px-3 py-2.5 text-sm outline-none focus:border-clay transition-colors"
        />
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div>
          <label className="block text-[12px] tracking-wide uppercase text-ink-soft mb-2">
            Support Email
          </label>
          <input
            value={form.supportEmail}
            onChange={(e) => setForm({ ...form, supportEmail: e.target.value })}
            className="w-full border border-ink/20 px-3 py-2.5 text-sm outline-none focus:border-clay transition-colors"
          />
        </div>
        <div>
          <label className="block text-[12px] tracking-wide uppercase text-ink-soft mb-2">
            Support Phone
          </label>
          <input
            value={form.supportPhone}
            onChange={(e) => setForm({ ...form, supportPhone: e.target.value })}
            className="w-full border border-ink/20 px-3 py-2.5 text-sm outline-none focus:border-clay transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-[12px] tracking-wide uppercase text-ink-soft mb-2">
          Hours
        </label>
        <input
          value={form.hours}
          onChange={(e) => setForm({ ...form, hours: e.target.value })}
          className="w-full border border-ink/20 px-3 py-2.5 text-sm outline-none focus:border-clay transition-colors"
        />
      </div>

      <div className="flex items-center gap-4 mt-2">
        <button
          type="submit"
          disabled={submitting}
          className="bg-ink text-ivory text-[12px] tracking-[0.14em] uppercase py-3 px-6 hover:bg-clay transition-colors disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Save Settings"}
        </button>
        {saved && <span className="text-[13px] text-green-800">Saved ✓</span>}
      </div>
    </form>
  );
}
