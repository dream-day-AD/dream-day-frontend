import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

interface DashboardData {
  todos: string[];
  budgetOverview: { total: number; spent: number };
  keyDates: string[];
  role?: string;
}

export const Dashboard = () => {
  const { role, token } = useSelector((state: RootState) => state.auth);

  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ['dashboard', role],
    queryFn: async () => {
      if (!token) throw new Error('No token available');
      console.log('Fetching dashboard with token:', token);
      const response = await api.get('/dashboard');
      console.log('Dashboard response status:', response.status);
      console.log('Dashboard response data:', response.data);
      if (!response.data) throw new Error('Empty response from server');
      return response.data;
    },
    enabled: !!token && !!role,
    retry: false,
  });

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const handleTestToast = () => {
    toast.success('Welcome to your dashboard!', {
      description: 'This is a test notification.',
    });
  };

  if (isLoading) return <div className="p-6 text-center">Loading...</div>;
  if (error) return <div className="p-6 text-center text-red-500">Error loading data: {error.message}</div>;
  if (!data) return <div className="p-6 text-center">No data available</div>;

  return (
    <div className="p-6 space-y-6">
      <Toaster richColors position="top-right" />
      <h2 className="text-2xl font-semibold">
        {role === 'client'
          ? 'Your Wedding Dashboard'
          : role === 'planner'
          ? 'Planner Dashboard'
          : 'Admin Dashboard'}
      </h2>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <motion.div variants={cardVariants} initial="hidden" animate="visible">
          <Card className="bg-[var(--card-bg)] border-none">
            <CardHeader>
              <CardTitle>To-Do List</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2">
                {data.todos.map((todo, index) => (
                  <li key={index}>{todo}</li>
                ))}
              </ul>
              <Button className="mt-4" onClick={handleTestToast}>
                Add Task
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants} initial="hidden" animate="visible">
          <Card className="bg-[var(--card-bg)] border-none">
            <CardHeader>
              <CardTitle>Budget Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Total Budget: ${data.budgetOverview.total.toLocaleString()}</p>
              <p>Spent: ${data.budgetOverview.spent.toLocaleString()}</p>
              <Button variant="outline" className="mt-4">
                View Details
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants} initial="hidden" animate="visible">
          <Card className="bg-[var(--card-bg)] border-none">
            <CardHeader>
              <CardTitle>Key Dates</CardTitle>
            </CardHeader>
            <CardContent>
              {data.keyDates.map((date, index) => (
                <p key={index}>{date}</p>
              ))}
              <Button variant="outline" className="mt-4">
                View Timeline
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};