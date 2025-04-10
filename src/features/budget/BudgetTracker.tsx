import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { cn } from '@/lib/utils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface BudgetCategory {
  id: string;
  name: string;
  allocated: number;
  spent: number;
}

interface Budget {
  total: number;
  categories: BudgetCategory[];
}

const BudgetTracker = () => {
  const [newCategory, setNewCategory] = useState({ name: '', allocated: '' });
  const [totalBudget, setTotalBudget] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null
  );
  const queryClient = useQueryClient();

  const {
    data: budget = { total: 0, categories: [] },
    isLoading,
    error,
  } = useQuery<Budget>({
    queryKey: ['budget'],
    queryFn: async () => {
      const response = await api.get('/budget');
      return response.data;
    },
    enabled: false,
  });

  const setTotalBudgetMutation = useMutation({
    mutationFn: (total: number) => api.put('/budget/total', { total }),
    onSuccess: (_, total) => {
      queryClient.setQueryData(['budget'], (old: Budget | undefined) => ({
        ...old,
        total,
      }));
      toast.success('Total budget updated!');
      setTotalBudget('');
    },
    onError: () => toast.error('Failed to update total budget.'),
  });

  const addCategoryMutation = useMutation({
    mutationFn: (category: { name: string; allocated: number }) =>
      api.post('/budget/categories', category),
    onSuccess: (_, category) => {
      queryClient.setQueryData(['budget'], (old: Budget | undefined) => ({
        ...old,
        categories: [
          ...(old?.categories || []),
          { id: Date.now().toString(), ...category, spent: 0 },
        ],
      }));
      toast.success('Category added successfully!');
      setNewCategory({ name: '', allocated: '' });
    },
    onError: () => toast.error('Failed to add category.'),
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({
      id,
      name,
      spent,
    }: {
      id: string;
      name?: string;
      spent?: number;
    }) => api.patch(`/budget/categories/${id}`, { name, spent }),
    onSuccess: (_, vars) => {
      queryClient.setQueryData(['budget'], (old: Budget | undefined) => ({
        ...old,
        categories: old?.categories.map((cat) =>
          cat.id === vars.id
            ? {
                ...cat,
                name: vars.name ?? cat.name,
                spent: vars.spent ?? cat.spent,
              }
            : cat
        ),
      }));
      toast.success('Category updated!');
      setEditingCategoryId(null);
    },
    onError: () => toast.error('Failed to update category.'),
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/budget/categories/${id}`),
    onSuccess: (_, id) => {
      queryClient.setQueryData(['budget'], (old: Budget | undefined) => ({
        ...old,
        categories: old?.categories.filter((cat) => cat.id !== id) || [],
      }));
      toast.success('Category removed successfully!');
    },
    onError: () => toast.error('Failed to remove category.'),
  });

  const resetBudgetMutation = useMutation({
    mutationFn: () => api.delete('/budget/reset'),
    onSuccess: () => {
      queryClient.setQueryData(['budget'], { total: 0, categories: [] });
      toast.success('Budget reset successfully!');
    },
    onError: () => toast.error('Failed to reset budget.'),
  });

  const handleSetTotal = (e: React.FormEvent) => {
    e.preventDefault();
    const total = parseFloat(totalBudget);
    if (!isNaN(total) && total > 0) setTotalBudgetMutation.mutate(total);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const allocated = parseFloat(newCategory.allocated);
    if (newCategory.name && !isNaN(allocated) && allocated > 0) {
      addCategoryMutation.mutate({ name: newCategory.name, allocated });
    }
  };

  const handleUpdateCategory = (id: string, name?: string, spent?: string) => {
    const parsedSpent = spent ? parseFloat(spent) : undefined;
    if (name || (!isNaN(parsedSpent!) && parsedSpent! >= 0)) {
      updateCategoryMutation.mutate({ id, name, spent: parsedSpent });
    }
  };

  const copySummary = () => {
    const summary = `Total Budget: $${budget.total.toLocaleString()}\nRemaining: $${remaining.toLocaleString()}\n\nCategories:\n${budget.categories
      .map(
        (c) =>
          `${c.name}: Allocated $${c.allocated.toLocaleString()}, Spent $${c.spent.toLocaleString()}`
      )
      .join('\n')}`;
    navigator.clipboard
      .writeText(summary)
      .then(() => toast.success('Budget summary copied to clipboard!'));
  };

  const totalSpent = budget.categories.reduce((sum, c) => sum + c.spent, 0);
  const remaining = budget.total - totalSpent;

  const chartData = {
    labels: budget.categories.map((c) => c.name),
    datasets: [
      {
        label: 'Allocated',
        data: budget.categories.map((c) => c.allocated),
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Spent',
        data: budget.categories.map((c) => c.spent),
        backgroundColor: 'rgba(255, 99, 132, 0.7)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Amount ($)', color: '#fff' },
      },
      x: { title: { display: true, text: 'Categories', color: '#fff' } },
    },
    plugins: {
      legend: { labels: { color: '#fff' } },
      tooltip: {
        backgroundColor: '#333',
        titleColor: '#fff',
        bodyColor: '#fff',
      },
    },
  };

  if (isLoading)
    return <div className="p-6 text-center">Loading budget...</div>;
  if (error)
    return (
      <div className="p-6 text-center text-red-500">Error loading budget</div>
    );

  return (
    <div className="p-6 space-y-6">
      <Toaster richColors position="top-right" />
      <h2 className="text-2xl font-semibold">Budget Tracker</h2>

      <Card
        className={cn(
          'bg-[var(--card-bg)] border',
          remaining < 0 ? 'border-red-500' : 'border-green-500'
        )}
      >
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Budget Overview</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" onClick={copySummary}>
              Copy Summary
            </Button>
            <Button
              variant="outline"
              onClick={() => resetBudgetMutation.mutate()}
              disabled={resetBudgetMutation.isPending}
            >
              {resetBudgetMutation.isPending ? 'Resetting...' : 'Reset Budget'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <form onSubmit={handleSetTotal} className="flex gap-2">
              <Input
                type="number"
                placeholder="Set Total Budget"
                value={totalBudget}
                onChange={(e) => setTotalBudget(e.target.value)}
                className="bg-gray-800 text-white w-48"
              />
              <Button type="submit" disabled={setTotalBudgetMutation.isPending}>
                {setTotalBudgetMutation.isPending ? 'Setting...' : 'Set Total'}
              </Button>
            </form>
            <div className="text-sm">
              <p>
                Total Budget:{' '}
                <span className="font-semibold">
                  ${budget.total.toLocaleString()}
                </span>
              </p>
              <p className={remaining < 0 ? 'text-red-500' : 'text-green-500'}>
                Remaining: ${remaining.toLocaleString()}
                {remaining < 0 && ' (Over Budget)'}
              </p>
            </div>
          </div>

          <form
            onSubmit={handleAddCategory}
            className="flex flex-col gap-2 sm:flex-row"
          >
            <Input
              placeholder="Category Name"
              value={newCategory.name}
              onChange={(e) =>
                setNewCategory({ ...newCategory, name: e.target.value })
              }
              className="bg-gray-800 text-white"
            />
            <Input
              type="number"
              placeholder="Allocated Amount"
              value={newCategory.allocated}
              onChange={(e) =>
                setNewCategory({ ...newCategory, allocated: e.target.value })
              }
              className="bg-gray-800 text-white w-full sm:w-32"
            />
            <Button type="submit" disabled={addCategoryMutation.isPending}>
              {addCategoryMutation.isPending ? 'Adding...' : 'Add Category'}
            </Button>
          </form>

          <div className="space-y-4">
            {budget.categories.map((category) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-2 p-2 bg-gray-800 rounded-md sm:flex-row sm:items-center sm:gap-4"
              >
                {editingCategoryId === category.id ? (
                  <Input
                    value={category.name}
                    onChange={(e) =>
                      handleUpdateCategory(category.id, e.target.value)
                    }
                    onBlur={() => setEditingCategoryId(null)}
                    className="bg-gray-700 text-white w-full sm:w-auto"
                    autoFocus
                  />
                ) : (
                  <Badge
                    className="cursor-pointer hover:bg-gray-700"
                    onClick={() => setEditingCategoryId(category.id)}
                  >
                    {category.name}
                  </Badge>
                )}
                <p className="text-sm">
                  Allocated:{' '}
                  <span className="font-semibold">
                    ${category.allocated.toLocaleString()}
                  </span>
                </p>
                <Input
                  type="number"
                  defaultValue={category.spent}
                  onBlur={(e) =>
                    handleUpdateCategory(category.id, undefined, e.target.value)
                  }
                  className="bg-gray-700 text-white w-full sm:w-24"
                  placeholder="Spent"
                />
                <Progress
                  value={(category.spent / category.allocated) * 100}
                  className={cn(
                    'w-full sm:w-32 h-2',
                    category.spent > category.allocated
                      ? 'bg-red-900'
                      : 'bg-green-900'
                  )}
                />
                <p
                  className={
                    category.spent > category.allocated
                      ? 'text-red-500'
                      : 'text-green-500'
                  }
                >
                  {category.spent > category.allocated ? 'Over' : 'Under'} by $
                  {Math.abs(
                    category.allocated - category.spent
                  ).toLocaleString()}
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteCategoryMutation.mutate(category.id)}
                  disabled={deleteCategoryMutation.isPending}
                >
                  Delete
                </Button>
              </motion.div>
            ))}
          </div>

          <div className="mt-6">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetTracker;
