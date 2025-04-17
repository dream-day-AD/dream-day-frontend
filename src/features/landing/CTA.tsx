import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const CTA = () => {
  // Dark blue color palette variables
  const colors = {
    darkBlue1: '#0A1929', // Darkest blue
    darkBlue2: '#11294D', // Dark blue
    darkBlue3: '#1A3A6E', // Medium blue
    darkBlue4: '#2E4E8F', // Lighter accent blue
    lightAccent: '#4C9FE6', // Light blue accent
  };

  const [isHovered, setIsHovered] = useState(false);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        when: 'beforeChildren',
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  const buttonVariants = {
    idle: { scale: 1 },
    hover: {
      scale: 1.05,
      boxShadow: '0 0 30px rgba(76, 159, 230, 0.5)',
      transition: { duration: 0.3, type: 'spring', stiffness: 400 },
    },
    tap: {
      scale: 0.98,
      transition: { duration: 0.1 },
    },
  };

  const particleVariants = {
    initial: { opacity: 0, scale: 0 },
    animate: {
      opacity: [0, 1, 0],
      scale: [0, 1, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatDelay: Math.random() * 4,
      },
    },
  };

  return (
    <section
      className="relative py-32 overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${colors.darkBlue2} 0%, ${colors.darkBlue1} 100%)`,
      }}
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated particles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            variants={particleVariants}
            initial="initial"
            animate="animate"
            custom={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 6 + 2 + 'px',
              height: Math.random() * 6 + 2 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              background: `rgba(${Math.random() * 255}, ${Math.random() * 255}, 255, 0.7)`,
              boxShadow: '0 0 5px rgba(255, 255, 255, 0.5)',
            }}
          />
        ))}

        {/* Background glow effects */}
        <motion.div
          className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full"
          initial={{ opacity: 0.08 }}
          animate={{
            opacity: [0.08, 0.15, 0.08],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            background: `radial-gradient(circle, ${colors.darkBlue4}60 0%, transparent 70%)`,
            filter: 'blur(80px)',
          }}
        />

        <motion.div
          className="absolute -bottom-20 right-1/4 w-[500px] h-[500px] rounded-full"
          initial={{ opacity: 0.1 }}
          animate={{
            opacity: [0.1, 0.2, 0.1],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
          style={{
            background: `radial-gradient(circle, ${colors.lightAccent}40 0%, transparent 70%)`,
            filter: 'blur(100px)',
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="max-w-4xl mx-auto"
        >
          {/* Main content card */}
          <motion.div
            className="rounded-3xl backdrop-blur-xl p-12 shadow-2xl border border-white/10 text-center"
            style={{
              background: `linear-gradient(135deg, rgba(42, 67, 101, 0.3) 0%, rgba(26, 41, 64, 0.4) 100%)`,
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.span
              variants={itemVariants}
              className="inline-block py-1 px-4 rounded-3xl text-sm text-white font-medium mb-6 backdrop-blur-md"
              style={{
                background: `linear-gradient(90deg, ${colors.darkBlue3}80 0%, ${colors.darkBlue4}80 100%)`,
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              Limited Time Offer
            </motion.span>

            <motion.h2
              variants={itemVariants}
              className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent"
            >
              Ready to Plan Your Perfect Wedding?
            </motion.h2>

            <motion.p
              variants={itemVariants}
              className="text-xl text-blue-100/80 mb-8 max-w-2xl mx-auto leading-relaxed"
            >
              Join thousands of happy couples who planned their dream wedding
              with our all-in-one platform. Get started today and enjoy special
              pricing!
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center gap-5"
            >
              <motion.div
                variants={buttonVariants}
                initial="idle"
                whileHover="hover"
                whileTap="tap"
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
              >
                <Button
                  asChild
                  size="lg"
                  className="rounded-3xl py-7 px-10 font-medium text-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/20 transition-all duration-300"
                >
                  <Link to="/register" className="flex items-center gap-2">
                    <span>Sign Up For Free</span>
                    <motion.span
                      initial={{ x: 0 }}
                      animate={{ x: isHovered ? 5 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      →
                    </motion.span>
                  </Link>
                </Button>
              </motion.div>

              <motion.div
                variants={buttonVariants}
                initial="idle"
                whileHover="hover"
                whileTap="tap"
              >
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="rounded-3xl py-7 px-8 text-white font-medium text-lg backdrop-blur-sm border border-white/20 bg-white/5 hover:bg-white/10 transition-all duration-300"
                >
                  <Link to="/demo">Watch Demo</Link>
                </Button>
              </motion.div>
            </motion.div>

            {/* Feature highlights */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 pt-8 border-t border-white/10"
            >
              {[
                { icon: '✓', text: 'Free 30-Day Trial' },
                { icon: '✓', text: 'No Credit Card Required' },
                { icon: '✓', text: 'Unlimited Planning Tools' },
                { icon: '✓', text: 'Priority Support' },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  className="flex flex-col items-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                >
                  <span
                    className="w-8 h-8 flex items-center justify-center rounded-full mb-2"
                    style={{ background: `${colors.darkBlue4}50` }}
                  >
                    <span className="text-blue-300">{feature.icon}</span>
                  </span>
                  <span className="text-sm text-blue-100/80">
                    {feature.text}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Testimonial accent */}
          <motion.div
            className="mt-10 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
          >
            <p className="text-blue-200/70 italic text-sm">
              "DreamDay transformed our wedding planning experience completely.
              The tools are intuitive and comprehensive!"
            </p>
            <p className="text-blue-300/90 mt-2 text-xs font-medium">
              — Jessica & Michael, Married June 2024
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
