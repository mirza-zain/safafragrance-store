import Products from "../(components)/Products";

export default function ShopPage() {
  return (
    <section className="w-full py-16 px-4 sm:px-8 lg:px-12 mt-2 max-w-7xl mx-auto">
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-10 md:mb-14 uppercase font-[Galsod] tracking-wider text-[#0e281d]">
        Shop Best Fragrances
      </h2>
      <Products />
    </section>
  );
}
