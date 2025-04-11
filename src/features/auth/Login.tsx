import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDispatch } from 'react-redux';
import { login } from '@/features/auth/authSlice';
import { useNavigate, useLocation, Link } from 'react-router-dom'; // ⬅ added Link
import api from '@/lib/api';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, role, name } = response.data as {
        token: string;
        role: 'client' | 'planner' | 'admin';
        name: string;
      };
      dispatch(login({ token, role, name }));
      toast.success('Login successful!');

      const from = location.state?.from?.pathname || '/';
      const isProtectedRoute = !['/', '/login', '/register'].includes(from);
      navigate(isProtectedRoute ? from : '/', { replace: true });
    } catch (error) {
      toast.error('Login failed. Check your credentials.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Toaster richColors position="top-right" />

      {/* Home button */}
      <Link
        to="/"
        className="absolute top-4 left-4 text-sm font-medium text-white bg-gray-800 px-3 py-1 rounded hover:bg-gray-700 transition"
      >
        ← Home
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md bg-[var(--card-bg)] border-none">
          <CardHeader>
            <CardTitle className="text-2xl">Login to DreamDay</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-gray-800 text-white"
                  aria-label="Email address"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-gray-800 text-white"
                  aria-label="Password"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
