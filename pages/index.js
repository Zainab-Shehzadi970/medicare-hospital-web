import Hero from "@/components/hero";
import About from "@/components/about";
import Services from "@/components/services";
import Doctors from "@/components/doctors";
import Facilities from "@/components/facilities";
import Faq from "@/components/faq";
import Testimonials from "@/components/testimonials";
import Emergency from "@/components/emergency";
import Footer from "@/components/footer"


export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Services />
      <Doctors />
      <Facilities />
      <Faq />
      <Testimonials />
      <Emergency />
      <Footer />
    </>
  );
}