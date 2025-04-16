import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Hero = () => {
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
        staggerChildren: 0.2,
        duration: 0.8,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  const buttonHoverVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
  };

  return (
    <section
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${colors.darkBlue1} 0%, ${colors.darkBlue2} 100%)`,
      }}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-20 -right-20 w-96 h-96 rounded-full"
          initial={{ opacity: 0.2 }}
          animate={{
            opacity: [0.2, 0.3, 0.2],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            background: `radial-gradient(circle, ${colors.darkBlue4} 0%, transparent 70%)`,
            filter: 'blur(40px)',
          }}
        />
        <motion.div
          className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full"
          initial={{ opacity: 0.2 }}
          animate={{
            opacity: [0.2, 0.4, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
          style={{
            background: `radial-gradient(circle, ${colors.lightAccent} 0%, transparent 70%)`,
            filter: 'blur(40px)',
          }}
        />
      </div>

      {/* Main content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-5xl w-full mx-auto px-6 py-16 relative z-10 flex items-center justify-center"
      >
        <motion.div
          className="rounded-3xl backdrop-blur-xl p-8 md:p-12 shadow-2xl border border-white/10 w-full"
          style={{
            background: `linear-gradient(135deg, rgba(42, 67, 101, 0.4) 0%, rgba(26, 41, 64, 0.4) 100%)`,
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent text-center"
          >
            Plan Your Dream Wedding with Ease
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-blue-100/80 mb-10 max-w-3xl mx-auto text-center"
          >
            From budgets to guest lists, DreamDay helps you organize every
            detail seamlessly. Create unforgettable moments with our intuitive
            planning tools.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row justify-center gap-5"
          >
            <motion.div whileHover="hover" variants={buttonHoverVariants}>
              <Button
                asChild
                size="lg"
                className="rounded-3xl py-6 px-8 font-medium text-lg bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 shadow-lg shadow-blue-500/20 transition-all duration-300"
              >
                <Link to="/register" className="flex items-center">
                  <span>Start Planning Now</span>
                  <motion.span
                    className="ml-2"
                    initial={{ x: 0 }}
                    animate={{ x: [0, 5, 0] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      repeatType: 'reverse',
                    }}
                  >
                    →
                  </motion.span>
                </Link>
              </Button>
            </motion.div>

            <motion.div whileHover="hover" variants={buttonHoverVariants}>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-3xl py-6 px-8 font-medium text-lg backdrop-blur-sm border border-white/20 hover:bg-white/10 transition-all duration-300"
              >
                <Link to="/login">Login to Account</Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Additional feature highlights */}
          <motion.div
            variants={itemVariants}
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              {
                icon: '✓',
                title: 'Easy Planning',
                desc: 'Intuitive tools to organize your big day',
              },
              {
                icon: '♡',
                title: 'Vendor Management',
                desc: 'Keep track of all your wedding professionals',
              },
              {
                icon: '✦',
                title: 'Budget Tracking',
                desc: 'Stay on top of your wedding finances',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="rounded-3xl backdrop-blur-sm p-6 border border-white/10 hover:border-white/20 transition-all duration-300"
                style={{
                  background: `linear-gradient(135deg, rgba(46, 78, 143, 0.3) 0%, rgba(26, 58, 110, 0.3) 100%)`,
                }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="text-2xl mb-2 bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">
                  {feature.title}
                </h3>
                <p className="text-blue-100/70">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
