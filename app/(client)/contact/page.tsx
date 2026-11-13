import { Phone, MessageSquare } from "lucide-react";

const whatsappNum = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "923453124310";

const contactDetails = [
  {
    label: "Direct Phone & Call",
    value: "+92 345 3124310",
    href: "tel:+923453124310",
    icon: Phone,
    description: "    For fragrance guidance, order questions, and personal recommendations.",
  },
  {
    label: "WhatsApp Concierge",
    value: "+92 345 3124310",
    href: `https://wa.me/${whatsappNum}?text=Hello%20Safa%20Fragrance,%20I%20would%20like%20guidance%20on%20choosing%20a%20signature%20scent.`,
    icon: MessageSquare,
    description: "    A direct line for orders, scent guidance, and delivery updates.",
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
          <h1 className="mt-4 text-4xl sm:text-6xl lg:text-7xl font-bold tracking-wider leading-[1.08] text-[#0e281d] font-[Galsod] uppercase">
            Contact Us
          </h1>
          <p className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-neutral-700 font-normal">
            Whether you are choosing a signature scent or checking on an order, our concierge is here to make the experience simple and personal.
          </p>
        </div>

        <div className="mt-14 sm:mt-20 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 border-t border-[#e7decb] pt-10 sm:pt-14">
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            {contactDetails.map(({ label, value, href, icon: Icon, description }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("https") ? "_blank" : undefined}
                rel={href.startsWith("https") ? "noreferrer" : undefined}
                className="group flex min-h-[220px] flex-col justify-between rounded-2xl border border-[#e7decb] bg-white/70 p-6 sm:p-7 transition-all duration-200 hover:-translate-y-1 hover:border-[#1b4431] hover:bg-white active:scale-[0.98]"
              >
                <div>
                  <Icon className="size-8 text-[#1b4431] transition-transform duration-200 group-hover:scale-110 mb-4" />
                  <span className="block text-xs uppercase tracking-[0.2em] text-[#b39b66] font-semibold">
                    {label}
                  </span>
                  <span className="mt-2 block break-all text-lg sm:text-xl font-bold text-neutral-900 font-sans tracking-wide">
                    {value}
                  </span>
                </div>
                <p className="text-xs text-neutral-600 mt-3 font-normal leading-relaxed">
                  {description}
                </p>
              </a>
            ))}
          </div>

          <div className="lg:col-span-5 flex flex-col justify-between border-l-0 border-[#e7decb] lg:border-l lg:pl-12 space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#b39b66] font-semibold">
                Based in
              </p>
              <p className="mt-3 max-w-sm text-2xl sm:text-3xl font-bold uppercase text-[#0e281d] font-[Galsod] leading-tight tracking-wider">
                Karachi, Pakistan
              </p>
            </div>

            <div className="rounded-2xl border border-[#e7decb] bg-[#faf7f2] p-6 text-xs text-neutral-700 leading-relaxed space-y-2">
              <p className="font-semibold text-[#0e281d] uppercase tracking-wider">
                Olfactory Concierge Assistance
              </p>
              <p>
                Reach us directly by phone or WhatsApp for custom formulations, decant requests, or order inquiries.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
