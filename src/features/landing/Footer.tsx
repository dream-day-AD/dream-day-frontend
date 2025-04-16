import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Footer = () => {
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
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const linkVariants = {
    initial: { y: 0 },
    hover: { y: -3, transition: { duration: 0.2 } },
  };

  const socialLinks = [
    { name: 'Instagram', icon: '📷', url: '#' },
    { name: 'Facebook', icon: '👍', url: '#' },
    { name: 'Twitter', icon: '🐦', url: '#' },
    { name: 'Pinterest', icon: '📌', url: '#' },
  ];

  const resourceLinks = [
    { name: 'Wedding Blog', url: '/blog' },
    { name: 'Planning Guide', url: '/guide' },
    { name: 'Vendor Directory', url: '/directory' },
    { name: 'Wedding Checklists', url: '/checklists' },
  ];

  const companyLinks = [
    { name: 'About Us', url: '/about' },
    { name: 'Careers', url: '/careers' },
    { name: 'Press Kit', url: '/press' },
    { name: 'Contact', url: '/contact' },
  ];

  const legalLinks = [
    { name: 'Privacy Policy', url: '/privacy' },
    { name: 'Terms of Service', url: '/terms' },
    { name: 'Cookie Policy', url: '/cookies' },
    { name: 'GDPR', url: '/gdpr' },
  ];

  return (
    <motion.footer
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
      className="relative overflow-hidden"
      style={{
        background: `linear-gradient(to bottom, ${colors.darkBlue2} 0%, ${colors.darkBlue1} 100%)`,
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-5"
          initial={{ opacity: 0.05 }}
          animate={{
            opacity: [0.05, 0.08, 0.05],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            background: `radial-gradient(circle, ${colors.lightAccent} 0%, transparent 70%)`,
            filter: 'blur(50px)',
          }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-5"
          initial={{ opacity: 0.05 }}
          animate={{
            opacity: [0.05, 0.1, 0.05],
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

      <div className="container mx-auto px-6">
        {/* Main footer content */}
        <div className="pt-16 pb-10">
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
            {/* Brand column */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <Link to="/" className="inline-block mb-6">
                <span className="text-2xl font-bold bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent">
                  DreamDay
                </span>
              </Link>
              <p className="text-blue-100/70 mb-6 max-w-md">
                Making wedding planning simple, collaborative, and stress-free.
                Our all-in-one platform helps couples create their perfect day
                with ease.
              </p>
              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.name}
                    href={social.url}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm"
                    style={{
                      background: `linear-gradient(135deg, ${colors.darkBlue3}60 0%, ${colors.darkBlue2}60 100%)`,
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                    aria-label={social.name}
                  >
                    <span className="text-lg">{social.icon}</span>
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Links columns */}
            <motion.div variants={itemVariants}>
              <h3 className="text-white font-medium mb-4">Resources</h3>
              <ul className="space-y-3">
                {resourceLinks.map((link) => (
                  <motion.li
                    key={link.name}
                    variants={linkVariants}
                    whileHover="hover"
                    initial="initial"
                  >
                    <Link
                      to={link.url}
                      className="text-blue-100/70 hover:text-white transition-colors duration-300 text-sm flex items-center"
                    >
                      <motion.span
                        className="inline-block"
                        whileHover={{ x: 3 }}
                        transition={{
                          type: 'spring',
                          stiffness: 400,
                          damping: 10,
                        }}
                      >
                        {link.name}
                      </motion.span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div variants={itemVariants}>
              <h3 className="text-white font-medium mb-4">Company</h3>
              <ul className="space-y-3">
                {companyLinks.map((link) => (
                  <motion.li
                    key={link.name}
                    variants={linkVariants}
                    whileHover="hover"
                    initial="initial"
                  >
                    <Link
                      to={link.url}
                      className="text-blue-100/70 hover:text-white transition-colors duration-300 text-sm flex items-center"
                    >
                      <motion.span
                        className="inline-block"
                        whileHover={{ x: 3 }}
                        transition={{
                          type: 'spring',
                          stiffness: 400,
                          damping: 10,
                        }}
                      >
                        {link.name}
                      </motion.span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div variants={itemVariants}>
              <h3 className="text-white font-medium mb-4">Legal</h3>
              <ul className="space-y-3">
                {legalLinks.map((link) => (
                  <motion.li
                    key={link.name}
                    variants={linkVariants}
                    whileHover="hover"
                    initial="initial"
                  >
                    <Link
                      to={link.url}
                      className="text-blue-100/70 hover:text-white transition-colors duration-300 text-sm flex items-center"
                    >
                      <motion.span
                        className="inline-block"
                        whileHover={{ x: 3 }}
                        transition={{
                          type: 'spring',
                          stiffness: 400,
                          damping: 10,
                        }}
                      >
                        {link.name}
                      </motion.span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        </div>

        {/* Newsletter subscription */}
        <motion.div
          variants={itemVariants}
          className="py-8 border-t border-white/10"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="max-w-md">
              <h3 className="text-white font-medium mb-2">Stay updated</h3>
              <p className="text-blue-100/70 text-sm">
                Subscribe to our newsletter for wedding planning tips and
                exclusive offers.
              </p>
            </div>
            <div className="flex w-full md:w-auto max-w-md">
              <motion.input
                type="email"
                placeholder="Your email address"
                className="py-3 px-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-l-3xl text-white placeholder-blue-100/50 w-full focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all duration-300"
                whileFocus={{ scale: 1.01 }}
              />
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="py-3 px-5 rounded-r-3xl font-medium bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
              >
                Subscribe
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Copyright bar */}
        <motion.div
          variants={itemVariants}
          className="py-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm"
        >
          <p className="text-blue-100/70">
            &copy; {new Date().getFullYear()} DreamDay. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-6 justify-center">
            <motion.a
              href="#"
              className="text-blue-100/70 hover:text-white transition-colors duration-300"
              whileHover={{ y: -2 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              Accessibility
            </motion.a>
            <motion.a
              href="#"
              className="text-blue-100/70 hover:text-white transition-colors duration-300"
              whileHover={{ y: -2 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              Cookie Preferences
            </motion.a>
            <motion.a
              href="#"
              className="text-blue-100/70 hover:text-white transition-colors duration-300"
              whileHover={{ y: -2 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              Sitemap
            </motion.a>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;
