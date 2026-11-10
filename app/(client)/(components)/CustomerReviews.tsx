import { Star, CheckCircle2 } from "lucide-react";

const REVIEWS = [
  {
    quote: "Safa Royale Oud has that rare dry-down people literally stop you in the elevator to ask about. Two sprays in the morning lasted through dinner and midnight tea.",
    author: "Zubair A.",
    city: "Karachi",
    fragrance: "Safa Royale Oud",
    rating: 5
  },
  {
    quote: "Safa Velvet Rose is sheer perfection. Not cloying or overly sweet — the pink peppercorn gives it this incredible crisp edge that feels like walking through a private palace courtyard.",
    author: "Dr. Ayesha M.",
    city: "Lahore",
    fragrance: "Safa Velvet Rose",
    rating: 5
  },
  {
    quote: "Imperial Leather is my boardroom uniform now. It radiates sheer authority without giving you a headache. The leather and smoky birch notes are executed with masterclass balance.",
    author: "Usman K.",
    city: "Islamabad",
    fragrance: "Safa Imperial Leather",
    rating: 5
  },
  {
    quote: "I was skeptical about the 14-hour longevity claim, but Celestial Amber actually stayed on my cashmere blazer for two straight days. Worth every single rupee.",
    author: "Bilal H.",
    city: "Faisalabad",
    fragrance: "Safa Celestial Amber",
    rating: 5
  }
];

export default function CustomerReviews() {
  return (
    <section className="w-full py-20 sm:py-24 bg-[#f6efe4] border-t border-[#e5dbc7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-4 mb-14 text-center md:text-left">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#b39b66] mb-2">The Safa Edit</p>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-neutral-900 font-serif">
              Loved For The Last Note
            </h2>
          </div>
          <p className="text-sm text-neutral-600 max-w-sm text-center md:text-right">
            Real feedback from fragrance connoisseurs who made our Extrait de Parfum part of their daily signature.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {REVIEWS.map((rev) => (
            <div
              key={rev.author}
              className="bg-white rounded-2xl p-6 sm:p-7 border border-[#e5dbc7] shadow-xs flex flex-col justify-between hover:border-[#1b4431] transition-colors duration-300"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-500 mb-4">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} size={15} className="fill-amber-500" />
                  ))}
                </div>
                <blockquote className="text-sm text-neutral-700 leading-relaxed font-light italic">
                  “{rev.quote}”
                </blockquote>
              </div>

              <div className="pt-6 mt-6 border-t border-[#eee6d7] flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-neutral-900">{rev.author}</span>
                    <CheckCircle2 size={13} className="text-[#1b4431]" />
                  </div>
                  <span className="text-[11px] text-neutral-400 font-medium">{rev.city}</span>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#b39b66] bg-[#faf7f2] px-2 py-0.5 rounded-md border border-[#eee6d7]">
                  {rev.fragrance.replace("Safa ", "")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

