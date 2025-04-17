import { Button } from '@/components/ui/button';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '@/features/auth/authSlice';
import { RootState } from '@/redux/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useState, useEffect } from 'react';

export const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { role, name } = useSelector((state: RootState) => state.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Dark blue color palette variables
  const colors = {
    darkBlue1: '#0A1929', // Darkest blue
    darkBlue2: '#11294D', // Dark blue
    darkBlue3: '#1A3A6E', // Medium blue
    darkBlue4: '#2E4E8F', // Lighter accent blue
    lightAccent: '#4C9FE6', // Light blue accent
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Handle logout
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Navigation links based on user role
  const getNavLinks = () => {
    if (!role) {
      return [
        { to: '/', label: 'Home' },
        { to: '#Aboutus', label: 'About Us', isAnchor: true },
        { to: '#Contact', label: 'Contact', isAnchor: true },
      ];
    }

    const links = [
      { to: '/dashboard', label: 'Dashboard' },
      { to: '/vendors', label: 'Vendors' },
      { to: '/checklist', label: 'Checklist' },
      { to: '/guests', label: 'Guests' },
      { to: '/budget', label: 'Budget' },
      { to: '/timeline', label: 'Timeline' },
      { to: '/reports', label: 'Reports' },
    ];

    if (role === 'planner') {
      links.push({ to: '/planner', label: 'Planner' });
    }

    if (role === 'admin') {
      links.push({ to: '/admin', label: 'Admin' });
    }

    return links;
  };

  const navLinks = getNavLinks();

  // Animation variants
  const navVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  const linkVariants = {
    hidden: { opacity: 0, y: -5 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
        ease: 'easeOut',
      },
    }),
    hover: {
      scale: 1.05,
      color: colors.lightAccent,
      transition: { duration: 0.2 },
    },
  };

  const mobileMenuVariants = {
    closed: {
      opacity: 0,
      y: -20,
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
    open: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const menuItemVariants = {
    closed: { opacity: 0, y: 20 },
    open: { opacity: 1, y: 0 },
  };

  const isActive = (path) => {
    return location.pathname === path ? true : false;
  };

  return (
    <motion.nav
      initial="hidden"
      animate="visible"
      variants={navVariants}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'py-2' : 'py-4'
      }`}
      aria-label="Main navigation"
      style={{
        background: scrolled
          ? `rgba(10, 25, 41, 0.85)`
          : `rgba(10, 25, 41, 0.45)`,
        backdropFilter: 'blur(12px)',
        boxShadow: scrolled ? '0 10px 30px -10px rgba(0, 0, 0, 0.3)' : 'none',
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo and user name */}
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/" className="text-2xl font-bold relative group">
              <span className="bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent">
                DreamDay
              </span>
              <motion.span
                className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-indigo-500 group-hover:w-full transition-all duration-300"
                whileHover={{ width: '100%' }}
              ></motion.span>
            </Link>

            {name && (
              <motion.div
                className="rounded-full px-3 py-1 text-sm backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                style={{
                  background: `linear-gradient(135deg, ${colors.darkBlue3}80 0%, ${colors.darkBlue2}80 100%)`,
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <span className="text-blue-100">{name}</span>
              </motion.div>
            )}
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link, i) => (
              <motion.div
                key={link.label}
                custom={i}
                variants={linkVariants}
                whileHover="hover"
                className="relative"
              >
                {link.isAnchor ? (
                  <a
                    href={link.to}
                    className={`px-3 py-2 rounded-3xl text-sm transition-all duration-300 ${
                      isActive(link.to)
                        ? 'text-blue-200'
                        : 'text-blue-100/80 hover:text-white'
                    }`}
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    to={link.to}
                    className={`px-3 py-2 rounded-3xl text-sm transition-all duration-300 ${
                      isActive(link.to)
                        ? 'text-blue-200'
                        : 'text-blue-100/80 hover:text-white'
                    }`}
                  >
                    {link.label}
                    {isActive(link.to) && (
                      <motion.span
                        className="absolute bottom-0 left-0 right-0 mx-auto h-0.5 w-1/2 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full"
                        layoutId="activeNavIndicator"
                        transition={{ type: 'spring', duration: 0.5 }}
                      ></motion.span>
                    )}
                  </Link>
                )}
              </motion.div>
            ))}

            {/* Logout button for authenticated users */}
            {role && (
              <motion.div
                variants={linkVariants}
                custom={navLinks.length}
                className="ml-2"
              >
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-3xl text-white border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
                    >
                      Logout
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent
                    className="rounded-3xl border border-white/10 shadow-xl backdrop-blur-xl alert-dialog-overlay"
                    style={{
                      background: `linear-gradient(135deg, ${colors.darkBlue2}90 0%, ${colors.darkBlue1}90 100%)`,
                    }}
                  >
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-xl text-white">
                        Log out from DreamDay?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-blue-100/80">
                        Your planning data will be saved. You'll need to log in
                        again to access your dashboard.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-3">
                      <AlertDialogCancel className="rounded-3xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all duration-300">
                        Stay logged in
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleLogout}
                        className="rounded-3xl bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/20 transition-all duration-300"
                      >
                        Log out
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </motion.div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <motion.button
            className="md:hidden flex flex-col gap-1.5 p-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            whileTap={{ scale: 0.95 }}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            <motion.span
              className="w-5 h-0.5 bg-white rounded-full block"
              animate={{
                rotate: mobileMenuOpen ? 45 : 0,
                y: mobileMenuOpen ? 6 : 0,
              }}
              transition={{ duration: 0.2 }}
            ></motion.span>
            <motion.span
              className="w-5 h-0.5 bg-white rounded-full block"
              animate={{ opacity: mobileMenuOpen ? 0 : 1 }}
              transition={{ duration: 0.2 }}
            ></motion.span>
            <motion.span
              className="w-5 h-0.5 bg-white rounded-full block"
              animate={{
                rotate: mobileMenuOpen ? -45 : 0,
                y: mobileMenuOpen ? -6 : 0,
              }}
              transition={{ duration: 0.2 }}
            ></motion.span>
          </motion.button>
        </div>

        {/* Mobile navigation menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={mobileMenuVariants}
              className="md:hidden mt-4 rounded-3xl overflow-hidden backdrop-blur-xl border border-white/10 shadow-xl"
              style={{
                background: `linear-gradient(135deg, ${colors.darkBlue2}90 0%, ${colors.darkBlue1}90 100%)`,
              }}
            >
              <div className="py-3">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.label}
                    variants={menuItemVariants}
                    className="px-1"
                  >
                    {link.isAnchor ? (
                      <a
                        href={link.to}
                        className={`flex items-center py-3 px-4 rounded-2xl mx-2 ${
                          isActive(link.to)
                            ? 'bg-white/10 text-white'
                            : 'text-blue-100/80 hover:bg-white/5 hover:text-white'
                        } transition-all duration-300`}
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        to={link.to}
                        className={`flex items-center py-3 px-4 rounded-2xl mx-2 ${
                          isActive(link.to)
                            ? 'bg-white/10 text-white'
                            : 'text-blue-100/80 hover:bg-white/5 hover:text-white'
                        } transition-all duration-300`}
                      >
                        {link.label}
                      </Link>
                    )}
                  </motion.div>
                ))}

                {/* Mobile logout button */}
                {role && (
                  <motion.div
                    variants={menuItemVariants}
                    className="p-3 border-t border-white/10 mt-2"
                  >
                    <Button
                      onClick={handleLogout}
                      className="w-full rounded-2xl text-white bg-gradient-to-r from-red-600/80 to-red-700/80 hover:from-red-700 hover:to-red-800"
                    >
                      Logout
                    </Button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};
