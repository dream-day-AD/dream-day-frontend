import { Navbar } from '@/components/common/Navbar';
import Hero from '../landing/Hero';
import Features from '../landing/Features';
import Testimonials from '../landing/Testimonials';
import CTA from '../landing/CTA';
import Footer from '../landing/Footer';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { Navigate } from 'react-router-dom';

const LandingPage = () => {
  const { token } = useSelector((state: RootState) => state.auth);

  // Redirect authenticated users to dashboard
  if (token) return <Navigate to="/dashboard" />;

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
