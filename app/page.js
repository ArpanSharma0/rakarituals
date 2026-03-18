import Navbar from "@/components/Navbar";
import HeroSequence from "@/components/HeroSequence";
import FeaturedProducts from "@/sections/FeaturedProducts";
import AllProducts from "@/sections/AllProducts";
import OurMission from "@/sections/OurMission";
import Testimonials from "@/sections/Testimonials";
import Footer from "@/sections/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <HeroSequence />
      <FeaturedProducts />
      <AllProducts />
      <OurMission />
      <Testimonials />
      <Footer />
    </main>
  );
}
