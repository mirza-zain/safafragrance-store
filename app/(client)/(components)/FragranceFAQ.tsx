'use client';

import { useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";

const FAQS = [
  {
    q: "What makes Safa Fragrance an 'Extrait de Parfum'?",
    a: "Standard perfumes on the market (Eau de Toilette or Eau de Parfum) typically contain 10% to 15% fragrance oil, diluted heavily with alcohol and water. Safa Fragrance editions are formulated at 30% to 38% pure perfume oil concentration. This gives our scents their velvety density, rich dry-down, and 14+ hours of lasting power."
  },
  {
    q: "How does Cash on Delivery (COD) work?",
    a: "Cash on Delivery is available for all addresses within Karachi. When our courier delivers your parcel, you can inspect the sealed luxury packaging and pay in cash. For other nationwide cities, we accept instant Bank Transfer via Raast, 1Link, EasyPaisa, and SadaPay."
  },
  {
    q: "What is your shipping timeline?",
    a: "Karachi orders are dispatched via our Safa Direct Concierge courier within 24 to 48 hours. Nationwide orders to Lahore, Islamabad, Faisalabad, and other cities are sent via express air courier (TCS/Leopards/Trax) and typically arrive within 2 to 4 business days."
  },
  {
    q: "Can I track my order once placed?",
    a: "Yes! Every order generates an authentic tracking ID (e.g. SAFA-XXXXXX). You can check its real-time bottling and courier status at any moment using our Track Order portal in the navbar."
  },
  {
    q: "How do I store my luxury perfume?",
    a: "Because our formulations contain high amounts of natural absolutes and resins, keep your bottles stored upright in a cool, shaded environment away from direct sunlight and extreme heat."
  }
];

export default function FragranceFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="w-full py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="text-center space-y-3 mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#e5dbc7] text-[#1b4431] text-xs font-bold tracking-[0.25em] uppercase shadow-xs">
          <Sparkles size={13} className="text-[#b39b66]" />
          <span>Need Guidance?</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-neutral-900 font-serif">
          Frequently Asked Questions
        </h2>
      </div>

      <div className="space-y-3">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={faq.q}
              className="bg-white rounded-2xl border border-[#e5dbc7] overflow-hidden transition-all shadow-xs"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-5 sm:p-6 text-left flex justify-between items-center gap-4 hover:bg-[#faf7f2] transition"
              >
                <span className="text-base font-bold text-neutral-900">{faq.q}</span>
                <ChevronDown
                  size={18}
                  className={`text-[#1b4431] transition-transform duration-200 shrink-0 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-5 sm:px-6 pb-6 text-sm text-neutral-600 leading-relaxed border-t border-[#f0e8d9] pt-4 font-light">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

