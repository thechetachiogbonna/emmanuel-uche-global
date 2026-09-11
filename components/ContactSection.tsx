"use client";

import { useState, type FormEvent } from "react";

type Settings = {
  studioLocation: string;
  supportEmail: string;
  supportPhone: string;
  hours: string;
};

const inputClass =
  "w-full bg-transparent border-b border-ink/15 py-3 text-[15px] text-ink placeholder:text-ink-soft/50 outline-none focus:border-clay transition-colors";

export default function ContactSection({ settings }: { settings: Settings }) {
  const [submitted, setSubmitted] = useState(false);

  const contactDetails = [
    { label: "Studio", value: settings.studioLocation },
    { label: "Email", value: settings.supportEmail, href: `mailto:${settings.supportEmail}` },
    {
      label: "Phone",
      value: settings.supportPhone,
      href: `tel:${settings.supportPhone.replace(/[^\d+]/g, "")}`,
    },
    { label: "Hours", value: settings.hours },
  ];

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <section id="contact-form" className="px-6 md:px-10 py-20 md:py-28 bg-sand/30">
      <div className="grid md:grid-cols-12 gap-10 md:gap-16 items-start">
        <div className="md:col-span-5">
          <div className="aspect-[4/5] overflow-hidden mb-10 md:mb-0">
            <img
              src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=900&q=80"
              alt="Uche Fashion International studio"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="md:col-span-6 md:col-start-7">
          <p className="text-[12px] tracking-[0.18em] uppercase text-clay mb-5">
            Contact
          </p>
          <h2 className="font-display font-light text-3xl md:text-[2.6rem] leading-tight mb-6">
            Send us a
            <br className="hidden md:block" /> message.
          </h2>
          <p className="text-[15px] leading-relaxed text-ink-soft max-w-md mb-10">
            For orders or made-to-order enquiries — fill in the form and
            we&apos;ll get back to you within two business days.
          </p>

          <div className="grid sm:grid-cols-2 gap-6 mb-12 pb-10 border-b border-ink/10">
            {contactDetails.map((item) => (
              <div key={item.label}>
                <div className="text-[10px] tracking-[0.14em] uppercase text-ink-soft mb-1.5">
                  {item.label}
                </div>
                {item.href ? (
                  <a
                    href={item.href}
                    className="text-[15px] text-ink hover:text-clay transition-colors"
                  >
                    {item.value}
                  </a>
                ) : (
                  <div className="text-[15px] text-ink">{item.value}</div>
                )}
              </div>
            ))}
          </div>

          {submitted ? (
            <div className="border border-ink/10 bg-ivory px-6 py-8">
              <p className="font-display italic text-2xl text-clay mb-3">
                Message received.
              </p>
              <p className="text-[15px] leading-relaxed text-ink-soft max-w-sm">
                Thank you for reaching out. A member of our studio team will
                reply within two business days.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid sm:grid-cols-2 gap-8">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-[10px] tracking-[0.14em] uppercase text-ink-soft mb-2"
                  >
                    Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder="Your name"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-[10px] tracking-[0.14em] uppercase text-ink-soft mb-2"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="your@email.com"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block text-[10px] tracking-[0.14em] uppercase text-ink-soft mb-2"
                >
                  Subject
                </label>
                <select
                  id="subject"
                  name="subject"
                  required
                  className={`${inputClass} cursor-pointer`}
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select a topic
                  </option>
                  <option value="order">Order enquiry</option>
                  <option value="made-to-order">Made-to-order</option>
                  <option value="general">General question</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-[10px] tracking-[0.14em] uppercase text-ink-soft mb-2"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  placeholder="Tell us how we can help..."
                  className={`${inputClass} resize-none`}
                />
              </div>

              <button
                type="submit"
                className="px-6 py-3.5 bg-ink text-ivory text-[12px] tracking-[0.14em] uppercase hover:bg-clay transition-colors"
              >
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
