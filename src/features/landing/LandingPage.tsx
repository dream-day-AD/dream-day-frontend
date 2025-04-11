import { Navbar } from '@/components/common/Navbar';
import Hero from '../landing/Hero';
import Features from '../landing/Features';
import Testimonials from '../landing/Testimonials';
import CTA from '../landing/CTA';
import Footer from '../landing/Footer';

const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Features />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
