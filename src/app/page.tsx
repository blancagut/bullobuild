import { Hero } from "@/components/home/Hero";
import { BrandsSection } from "@/components/home/BrandsSection";
import { ProductsSection } from "@/components/home/ProductsSection";
import { DealsSection } from "@/components/home/DealsSection";
import { WhyUsSection } from "@/components/home/WhyUsSection";
import { MarketplaceSection } from "@/components/home/MarketplaceSection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <BrandsSection />
      <ProductsSection />
      <DealsSection />
      <WhyUsSection />
      <MarketplaceSection />
    </>
  );
}
