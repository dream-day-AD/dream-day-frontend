import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { useState } from 'react';

const testimonials = [
  {
    name: 'Sarah & James',
    quote:
      'DreamDay made our wedding planning stress-free and fun! The tools were intuitive and helped us stay organized throughout the entire process.',
    image:
      'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    role: 'Newlyweds',
    location: 'San Francisco, CA',
    rating: 5,
  },
  {
    name: 'Emily Rodriguez',
    quote:
      'Managing multiple weddings has never been easier. As a professional planner, I need reliable tools that can handle complex schedules and budgets. DreamDay delivers on all fronts.',
    image:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    role: 'Wedding Planner',
    location: 'Chicago, IL',
    rating: 5,
  },
  {
    name: 'Mike & Lisa',
    quote:
      'The budget tracker saved us from overspending! We were able to visualize our expenses and make adjustments that ultimately saved us thousands without compromising on our dream wedding.',
    image:
      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    role: 'Newlyweds',
    location: 'Boston, MA',
    rating: 5,
  },
  {
    name: 'Jennifer & Alex',
    quote:
      'The guest management feature was a lifesaver! Tracking RSVPs, meal preferences, and sending updates to guests made the whole process seamless and professional.',
    image:
      'https://images.unsplash.com/photo-1546961329-78bef0414d7c?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    role: 'Married in 2024',
    location: 'Austin, TX',
    rating: 4,
  },
];

const Testimonials = () => {
  // Dark blue color palette variables
  const colors = {
    darkBlue1: '#0A1929', // Darkest blue
    darkBlue2: '#11294D', // Dark blue
    darkBlue3: '#1A3A6E', // Medium blue
    darkBlue4: '#2E4E8F', // Lighter accent blue
    lightAccent: '#4C9FE6', // Light blue accent
  };

  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 15,
        stiffness: 100,
      },
    },
  };

  const quoteMarkVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        delay: 0.3,
        duration: 0.5,
      },
    },
  };

  // Generate stars based on rating
  const renderStars = (rating) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <span
          key={i}
          className={`text-sm ${i < rating ? 'text-yellow-400' : 'text-gray-500'}`}
        >
          ★
        </span>
      ));
  };

  return (
    <section
      className="py-24 relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${colors.darkBlue2} 0%, ${colors.darkBlue1} 100%)`,
      }}
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 right-10 w-80 h-80 rounded-full opacity-10"
          initial={{ opacity: 0.05 }}
          animate={{
            opacity: [0.05, 0.1, 0.05],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            background: `radial-gradient(circle, ${colors.lightAccent} 0%, transparent 70%)`,
            filter: 'blur(40px)',
          }}
        />
        <motion.div
          className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full opacity-10"
          initial={{ opacity: 0.05 }}
          animate={{
            opacity: [0.05, 0.08, 0.05],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
          style={{
            background: `radial-gradient(circle, ${colors.darkBlue4} 0%, transparent 70%)`,
            filter: 'blur(60px)',
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <motion.span
            className="inline-block py-1 px-4 rounded-3xl text-white text-sm font-medium mb-3 backdrop-blur-md"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            style={{
              background: `linear-gradient(90deg, ${colors.darkBlue3}80 0%, ${colors.darkBlue4}80 100%)`,
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            Success Stories
          </motion.span>

          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            What Our Users Say
          </h2>

          <p className="text-lg text-blue-100/70 max-w-2xl mx-auto">
            Discover how DreamDay has transformed the wedding planning
            experience for couples and professionals alike.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              variants={cardVariants}
              onHoverStart={() => setHoveredIndex(index)}
              onHoverEnd={() => setHoveredIndex(null)}
              whileHover={{
                y: -10,
                transition: { duration: 0.3 },
              }}
              className="h-full"
            >
              <Card
                className="h-full rounded-3xl backdrop-blur-lg border border-white/10 shadow-xl overflow-hidden relative"
                style={{
                  background: `linear-gradient(135deg, rgba(26, 58, 110, 0.3) 0%, rgba(10, 25, 41, 0.5) 100%)`,
                }}
              >
                {/* Animated gradient border on hover */}
                <motion.div
                  className="absolute inset-0 opacity-0"
                  animate={{
                    opacity: hoveredIndex === index ? 1 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  style={{
                    background: `linear-gradient(to right, transparent, ${colors.lightAccent}30, transparent)`,
                    backgroundSize: '200% 100%',
                    animation:
                      hoveredIndex === index ? 'shimmer 2s infinite' : 'none',
                  }}
                />

                <CardContent className="p-6 relative z-10">
                  {/* Quote mark decoration */}
                  <motion.div
                    variants={quoteMarkVariants}
                    className="absolute -top-1 left-2 text-5xl opacity-10 leading-none"
                    style={{ color: colors.lightAccent }}
                  >
                    "
                  </motion.div>

                  <div className="flex items-center gap-3 mb-4">
                    {/* User image */}
                    <div
                      className="w-12 h-12 rounded-full overflow-hidden border-2"
                      style={{ borderColor: colors.lightAccent }}
                    >
                      <motion.img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.15 }}
                        transition={{ duration: 0.4 }}
                      />
                    </div>

                    <div className="flex-1">
                      <p className="font-semibold text-white text-sm">
                        {testimonial.name}
                      </p>
                      <p className="text-xs text-blue-200/70">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>

                  <div className="mb-2">{renderStars(testimonial.rating)}</div>

                  <p className="text-blue-100/80 text-sm leading-relaxed mb-4 italic">
                    "{testimonial.quote}"
                  </p>

                  <div className="mt-auto pt-4 border-t border-white/10 flex justify-between items-center">
                    <span className="text-xs text-blue-200/70">
                      {testimonial.location}
                    </span>
                    <motion.div
                      initial={{ opacity: 0.7 }}
                      whileHover={{ opacity: 1 }}
                      className="flex items-center text-xs text-blue-200/70"
                    >
                      <span>Verified User</span>
                      <motion.span
                        className="ml-1 text-green-400"
                        animate={{
                          opacity: [0.8, 1, 0.8],
                          scale: [1, 1.1, 1],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        ✓
                      </motion.span>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="mt-16 text-center"
        >
          <Card
            className="inline-block mx-auto py-6 px-8 rounded-full backdrop-blur-lg border border-white/10"
            style={{
              background: `linear-gradient(135deg, rgba(46, 78, 143, 0.3) 0%, rgba(10, 25, 41, 0.3) 100%)`,
            }}
          >
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              className="text-white font-medium flex items-center gap-2"
            >
              <span>Read more success stories</span>
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-blue-300"
              >
                →
              </motion.span>
            </motion.button>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
