import { Star } from "lucide-react";

const reviews = [
  {
    quote: "Oud Maracuja has the kind of dry-down people ask about. It opens bright with passionfruit, then settles into something warm, smoky, and quietly luxurious.",
    name: "Hassan R.",
    detail: "Oud Maracuja • Extrait",
  },
  {
    quote: "Pink Poison is playful without being too sweet. I wore it to a brunch and ended up taking the bottle along for the evening because the scent stayed soft and noticeable all day.",
    name: "Areeba M.",
    detail: "Pink Poison • Edition 01",
  },
  {
    quote: "Executive feels polished from the first spray. It has a clean, confident cedar-bergamot edge that works especially well for corporate meetings.",
    name: "Usman K.",
    detail: "Executive • Signature",
  },
  {
    quote: "Maverick is my everyday choice now. Fresh, bold and easy to wear, with magnetic energy and enough artisanal character to feel like its own signature.",
    name: "Bilal A.",
    detail: "Maverick • Eau de Parfum",
  },
];

export default function Reviews() {
  return (
    <section className="w-full border-t border-[#e7decb] py-16 sm:py-24" aria-labelledby="reviews-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
        <div className="mb-12 flex flex-col items-center justify-between gap-4 text-center sm:mb-16 md:flex-row md:items-end md:text-left">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.3em] font-semibold text-[#b39b66]">
              Patron Notes
            </p>
            <h2 id="reviews-heading" className="text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-wider text-[#0e281d] font-[Galsod]">
              Loved for the last note
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-neutral-700 sm:text-base font-normal">
            Reflections from patrons who made these artisanal scents part of their daily ritual.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {reviews.map((review) => (
            <article
              key={review.name}
              className="flex min-h-[260px] flex-col rounded-3xl border border-[#e7decb]/70 bg-white/90 p-6 sm:p-7 transition-all duration-300 hover:border-[#1b4431] hover:shadow-md"
            >
              <div className="flex items-center gap-1 text-[#b39b66]" aria-label="5 out of 5 stars">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} fill="currentColor" className="size-3.5" aria-hidden="true" />
                ))}
              </div>
              <blockquote className="mt-5 flex-1 text-sm leading-relaxed text-neutral-700 font-normal">
                &ldquo;{review.quote}&rdquo;
              </blockquote>
              <footer className="mt-6 border-t border-[#eee6d7] pt-4">
                <p className="text-sm font-semibold text-neutral-900 font-sans">{review.name}</p>
                <p className="mt-0.5 text-[11px] uppercase tracking-wider text-[#b39b66] font-medium">{review.detail}</p>
              </footer>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
