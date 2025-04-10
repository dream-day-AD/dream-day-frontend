import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const CTA = () => {
  return (
    <section className="py-20 text-center bg-gray-800">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto px-4"
      >
        <h2 className="text-3xl sm:text-4xl font-semibold mb-4">
          Ready to Plan Your Perfect Wedding?
        </h2>
        <p className="text-lg sm:text-xl text-gray-400 mb-8">
          Join DreamDay today and start organizing effortlessly.
        </p>
        <Button asChild size="lg">
          <Link to="/register">Sign Up Now</Link>
        </Button>
      </motion.div>
    </section>
  );
};

export default CTA;
