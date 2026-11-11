import Image from "next/image";
import Link from "next/link";
import Blog from "./(components)/Blog";
import FeaturedProducts from "./(components)/FeaturedProducts";
import Reviews from "./(components)/Reviews";

export default function Home() {
  return (
    <>
      {/* Minimalist Luxury Hero */}
      <header className="mx-auto flex min-h-[85vh] w-full max-w-7xl items-center justify-center px-4 py-12 sm:px-8 lg:py-16">
        <div className="flex w-full flex-col-reverse items-center justify-between gap-12 lg:flex-row lg:gap-16">
          {/* Left Editorial Copy */}
          <div className="w-full text-center lg:w-1/2 lg:text-left">
            <p className="text-xs uppercase tracking-[0.3em] font-semibold text-[#b39b66] mb-3">
              Haute Parfumerie • Pakistan
            </p>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold uppercase leading-[1.08] tracking-wider font-[Galsod] text-[#0e281d]">
              Explore Premium Scent
            </h1>
            <p className="mt-5 text-sm sm:text-base lg:text-lg text-neutral-700 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Artisanal Extrait de Parfum formulated with concentrated perfume oils. Subtle up close, commanding from afar, and unforgettable once you leave.
            </p>

            {/* Editorial Discovery Actions */}
            <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <Link
                href="/product"
                className="inline-flex items-center gap-2 rounded-full bg-[#1b4431] px-7 py-3.5 text-xs sm:text-sm font-semibold tracking-widest uppercase text-white hover:bg-[#0e281d] transition-all duration-200 shadow-md border border-[#255840] active:scale-[0.98]"
              >
                <span>Explore Collection</span>
                <span className="text-[#d8c38c]">→</span>
              </Link>

              <a
                href="#story"
                className="inline-flex items-center gap-2 rounded-full border border-[#1b4431]/40 bg-white/90 px-6 py-3.5 text-xs sm:text-sm font-semibold tracking-widest uppercase text-[#1b4431] hover:border-[#1b4431] hover:bg-[#1b4431] hover:text-white transition-all duration-200"
              >
                <span>The Safa Standard</span>
              </a>
            </div>

            {/* Luxury Accreditation Badges */}
            <div className="mt-10 pt-6 border-t border-[#e7decb] flex flex-wrap items-center justify-center lg:justify-start gap-5 sm:gap-6 text-xs text-neutral-600 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="text-[#b39b66]">✦</span> Extrait Concentration
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-[#b39b66]">✦</span> 12+ Hour Sillage
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-[#b39b66]">✦</span> Express Nationwide Delivery
              </span>
            </div>
          </div>

          {/* Right Showcase Visual */}
          <div className="flex w-full items-center justify-center lg:w-1/2">
            <div className="relative aspect-4/5 w-4/5 max-w-sm sm:max-w-md rounded-3xl overflow-hidden bg-gradient-to-b from-white to-[#faf7f2] border border-[#e7decb] shadow-xl p-6 sm:p-8 flex items-center justify-center group">
              <div className="relative w-full h-full">
                <Image
                  src="/images/safaPerfume.png"
                  alt="Safa Fragrance Artisanal Extrait"
                  fill
                  priority
                  className="object-contain transition-transform duration-700 ease-out group-hover:scale-105"
                  sizes="(max-width: 640px) 80vw, 400px"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Luxury Campaign Editorial Banner */}
      <section className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-12">
        <Link
          href="/product"
          className="group block relative w-full overflow-hidden rounded-xl sm:rounded-2xl md:rounded-3xl border border-[#e7decb] bg-[#faf7f2] shadow-md sm:shadow-xl hover:shadow-2xl active:scale-[0.99] transition-all duration-500"
          aria-label="Discover Safa Fragrance Private Reserve Collection"
        >
          <div className="relative w-full">
            <Image
              src="/images/banner.png"
              alt="Safa Fragrance Haute Parfumerie Campaign"
              width={1584}
              height={396}
              priority
              quality={95}
              className="w-full h-auto block object-contain transition-transform duration-700 ease-out group-hover:scale-[1.015]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 95vw, 1280px"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </Link>
      </section>

      {/* Brand Story */}
      <div id="story">
        <Blog />
      </div>

      {/* Minimalist Editorial Interlude */}
      <section className="w-full px-4 sm:px-8 py-10 sm:py-16 max-w-5xl mx-auto text-center">
        <div className="py-10 sm:py-12 border-y border-[#e7decb] space-y-3">
          <p className="text-[11px] uppercase tracking-[0.3em] font-semibold text-[#b39b66]">
            Artisanal Precision • Pure Oil Extract
          </p>
          <blockquote className="text-xl sm:text-2xl md:text-3xl font-normal text-[#0e281d] font-[Galsod] uppercase tracking-wide max-w-2xl mx-auto leading-relaxed">
            &ldquo;A fragrance should never announce itself loudly, but linger indelibly.&rdquo;
          </blockquote>
        </div>
      </section>

      {/* Curated Featured Fragrances */}
      <FeaturedProducts />

      {/* Editorial Reviews */}
      <Reviews />
    </>
  );
}
