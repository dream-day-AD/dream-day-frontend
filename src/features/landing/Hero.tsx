import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="py-20 text-center bg-gray-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto px-4"
      >
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">
          Plan Your Dream Wedding with Ease
        </h1>
        <p className="text-lg sm:text-xl text-gray-400 mb-8">
          From budgets to guest lists, DreamDay helps you organize every detail
          seamlessly.
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild size="lg">
            <Link to="/register">Get Started</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/login">Login</Link>
          </Button>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
