import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

const testimonials = [
  {
    name: 'Sarah & James',
    quote: 'DreamDay made our wedding planning stress-free and fun!',
  },
  {
    name: 'Emily, Wedding Planner',
    quote: 'Managing multiple weddings has never been easier.',
  },
  {
    name: 'Mike & Lisa',
    quote: 'The budget tracker saved us from overspending!',
  },
];

const Testimonials = () => {
  return (
    <section className="py-16 bg-gray-900">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-semibold text-center mb-12">
          What Our Users Say
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="bg-gray-800 border-none">
                <CardContent className="pt-6">
                  <p className="text-gray-400 italic mb-4">
                    "{testimonial.quote}"
                  </p>
                  <p className="font-semibold">{testimonial.name}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
