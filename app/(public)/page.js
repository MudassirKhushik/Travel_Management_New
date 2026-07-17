import Navbar from '@/components/public/NavBar';
import Hero from '@/components/public/Hero';
import PackagesGrid from '@/components/public/PackagesGrid';
import NetworkPerks from '@/components/public/NetworkPerks';
import AboutSection from '@/components/public/AboutSection';
import MemoriesGallery from '@/components/public/MemoriesGallery';
import HypeWall from '@/components/public/HypeWall';
import CTABooking from '@/components/public/CTABooking';
import FAQSection from '@/components/public/FAQSection';
import Footer from '@/components/public/Footer';
import ScrollReset from '@/components/public/ScrollReset';

export default function Home() {
  return (
    <main className="bg-black text-white overflow-x-hidden">
      <ScrollReset />
      <Navbar />
      <Hero />
      
      {/* Add id="packages" to the section container */}
      <section id="packages">
        <PackagesGrid />
      </section>
      
      <NetworkPerks />
      
      {/* Add id="about" to the section container */}
      <section id="about">
        <AboutSection />
      </section>
      
      {/* Add id="gallery" to the section container */}
      <section id="gallery">
        <MemoriesGallery />
      </section>
      
      {/* Add id="reviews" to the section container */}
      <section id="reviews">
        <HypeWall />
      </section>
      
      {/* Add id="booking" to the section container */}
      <section id="booking">
        <CTABooking />
      </section>

      {/* Add id="faqs" to the section container */}
      <section id="faqs">
        <FAQSection />
      </section>
      
      <Footer />
    </main>
  );
}