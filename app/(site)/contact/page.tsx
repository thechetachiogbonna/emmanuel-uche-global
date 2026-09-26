import type { Metadata } from "next";
import Marquee from "@/components/Marquee";
import PageHero from "@/components/PageHero";
import ContactSection from "@/components/ContactSection";
import { getStoreSettings } from "@/lib/admin/queries";

export const metadata: Metadata = {
  title: "Contact — Emmanuel Uche Global",
  description:
    "Get in touch with Emmanuel Uche Global for orders, made-to-order enquiries, and stockist partnerships.",
};

export default async function ContactPage() {
  const settings = await getStoreSettings();

  return (
    <main className="flex-1">
      <PageHero
        tag="Studio"
        title={
          <>
            Get in
            <br />
            <span className="italic text-clay">touch.</span>
          </>
        }
        description="Questions about orders, made-to-order pieces, or stockist partnerships — we'd love to hear from you."
        primaryCta={{ label: "Send a Message", href: "#contact-form" }}
        secondaryCta={{ label: "Back to Home", href: "/" }}
        image="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1600&q=80"
        imageAlt="Emmanuel Uche Global studio in Aba"
      />
      <Marquee />
      <ContactSection
        settings={{
          studioLocation: settings.studioLocation,
          supportEmail: settings.supportEmail,
          supportPhone: settings.supportPhone,
          hours: settings.hours,
        }}
      />
    </main>
  );
}
