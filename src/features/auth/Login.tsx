import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDispatch } from 'react-redux';
import { login } from '@/features/auth/authSlice';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowLeft, LogIn } from 'lucide-react';

const Login = () => {
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
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

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

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, role, name } = response.data;
      dispatch(login({ token, role, name }));
      
      // Success animation and toast
      toast.success('Login successful!', {
        description: `Welcome back, ${name}!`,
        icon: '👋',
      });

      const from = location.state?.from?.pathname || '/';
      const isProtectedRoute = !['/', '/login', '/register'].includes(from);
      navigate(isProtectedRoute ? from : '/', { replace: true });
    } catch (error) {
      // Error animation and toast
      toast.error('Login failed', {
        description: 'Please check your email and password.',
        icon: '⚠️',
      });
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
          className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-10"
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
          className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-10"
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
            Welcome Back
          </motion.h1>
          <motion.p 
            className="text-blue-100/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Log in to continue your wedding planning journey
          </motion.p>
        </motion.div>

        <Card className="backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl overflow-hidden"
          style={{
            background: `linear-gradient(135deg, rgba(42, 67, 101, 0.3) 0%, rgba(26, 41, 64, 0.4) 100%)`,
          }}
        >
          <CardHeader className="px-6 pb-0 pt-6">
            <motion.div variants={itemVariants}>
              <CardTitle className="text-xl text-white">Login to DreamDay</CardTitle>
            </motion.div>
          </CardHeader>
          
          <CardContent className="p-6">
            <form onSubmit={handleLogin} className="space-y-5">
              <motion.div variants={itemVariants}>
                <Label htmlFor="email" className="text-sm font-medium text-blue-100 mb-1.5 block">
                  Email Address
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="your@email.com"
                    className="bg-white/5 border-white/10 text-white placeholder:text-blue-100/40 rounded-xl h-11 focus:border-blue-400/60 transition-all duration-300"
                    aria-label="Email address"
                  />
                </div>
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
                    placeholder="Enter your password"
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
              </motion.div>
              
              <motion.div variants={itemVariants} className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember"
                    type="checkbox"
                    className="h-4 w-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500/40"
                  />
                  <label htmlFor="remember" className="ml-2 text-sm text-blue-100/80">
                    Remember me
                  </label>
                </div>
                <a href="#" className="text-sm text-blue-300 hover:text-blue-200 transition-colors">
                  Forgot password?
                </a>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl py-6 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium shadow-lg shadow-blue-500/20 transition-all duration-300"
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
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
                    </motion.div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <LogIn size={18} />
                      <span>Login</span>
                    </div>
                  )}
                </Button>
              </motion.div>
              
              <motion.div variants={itemVariants} className="text-center pt-2">
                <p className="text-sm text-blue-100/70">
                  Don't have an account yet?{' '}
                  <Link to="/register" className="text-blue-300 hover:text-blue-200 font-medium transition-colors">
                    Sign up
                  </Link>
                </p>
              </motion.div>
            </form>
          </CardContent>
        </Card>
        
        <motion.div variants={itemVariants} className="mt-8 text-center">
          <p className="text-xs text-blue-100/50">
            By logging in, you agree to our{' '}
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

export default Login;
