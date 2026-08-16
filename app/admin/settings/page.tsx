import { getStoreSettings } from "@/lib/admin/queries";
import SettingsForm from "@/components/admin/SettingsForm";

export default async function SettingsPage() {
  const settings = await getStoreSettings();

  return (
    <div>
      <h1 className="font-display text-2xl md:text-3xl mb-1">Settings</h1>
      <p className="text-[13px] text-ink-soft mb-2">Basic store details.</p>
      <p className="text-[12px] text-ink-soft mb-8 bg-sand/30 border border-ink/10 px-3 py-2 inline-block">
        Saved to Postgres — but the public site&apos;s Footer and Contact
        page still show their own hardcoded copy until those are wired to
        read from here too.
      </p>
      <SettingsForm
        initial={{
          storeName: settings.storeName,
          studioLocation: settings.studioLocation,
          supportEmail: settings.supportEmail,
          supportPhone: settings.supportPhone,
          hours: settings.hours,
        }}
      />
    </div>
  );
}
