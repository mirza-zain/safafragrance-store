import { Mail, Phone } from "lucide-react";

const contactDetails = [
  {
    label: "Email",
    value: "concierge@safafragrance.com",
    href: "mailto:concierge@safafragrance.com",
    icon: Mail,
  },
  {
    label: "WhatsApp & Phone",
    value: "+92 300 1234567",
    href: "https://wa.me/923001234567",
    icon: Phone,
  },
];

const socialLinks = [
  {
    label: "Instagram",
    href: "https://www.instagram.com",
    icon: () => (
      <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.79-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com",
    icon: () => (
      <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.48 6.27 6.27 0 0 0 1.96-4.52V8.97a8.27 8.27 0 0 0 4.81 1.54V7.07c-.33 0-.67-.12-1-.38z" />
      </svg>
    ),
  },
];

export default function ContactPage() {
  return (
    <main className="w-full flex-1">
      <section className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-16 sm:py-24 lg:py-32">
        <div className="max-w-3xl">
          <p className="text-xs sm:text-sm uppercase tracking-[0.28em] text-[#b39b66] font-semibold">
            Safa Fragrance Support
          </p>
          <h1 className="mt-4 text-4xl sm:text-6xl lg:text-7xl font-bold tracking-wider leading-[1.08] text-[#0e281d] font-[Gebuk] uppercase">
            Contact Us
          </h1>
          <p className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-neutral-700 font-normal">
            Have a question about your order, custom scent recommendation, or private reserve bottles? We&apos;re happy to help.
          </p>
        </div>

        <div className="mt-14 sm:mt-20 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 border-t border-[#e7decb] pt-10 sm:pt-14">
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            {contactDetails.map(({ label, value, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                className="group flex min-h-[190px] flex-col justify-between rounded-2xl border border-[#e7decb] bg-white/70 p-6 sm:p-7 transition-all duration-200 hover:-translate-y-1 hover:border-[#1b4431] hover:bg-white active:scale-[0.98]"
              >
                <Icon className="size-8 text-[#1b4431] transition-transform duration-200 group-hover:scale-110" />
                <span>
                  <span className="block text-xs uppercase tracking-[0.2em] text-[#b39b66] font-semibold">
                    {label}
                  </span>
                  <span className="mt-2 block break-all text-base sm:text-lg font-bold text-neutral-900 font-sans tracking-wide">
                    {value}
                  </span>
                </span>
              </a>
            ))}
          </div>

          <div className="lg:col-span-5 flex flex-col justify-between border-l-0 border-[#e7decb] lg:border-l lg:pl-12">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#b39b66] font-semibold">
                Follow Us
              </p>
              <p className="mt-3 max-w-sm text-2xl sm:text-3xl font-bold uppercase text-[#0e281d] font-[Gebuk] leading-tight tracking-wider">
                Stay close to the world of Safa Fragrance.
              </p>
              <p className="mt-3 text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed">
                Receive private reserve announcements, olfactory notes, and private launch invites.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {socialLinks.map(({ label, icon: Icon, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="inline-flex items-center gap-2 rounded-full border border-[#e7decb] bg-white px-5 py-3 text-xs sm:text-sm font-semibold uppercase tracking-wider text-neutral-800 transition-colors hover:border-[#1b4431] hover:bg-[#1b4431] hover:text-white active:scale-[0.97]"
                >
                  <Icon />
                  <span>{label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
