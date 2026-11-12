import Image from "next/image";
import Link from "next/link";
import Blog from "./(components)/Blog";
import FeaturedProducts from "./(components)/FeaturedProducts";
import Reviews from "./(components)/Reviews";
import Safa3DHero from "./(components)/Safa3DHero";

export default function Home() {
  return (
    <>
      {/* Cinematic Haute Parfumerie 3D Flacon Stage */}
      <Safa3DHero />

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
