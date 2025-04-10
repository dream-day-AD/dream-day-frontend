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
  todos: { id: string; task: string; completed: boolean }[];
  budget: { total: number; spent: number };
  keyDates: { event: string; date: string }[];
}

export const Dashboard = () => {
  const { role } = useSelector((state: RootState) => state.auth);

  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ['dashboard', role],
    queryFn: async () => {
      const response = await api.get('/dashboard');
      return response.data;
    },
    enabled: !!role,
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
  if (error)
    return (
      <div className="p-6 text-center text-red-500">Error loading data</div>
    );

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
                {data?.todos.map((todo) => (
                  <li
                    key={todo.id}
                    className={todo.completed ? 'line-through' : ''}
                  >
                    {todo.task}
                  </li>
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
              <p>Total Budget: ${data?.budget.total.toLocaleString()}</p>
              <p>Spent: ${data?.budget.spent.toLocaleString()}</p>
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
              {data?.keyDates.map((date) => (
                <p key={date.event}>{`${date.event}: ${date.date}`}</p>
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
