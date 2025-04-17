import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
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
import { 
  PlusCircle, 
  DollarSign, 
  Copy, 
  RefreshCw, 
  Trash2, 
  Edit, 
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Wallet,
  BarChart3,
  Calendar
} from 'lucide-react';

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
  // Dark blue color palette variables
  const colors = {
    darkBlue1: '#0A1929', // Darkest blue
    darkBlue2: '#11294D', // Dark blue
    darkBlue3: '#1A3A6E', // Medium blue
    darkBlue4: '#2E4E8F', // Lighter accent blue
    lightAccent: '#4C9FE6', // Light blue accent
  };

  const [newCategory, setNewCategory] = useState({ name: '', allocated: '' });
  const [totalBudget, setTotalBudget] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const queryClient = useQueryClient();

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

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: "spring", 
        stiffness: 100, 
        damping: 15,
        duration: 0.5 
      } 
    },
    hover: {
      y: -8,
      transition: { duration: 0.3 }
    }
  };
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
    enabled: false, // Note: You might want to enable this in a real application
  });

  const setTotalBudgetMutation = useMutation({
    mutationFn: (total: number) => api.put('/budget/total', { total }),
    onSuccess: (_, total) => {
      queryClient.setQueryData(['budget'], (old: Budget | undefined) => ({
        ...old,
        total,
      }));
      toast.success('Total budget updated!', {
        description: `Your wedding budget has been set to $${total.toLocaleString()}`,
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      });
      setTotalBudget('');
    },
    onError: () => toast.error('Failed to update total budget.', {
      description: 'Please try again or check your connection.',
      icon: <XCircle className="h-5 w-5 text-red-500" />,
    }),
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
      toast.success('Category added successfully!', {
        description: `"${category.name}" has been added to your budget categories.`,
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      });
      setNewCategory({ name: '', allocated: '' });
    },
    onError: () => toast.error('Failed to add category.', {
      description: 'Please check the information and try again.',
      icon: <XCircle className="h-5 w-5 text-red-500" />,
    }),
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
      toast.success('Category updated!', {
        description: vars.name 
          ? `Category name updated to "${vars.name}"`
          : 'Spending amount has been updated.',
      });
      setEditingCategoryId(null);
    },
    onError: () => toast.error('Failed to update category.', {
      description: 'Please try again or check your connection.',
    }),
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/budget/categories/${id}`),
    onSuccess: (_, id) => {
      queryClient.setQueryData(['budget'], (old: Budget | undefined) => ({
        ...old,
        categories: old?.categories.filter((cat) => cat.id !== id) || [],
      }));
      toast.success('Category removed successfully!', {
        description: 'The budget category has been deleted.',
      });
    },
    onError: () => toast.error('Failed to remove category.', {
      description: 'Please try again or check your connection.',
    }),
  });

  const resetBudgetMutation = useMutation({
    mutationFn: () => api.delete('/budget/reset'),
    onSuccess: () => {
      queryClient.setQueryData(['budget'], { total: 0, categories: [] });
      toast.success('Budget reset successfully!', {
        description: 'Your budget has been reset to zero with no categories.',
        icon: <RefreshCw className="h-5 w-5 text-green-500" />,
      });
    },
    onError: () => toast.error('Failed to reset budget.', {
      description: 'Please try again or check your connection.',
    }),
  });
  // Calculate budget metrics
  const totalSpent = budget.categories.reduce((sum, c) => sum + c.spent, 0);
  const remaining = budget.total - totalSpent;
  const spentPercentage = budget.total > 0 ? (totalSpent / budget.total) * 100 : 0;

  // Handler functions
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
      .then(() => toast.success('Budget summary copied to clipboard!', {
        description: 'You can now paste the summary in any document or message.',
        icon: <Copy className="h-5 w-5 text-blue-500" />,
      }));
  };

  // Chart configuration
  const chartData = {
    labels: budget.categories.map((c) => c.name),
    datasets: [
      {
        label: 'Allocated',
        data: budget.categories.map((c) => c.allocated),
        backgroundColor: 'rgba(76, 159, 230, 0.7)',
        borderColor: 'rgba(76, 159, 230, 1)',
        borderWidth: 1,
      },
      {
        label: 'Spent',
        data: budget.categories.map((c) => c.spent),
        backgroundColor: 'rgba(46, 78, 143, 0.7)',
        borderColor: 'rgba(46, 78, 143, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Amount ($)', color: 'rgba(255, 255, 255, 0.8)' },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
        }
      },
      x: { 
        title: { display: true, text: 'Categories', color: 'rgba(255, 255, 255, 0.8)' },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
        }
      },
    },
    plugins: {
      legend: { 
        labels: { color: 'rgba(255, 255, 255, 0.9)' },
        position: 'top',
      },
      tooltip: {
        backgroundColor: 'rgba(10, 25, 41, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 10,
        boxPadding: 5,
        usePointStyle: true,
        bodyFont: {
          size: 14
        },
        titleFont: {
          size: 16,
          weight: 'bold'
        }
      },
    },
  };
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${colors.darkBlue1} 0%, ${colors.darkBlue2} 100%)` }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center"
      >
        <div className="relative w-16 h-16 mb-4">
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }
            }}
            className="w-full h-full rounded-full border-t-2 border-r-2 border-blue-400"
          ></motion.div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-blue-400 text-2xl">$</span>
          </div>
        </div>
        <p className="text-blue-100/80">Loading your budget data...</p>
      </motion.div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${colors.darkBlue1} 0%, ${colors.darkBlue2} 100%)` }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-8 rounded-3xl backdrop-blur-xl border border-white/10 shadow-2xl max-w-md text-center"
        style={{ background: `linear-gradient(135deg, rgba(42, 67, 101, 0.4) 0%, rgba(26, 41, 64, 0.4) 100%)` }}
      >
        <div className="mb-4 text-red-400 flex justify-center">
          <AlertTriangle className="h-12 w-12" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Error Loading Budget</h3>
        <p className="text-blue-100/70 mb-6">We couldn't load your budget data. Please try again later.</p>
        <Button 
          className="w-full rounded-xl py-5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen pt-20 p-6 relative overflow-hidden" style={{
      background: `linear-gradient(135deg, ${colors.darkBlue1} 0%, ${colors.darkBlue2} 100%)`
    }}>
      <Toaster richColors position="top-right" />
      
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full opacity-8"
          initial={{ opacity: 0.04 }}
          animate={{
            opacity: [0.04, 0.06, 0.04],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          style={{
            background: `radial-gradient(circle, ${colors.darkBlue4} 0%, transparent 70%)`,
            filter: 'blur(60px)',
          }}
        ></motion.div>
        <motion.div
          className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full opacity-8"
          initial={{ opacity: 0.04 }}
          animate={{
            opacity: [0.04, 0.07, 0.04],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          style={{
            background: `radial-gradient(circle, ${colors.lightAccent} 0%, transparent 70%)`,
            filter: 'blur(70px)',
          }}
        ></motion.div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto relative z-10 space-y-8"
      >
        {/* Header */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
        >
          <div>
            <motion.h2 
              className="text-xl font-medium text-blue-100/80"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Wedding Planning
            </motion.h2>
            <motion.h1 
              className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Budget Tracker
            </motion.h1>
          </div>
          
          <motion.div 
            variants={itemVariants}
            className="flex gap-3 items-center"
          >
            <div className="bg-white/5 backdrop-blur-sm rounded-full px-3 py-1 border border-white/10 text-blue-100/90 text-sm flex items-center gap-2">
              <Calendar size={16} className="text-blue-300" />
              <span>April 16, 2025</span>
            </div>
            
            <Button variant="glass" size="sm" className="rounded-full gap-2" onClick={copySummary}>
              <Copy size={16} className='text-white' />
              <span className='text-white'>Copy Summary</span>
            </Button>
          </motion.div>
        </motion.div>

        {/* Budget summary stats */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
              className="backdrop-blur-lg rounded-3xl border border-white/10 p-6 flex flex-col gap-3"
              style={{
                background: `linear-gradient(135deg, rgba(46, 78, 143, 0.2) 0%, rgba(26, 58, 110, 0.2) 100%)`,
              }}
            >
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-blue-500/20 border border-blue-500/30">
                  <Wallet size={24} className="text-blue-300" />
                </div>
                <div className="flex-1">
                  <h3 className="text-blue-100/70 text-sm">Total Budget</h3>
                  <p className="text-2xl font-bold text-white">${budget.total.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="mt-2">
                <form onSubmit={handleSetTotal} className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Set New Total"
                    value={totalBudget}
                    onChange={(e) => setTotalBudget(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-blue-100/40 rounded-xl h-9 focus:border-blue-400/60 transition-all duration-300"
                  />
                  <Button 
                    type="submit" 
                    disabled={setTotalBudgetMutation.isPending}
                    variant="blue"
                    size="sm"
                    className="rounded-xl text-white"
                  >
                    {setTotalBudgetMutation.isPending ? 'Setting...' : 'Set'}
                  </Button>
                </form>
              </div>
            </motion.div>
            
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
              className="backdrop-blur-lg rounded-3xl border border-white/10 p-6 flex flex-col gap-3"
              style={{
                background: `linear-gradient(135deg, rgba(46, 78, 143, 0.2) 0%, rgba(26, 58, 110, 0.2) 100%)`,
              }}
            >
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${remaining >= 0 ? 'bg-green-500/20 border-green-500/30' : 'bg-red-500/20 border-red-500/30'} border`}>
                  {remaining >= 0 
                    ? <CheckCircle size={24} className="text-green-300" />
                    : <AlertTriangle size={24} className="text-red-300" />
                  }
                </div>
                <div className="flex-1">
                  <h3 className="text-blue-100/70 text-sm">Remaining Budget</h3>
                  <p className={`text-2xl font-bold ${remaining >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                    ${Math.abs(remaining).toLocaleString()}
                    {remaining < 0 && ' (Over Budget)'}
                  </p>
                </div>
              </div>
              
              <div className="mt-2">
                <div className="text-xs text-blue-100/70 mb-1 flex justify-between">
                  <span>Budget Progress</span>
                  <span>{spentPercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(spentPercentage, 100)}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className={`h-full rounded-full ${
                      remaining < 0 
                        ? 'bg-red-500' 
                        : spentPercentage > 80 
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                    }`}
                  ></motion.div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
              className="backdrop-blur-lg rounded-3xl border border-white/10 p-6 flex flex-col gap-3"
              style={{
                background: `linear-gradient(135deg, rgba(46, 78, 143, 0.2) 0%, rgba(26, 58, 110, 0.2) 100%)`,
              }}
            >
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-purple-500/20 border border-purple-500/30">
                  <BarChart3 size={24} className="text-purple-300" />
                </div>
                <div className="flex-1">
                  <h3 className="text-blue-100/70 text-sm">Total Spent</h3>
                  <p className="text-2xl font-bold text-white">${totalSpent.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="mt-2">
                <Button 
                  onClick={() => resetBudgetMutation.mutate()}
                  disabled={resetBudgetMutation.isPending}
                  variant="outline"
                  size="sm"
                  className="w-full rounded-xl border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white"
                >
                  <RefreshCw size={14} className="mr-1.5" />
                  {resetBudgetMutation.isPending ? 'Resetting...' : 'Reset Budget'}
                </Button>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Main budget content */}
        <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-8" variants={itemVariants}>
          {/* Budget categories */}
          <Card className="backdrop-blur-xl border border-white/10 shadow-xl rounded-3xl overflow-hidden"
            style={{
              background: `linear-gradient(135deg, rgba(42, 67, 101, 0.3) 0%, rgba(26, 41, 64, 0.4) 100%)`,
            }}
          >
            <CardHeader className="px-6 py-6">
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <DollarSign size={20} className="text-blue-300" />
                <span>Budget Categories</span>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="px-6 py-2 pb-6 space-y-6">
              {/* Add category form */}
              <form
                onSubmit={handleAddCategory}
                className="p-4 rounded-xl bg-white/5 border border-white/10"
              >
                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                  <PlusCircle size={16} className="text-blue-300" />
                  Add New Category
                </h3>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    placeholder="Category Name"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-blue-100/40 rounded-xl h-11 focus:border-blue-400/60 transition-all duration-300"
                  />
                  
                  <Input
                    type="number"
                    placeholder="Allocated Amount"
                    value={newCategory.allocated}
                    onChange={(e) => setNewCategory({ ...newCategory, allocated: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-blue-100/40 rounded-xl h-11 focus:border-blue-400/60 transition-all duration-300 sm:w-32"
                  />
                  
                  <Button 
                    type="submit" 
                    disabled={addCategoryMutation.isPending || !newCategory.name || !newCategory.allocated}
                    className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                  >
                    {addCategoryMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
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
                        <span>Adding...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <PlusCircle size={18} />
                        <span>Add Category</span>
                      </div>
                    )}
                  </Button>
                </div>
              </form>
              
              {/* Categories list */}
              <div className="space-y-4">
                {budget.categories.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 mb-4">
                      <DollarSign size={32} className="text-blue-300" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">No Categories Yet</h3>
                    <p className="text-blue-100/70 max-w-md mx-auto">
                      Add your first budget category to start tracking your wedding expenses.
                    </p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {budget.categories.map((category) => (
                      <motion.div
                        key={category.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        whileHover={{ y: -3 }}
                        transition={{ duration: 0.3 }}
                        className="backdrop-blur-sm rounded-xl border border-white/10 p-4"
                        style={{
                          background: `linear-gradient(135deg, rgba(46, 78, 143, 0.2) 0%, rgba(26, 58, 110, 0.2) 100%)`,
                        }}
                      >
                        <div className="flex flex-col gap-4">
                          <div className="flex items-start justify-between">
                            <div>
                              {editingCategoryId === category.id ? (
                                <Input
                                  value={category.name}
                                  onChange={(e) => handleUpdateCategory(category.id, e.target.value)}
                                  onBlur={() => setEditingCategoryId(null)}
                                  className="bg-white/10 border-white/20 text-white rounded-xl py-1 px-2 w-48 text-sm font-medium"
                                  autoFocus
                                />
                              ) : (
                                <div 
                                  className="text-white font-medium cursor-pointer flex items-center gap-1.5 hover:text-blue-300 transition-colors"
                                  onClick={() => setEditingCategoryId(category.id)}
                                >
                                  {category.name}
                                  <Edit size={14} className="text-blue-300/70" />
                                </div>
                              )}
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => deleteCategoryMutation.mutate(category.id)}
                              disabled={deleteCategoryMutation.isPending}
                              className="rounded-full text-red-300/70 hover:text-red-300 hover:bg-white/10"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                              <p className="text-xs text-blue-100/60 mb-1">Allocated</p>
                              <p className="text-lg font-semibold text-white">${category.allocated.toLocaleString()}</p>
                            </div>
                            
                            <div className="bg-white/5 p-3 rounded-lg border border-white/10 flex items-center gap-2">
                              <div className="flex-1">
                                <p className="text-xs text-blue-100/60 mb-1">Spent</p>
                                <Input
                                  type="number"
                                  defaultValue={category.spent}
                                  onBlur={(e) => handleUpdateCategory(category.id, undefined, e.target.value)}
                                  className="bg-transparent border-0 p-0 h-auto text-lg font-semibold text-white focus-visible:ring-0"
                                  placeholder="0"
                                />
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-blue-100/70">Category Progress</span>
                              <span className={`${
                                category.spent > category.allocated ? 'text-red-300' : 'text-blue-100'
                              }`}>
                                {((category.spent / category.allocated) * 100).toFixed(0)}%
                              </span>
                            </div>
                            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                  category.spent > category.allocated 
                                    ? 'bg-red-500' 
                                    : category.spent / category.allocated > 0.8
                                      ? 'bg-yellow-500' 
                                      : 'bg-green-500'
                                }`}
                                style={{ width: `${Math.min((category.spent / category.allocated) * 100, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-blue-100/70">
                              {category.spent > category.allocated ? 'Over budget by' : 'Remaining'}
                            </span>
                                                       <span className={`font-medium ${
                              category.spent > category.allocated ? 'text-red-300' : 'text-green-300'
                            }`}>
                              ${Math.abs(category.allocated - category.spent).toLocaleString()}
                            </span>
                          </div>
                          </div>
                        </motion.div>
                      ))
                    }
                  </AnimatePresence>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Budget Chart */}
          <Card className="backdrop-blur-xl border border-white/10 shadow-xl rounded-3xl overflow-hidden"
            style={{
              background: `linear-gradient(135deg, rgba(42, 67, 101, 0.3) 0%, rgba(26, 41, 64, 0.4) 100%)`,
            }}
          >
            <CardHeader className="px-6 py-6">
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <BarChart3 size={20} className="text-blue-300" />
                <span>Budget Analysis</span>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="px-6 py-2 pb-6">
              {budget.categories.length === 0 ? (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 mb-4">
                    <BarChart3 size={32} className="text-blue-300" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">No Data to Display</h3>
                  <p className="text-blue-100/70 max-w-md mx-auto">
                    Add budget categories to see your spending analysis here.
                  </p>
                </div>
              ) : (
                <div className="h-80">
                  <Bar data={chartData} options={chartOptions} />
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default BudgetTracker;

