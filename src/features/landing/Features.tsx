import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

const features = [
  {
    title: 'Budget Tracker',
    description:
      'Monitor your wedding expenses with real-time updates and visualizations.',
    icon: '💰',
    color: '#3B82F6', // Blue
  },
  {
    title: 'Guest List Management',
    description:
      'Easily manage RSVPs, meal preferences, and seating arrangements.',
    icon: '👥',
    color: '#2563EB', // Darker blue
  },
  {
    title: 'Vendor Catalog',
    description:
      'Browse and book trusted vendors for every aspect of your wedding.',
    icon: '🤝',
    color: '#1E40AF', // Even darker blue
  },
  {
    title: 'Timeline Planner',
    description:
      'Schedule your big day with a customizable, interactive calendar.',
    icon: '📅',
    color: '#1E3A8A', // Darkest blue
  },
];

const Features = () => {
  // Dark blue color palette variables
  const colors = {
    darkBlue1: '#0A1929', // Darkest blue
    darkBlue2: '#11294D', // Dark blue
    darkBlue3: '#1A3A6E', // Medium blue
    darkBlue4: '#2E4E8F', // Lighter accent blue
    lightAccent: '#4C9FE6', // Light blue accent
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.3,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
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

  const iconVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 10,
        stiffness: 100,
        delay: 0.2,
      },
    },
  };

  return (
    <section
      className="py-24 relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${colors.darkBlue1} 0%, ${colors.darkBlue2} 100%)`,
      }}
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute bottom-0 right-0 w-[800px] h-[800px] rounded-full opacity-10"
          initial={{ opacity: 0.05 }}
          animate={{
            opacity: [0.05, 0.08, 0.05],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            background: `radial-gradient(circle, ${colors.lightAccent} 0%, transparent 70%)`,
            filter: 'blur(70px)',
          }}
        />
        <motion.div
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-10"
          initial={{ opacity: 0.05 }}
          animate={{
            opacity: [0.05, 0.1, 0.05],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1.5,
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
            className="inline-block py-1 px-4 text-white rounded-3xl text-sm mb-3 backdrop-blur-md"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            style={{
              background: `linear-gradient(90deg, ${colors.darkBlue3}80 0%, ${colors.darkBlue4}80 100%)`,
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            Perfect Tools for Your Big Day
          </motion.span>

          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            Why Choose DreamDay?
          </h2>

          <p className="text-lg text-blue-100/70 max-w-2xl mx-auto">
            Our platform offers everything you need to plan your perfect wedding
            day, from budget management to guest coordination, all in one
            beautiful interface.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={cardVariants}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="group"
            >
              <Card
                className="h-full rounded-3xl backdrop-blur-lg border border-white/10 shadow-xl overflow-hidden relative"
                style={{
                  background: `linear-gradient(135deg, rgba(26, 58, 110, 0.2) 0%, rgba(10, 25, 41, 0.4) 100%)`,
                }}
              >
                {/* Card glow effect on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500 rounded-3xl"
                  style={{
                    background: `radial-gradient(circle at center, ${feature.color}50 0%, transparent 70%)`,
                    filter: 'blur(20px)',
                  }}
                ></div>

                <CardHeader className="relative z-10">
                  <motion.div
                    className="w-14 h-14 mb-4 rounded-2xl flex items-center justify-center text-2xl"
                    variants={iconVariants}
                    style={{
                      background: `linear-gradient(135deg, ${feature.color}40 0%, ${feature.color}20 100%)`,
                      border: `1px solid ${feature.color}30`,
                      boxShadow: `0 8px 20px -8px ${feature.color}40`,
                    }}
                  >
                    {feature.icon}
                  </motion.div>

                  <CardTitle className="text-xl font-bold text-white mb-1 group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-blue-200 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                    {feature.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="relative z-10">
                  <p className="text-blue-100/70 group-hover:text-blue-100/90 transition-colors duration-300">
                    {feature.description}
                  </p>

                  <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
                    <span className="text-xs text-blue-200/70">
                      Explore Feature
                    </span>
                    <motion.span
                      className="text-blue-200 text-lg"
                      initial={{ x: 0 }}
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      →
                    </motion.span>
                  </div>
                </CardContent>

                {/* Border gradient animation on hover */}
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100"
                  initial={{ width: 0 }}
                  whileHover={{ width: '100%' }}
                  transition={{ duration: 0.4 }}
                  style={{
                    background: `linear-gradient(to right, transparent, ${feature.color}, transparent)`,
                  }}
                ></motion.div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Extra element: Success metrics */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="mt-20 py-8 px-8 rounded-3xl backdrop-blur-lg border border-white/10"
          style={{
            background: `linear-gradient(135deg, rgba(26, 58, 110, 0.2) 0%, rgba(10, 25, 41, 0.3) 100%)`,
          }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '10,000+', label: 'Happy Couples' },
              { value: '98%', label: 'Satisfaction Rate' },
              { value: '15+', label: 'Planning Tools' },
              { value: '24/7', label: 'Support' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
              >
                <h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </h3>
                <p className="text-blue-100/70">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
