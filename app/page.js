import Navbar from "@/components/Navbar";
import HeroCarousel from "@/components/HeroCarousel";
import FeaturedProducts from "@/sections/FeaturedProducts";
import AllProducts from "@/sections/AllProducts";
import OurMission from "@/sections/OurMission";
import Testimonials from "@/sections/Testimonials";
import Footer from "@/sections/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <HeroCarousel />
      <FeaturedProducts />
      <AllProducts />
      <OurMission />
      <Testimonials />
      <Footer />
    </main>
  );
}

