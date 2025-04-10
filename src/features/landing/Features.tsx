import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

const features = [
  {
    title: 'Budget Tracker',
    description:
      'Monitor your wedding expenses with real-time updates and visualizations.',
  },
  {
    title: 'Guest List Management',
    description:
      'Easily manage RSVPs, meal preferences, and seating arrangements.',
  },
  {
    title: 'Vendor Catalog',
    description:
      'Browse and book trusted vendors for every aspect of your wedding.',
  },
  {
    title: 'Timeline Planner',
    description:
      'Schedule your big day with a customizable, interactive calendar.',
  },
];

const Features = () => {
  return (
    <section className="py-16 bg-gray-800">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-semibold text-center mb-12">
          Why Choose DreamDay?
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="bg-gray-900 border-none h-full">
                <CardHeader>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
