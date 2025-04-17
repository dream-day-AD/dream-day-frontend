import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate, Link } from 'react-router-dom';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff, UserPlus, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const Register = () => {
  // Dark blue color palette variables
  const colors = {
    darkBlue1: '#0A1929', // Darkest blue
    darkBlue2: '#11294D', // Dark blue
    darkBlue3: '#1A3A6E', // Medium blue
    darkBlue4: '#2E4E8F', // Lighter accent blue
    lightAccent: '#4C9FE6', // Light blue accent
  };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('client');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/auth/register', { email, password, name, role });
      
      // Success animation and toast
      toast.success('Registration successful!', {
        description: 'Your account has been created. Please log in.',
        icon: '🎉',
      });
      
      // Add a small delay before navigating for better UX
      setTimeout(() => {
        navigate('/login');
      }, 1000);
    } catch (error) {
      // Error animation and toast
      toast.error('Registration failed', {
        description: 'Please check your information and try again.',
        icon: '⚠️',
      });
      console.error('Register error:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const selectRole = (selectedRole) => {
    setRole(selectedRole);
    setIsDropdownOpen(false);
  };

  const roleOptions = [
    { value: 'client', label: 'Client - Planning my wedding' },
    { value: 'planner', label: 'Planner - Professional wedding planner' },
    { value: 'admin', label: 'Admin - System administrator' },
  ];

  const getRoleLabel = () => {
    return roleOptions.find(option => option.value === role)?.label || 'Select a role';
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-12 px-4"
      style={{
        background: `linear-gradient(135deg, ${colors.darkBlue1} 0%, ${colors.darkBlue2} 100%)`,
      }}
    >
      <Toaster richColors position="top-right" />
      
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full opacity-10"
          initial={{ opacity: 0.05 }}
          animate={{
            opacity: [0.05, 0.08, 0.05],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          style={{
            background: `radial-gradient(circle, ${colors.darkBlue4} 0%, transparent 70%)`,
            filter: 'blur(60px)',
          }}
        />
        <motion.div
          className="absolute -bottom-32 -left-32 w-[600px] h-[600px] rounded-full opacity-10"
          initial={{ opacity: 0.05 }}
          animate={{
            opacity: [0.05, 0.1, 0.05],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          style={{
            background: `radial-gradient(circle, ${colors.lightAccent} 0%, transparent 70%)`,
            filter: 'blur(70px)',
          }}
        />
      </div>

      {/* Home button */}
      <motion.div 
        className="absolute top-6 left-6 z-10"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="rounded-full backdrop-blur-sm text-white/90 hover:text-white hover:bg-white/10"
        >
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft size={16} />
            <span>Home</span>
          </Link>
        </Button>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md relative z-10"
      >
        <motion.div
          variants={itemVariants}
          className="mb-8 text-center"
        >
          <motion.h1 
            className="text-3xl font-bold bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent mb-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            Create Your Account
          </motion.h1>
          <motion.p 
            className="text-blue-100/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Join DreamDay to start planning your perfect wedding
          </motion.p>
        </motion.div>

        <Card className="backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl overflow-hidden"
          style={{
            background: `linear-gradient(135deg, rgba(42, 67, 101, 0.3) 0%, rgba(26, 41, 64, 0.4) 100%)`,
          }}
        >
          <CardHeader className="px-6 pb-0 pt-6">
            <motion.div variants={itemVariants}>
              <CardTitle className="text-xl text-white">Register for DreamDay</CardTitle>
            </motion.div>
          </CardHeader>
          
          <CardContent className="p-6">
            <form onSubmit={handleRegister} className="space-y-5">
              <motion.div variants={itemVariants}>
                <Label htmlFor="name" className="text-sm font-medium text-blue-100 mb-1.5 block">
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="John Smith"
                  className="bg-white/5 border-white/10 text-white placeholder:text-blue-100/40 rounded-xl h-11 focus:border-blue-400/60 transition-all duration-300"
                  aria-label="Full name"
                />
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <Label htmlFor="email" className="text-sm font-medium text-blue-100 mb-1.5 block">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="bg-white/5 border-white/10 text-white placeholder:text-blue-100/40 rounded-xl h-11 focus:border-blue-400/60 transition-all duration-300"
                  aria-label="Email address"
                />
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <Label htmlFor="password" className="text-sm font-medium text-blue-100 mb-1.5 block">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Create a strong password"
                    className="bg-white/5 border-white/10 text-white placeholder:text-blue-100/40 rounded-xl h-11 focus:border-blue-400/60 transition-all duration-300 pr-10"
                    aria-label="Password"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-100/60 hover:text-white transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="text-xs text-blue-100/50 mt-1.5">
                  Must be at least 8 characters with a mix of letters, numbers & symbols
                </p>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <Label htmlFor="role" className="text-sm font-medium text-blue-100 mb-1.5 block">
                  I am a
                </Label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={toggleDropdown}
                    className={cn(
                      "w-full flex items-center justify-between bg-white/5 border border-white/10 text-white rounded-xl h-11 px-3 focus:border-blue-400/60 transition-all duration-300",
                      isDropdownOpen && "border-blue-400/60"
                    )}
                    aria-expanded={isDropdownOpen}
                    aria-haspopup="listbox"
                  >
                    <span className={cn("text-sm", !role && "text-blue-100/40")}>
                      {getRoleLabel()}
                    </span>
                    <ChevronDown 
                      size={18} 
                      className={cn(
                        "text-blue-100/60 transition-transform duration-300",
                        isDropdownOpen && "transform rotate-180"
                      )} 
                    />
                  </button>
                  
                  {isDropdownOpen && (
                    <motion.div 
                      className="absolute z-10 w-full mt-1 rounded-xl overflow-hidden backdrop-blur-md border border-white/10 shadow-lg" 
                      style={{
                        background: `linear-gradient(135deg, rgba(42, 67, 101, 0.8) 0%, rgba(26, 41, 64, 0.9) 100%)`,
                      }}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ul 
                        role="listbox" 
                        aria-labelledby="role-button"
                        className="py-1"
                      >
                        {roleOptions.map((option) => (
                          <li key={option.value}>
                            <button
                              type="button"
                              className={cn(
                                "w-full text-left px-3 py-2.5 text-sm transition-colors",
                                role === option.value 
                                  ? "bg-blue-500/20 text-white" 
                                  : "text-blue-100/80 hover:bg-white/5 hover:text-white"
                              )}
                              onClick={() => selectRole(option.value)}
                              role="option"
                              aria-selected={role === option.value}
                            >
                              {option.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </div>
              </motion.div>
              
              <motion.div variants={itemVariants} className="pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl py-6 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium shadow-lg shadow-blue-500/20 transition-all duration-300"
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="flex items-center"
                    >
                      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Creating account...</span>
                    </motion.div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <UserPlus size={18} />
                      <span>Create Account</span>
                    </div>
                  )}
                </Button>
              </motion.div>
              
              <motion.div variants={itemVariants} className="text-center">
                <p className="text-sm text-blue-100/70">
                  Already have an account?{' '}
                  <Link to="/login" className="text-blue-300 hover:text-blue-200 font-medium transition-colors">
                    Login
                  </Link>
                </p>
              </motion.div>
            </form>
          </CardContent>
        </Card>
        
        <motion.div variants={itemVariants} className="mt-8 text-center">
          <p className="text-xs text-blue-100/50">
            By creating an account, you agree to our{' '}
            <a href="#" className="text-blue-300/80 hover:text-blue-200 underline-offset-2 hover:underline transition-all">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-blue-300/80 hover:text-blue-200 underline-offset-2 hover:underline transition-all">
              Privacy Policy
            </a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Register;
