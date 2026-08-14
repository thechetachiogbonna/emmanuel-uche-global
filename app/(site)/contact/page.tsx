import type { Metadata } from "next";
import Marquee from "@/components/Marquee";
import PageHero from "@/components/PageHero";
import ContactSection from "@/components/ContactSection";

export const metadata: Metadata = {
  title: "Contact — Uche Fashion International",
  description:
    "Get in touch with Uche Fashion International for orders, made-to-order enquiries, and stockist partnerships.",
};

export default function ContactPage() {
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
        imageAlt="Uche Fashion International studio in Aba"
      />
      <Marquee />
      <ContactSection />
    </main>
  );
}
