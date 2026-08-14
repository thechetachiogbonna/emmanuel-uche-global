"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAdminSettings } from "@/lib/admin/useAdminData";

export default function SettingsPage() {
  const { settings, setSettings, hydrated } = useAdminSettings();
  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync once storage has hydrated, not a cascading update
    if (hydrated) setForm(settings);
  }, [hydrated, settings]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <h1 className="font-display text-2xl md:text-3xl mb-1">Settings</h1>
      <p className="text-[13px] text-ink-soft mb-2">
        Basic store details.
      </p>
      <p className="text-[12px] text-ink-soft mb-8 bg-sand/30 border border-ink/10 px-3 py-2 inline-block">
        Saving here updates the admin console only — the public site
        (Footer, Contact page) still reads its own hardcoded copy until
        it&apos;s wired to share this data.
      </p>

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
            onChange={(e) =>
              setForm({ ...form, studioLocation: e.target.value })
            }
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
              onChange={(e) =>
                setForm({ ...form, supportEmail: e.target.value })
              }
              className="w-full border border-ink/20 px-3 py-2.5 text-sm outline-none focus:border-clay transition-colors"
            />
          </div>
          <div>
            <label className="block text-[12px] tracking-wide uppercase text-ink-soft mb-2">
              Support Phone
            </label>
            <input
              value={form.supportPhone}
              onChange={(e) =>
                setForm({ ...form, supportPhone: e.target.value })
              }
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
            className="bg-ink text-ivory text-[12px] tracking-[0.14em] uppercase py-3 px-6 hover:bg-clay transition-colors"
          >
            Save Settings
          </button>
          {saved && (
            <span className="text-[13px] text-green-800">Saved ✓</span>
          )}
        </div>
      </form>
    </div>
  );
}
