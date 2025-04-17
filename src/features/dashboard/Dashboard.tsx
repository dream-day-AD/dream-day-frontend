import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Plus, Calendar, DollarSign, CheckCircle, List, ChevronRight, Clock } from 'lucide-react';

interface DashboardData {
  todos: string[];
  budgetOverview: { total: number; spent: number };
  keyDates: string[];
  role?: string;
}

export const Dashboard = () => {
  // Dark blue color palette variables
  const colors = {
    darkBlue1: '#0A1929', // Darkest blue
    darkBlue2: '#11294D', // Dark blue
    darkBlue3: '#1A3A6E', // Medium blue
    darkBlue4: '#2E4E8F', // Lighter accent blue
    lightAccent: '#4C9FE6', // Light blue accent
  };

  const { role, token, name } = useSelector((state: RootState) => state.auth);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
        when: "beforeChildren"
      }
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

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.3 }
    }
  };

  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ['dashboard', role],
    queryFn: async () => {
      if (!token) throw new Error('No token available');
      const response = await api.get('/dashboard');
      if (!response.data) throw new Error('Empty response from server');
      return response.data;
    },
    enabled: !!token && !!role,
    retry: false,
  });

  const handleTestToast = () => {
    toast.success('Task added successfully!', {
      description: 'Your new task has been added to your to-do list.',
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
    });
  };

  // Get progress percentage for budget
  const getBudgetProgress = () => {
    if (!data) return 0;
    const { total, spent } = data.budgetOverview;
    return Math.min(Math.round((spent / total) * 100), 100);
  };

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
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
            <span className="text-blue-400 text-2xl">D</span>
          </div>
        </div>
        <p className="text-blue-100/80">Loading your dashboard...</p>
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
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Error Loading Dashboard</h3>
        <p className="text-blue-100/70 mb-6">{error.message}</p>
        <Button 
          className="w-full rounded-xl py-5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </motion.div>
    </div>
  );

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${colors.darkBlue1} 0%, ${colors.darkBlue2} 100%)` }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-8 rounded-3xl backdrop-blur-xl border border-white/10 shadow-2xl max-w-md text-center"
        style={{ background: `linear-gradient(135deg, rgba(42, 67, 101, 0.4) 0%, rgba(26, 41, 64, 0.4) 100%)` }}
      >
        <h3 className="text-xl font-semibold text-white mb-2">No Data Available</h3>
        <p className="text-blue-100/70 mb-6">We couldn't find any dashboard data for your account.</p>
        <Button 
          className="w-full rounded-xl py-5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
          onClick={() => window.location.reload()}
        >
          Refresh Dashboard
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
        />
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
        />
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
              {getGreeting()}, {name}
            </motion.h2>
            <motion.h1 
              className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {role === 'client'
                ? 'Your Wedding Dashboard'
                : role === 'planner'
                ? 'Planner Dashboard'
                : 'Admin Dashboard'}
            </motion.h1>
          </div>
          
          <motion.div 
            variants={itemVariants}
            className="flex gap-3"
          >
            <Button variant="glass" size="sm" className="rounded-full text-white backdrop-blur-md gap-2">
              <Calendar size={16} />
              <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </Button>
            <Button variant="blue" size="sm" className="rounded-full gap-2">
              <Plus size={16}
              className='text-white' />
              <span className='text-white'>New Event</span>
            </Button>
          </motion.div>
        </motion.div>

        {/* Stats overview */}
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <motion.div
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
            className="backdrop-blur-lg rounded-3xl border border-white/10 p-4 flex items-center gap-4"
            style={{
              background: `linear-gradient(135deg, rgba(46, 78, 143, 0.2) 0%, rgba(26, 58, 110, 0.2) 100%)`,
            }}
          >
            <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 border border-indigo-500/30">
              <CheckCircle size={24} className="text-indigo-400" />
            </div>
            <div>
              <p className="text-sm text-blue-100/70">Completed Tasks</p>
              <p className="text-xl font-bold text-white">{data.todos.filter(todo => todo.includes('Completed')).length}/{data.todos.length}</p>
            </div>
          </motion.div>
          
          <motion.div
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
            className="backdrop-blur-lg rounded-3xl border border-white/10 p-4 flex items-center gap-4"
            style={{
              background: `linear-gradient(135deg, rgba(46, 78, 143, 0.2) 0%, rgba(26, 58, 110, 0.2) 100%)`,
            }}
          >
            <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30">
              <DollarSign size={24} className="text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-blue-100/70">Budget Remaining</p>
              <p className="text-xl font-bold text-white">
                ${(data.budgetOverview.total - data.budgetOverview.spent).toLocaleString()}
              </p>
            </div>
          </motion.div>
          
          <motion.div
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
            className="backdrop-blur-lg rounded-3xl border border-white/10 p-4 flex items-center gap-4"
            style={{
              background: `linear-gradient(135deg, rgba(46, 78, 143, 0.2) 0%, rgba(26, 58, 110, 0.2) 100%)`,
            }}
          >
            <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30">
              <Clock size={24} className="text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-blue-100/70">Next Milestone</p>
              <p className="text-xl font-bold text-white">{data.keyDates[0].split(':')[0]}</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Main dashboard cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <motion.div 
            variants={cardVariants}
            whileHover="hover"
          >
            <Card className="backdrop-blur-xl border border-white/10 shadow-xl rounded-3xl overflow-hidden h-full"
              style={{
                background: `linear-gradient(135deg, rgba(42, 67, 101, 0.3) 0%, rgba(26, 41, 64, 0.4) 100%)`,
              }}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-white flex items-center gap-2">
                    <List size={18} className="text-blue-300" />
                    To-Do List
                  </CardTitle>
                  <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full">
                    {data.todos.length} tasks
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <ul className="space-y-3">
                  {data.todos.map((todo, index) => (
                    <motion.li 
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors duration-200"
                    >
                      <div className="bg-blue-500/10 text-blue-300 p-1 rounded-md mt-0.5">
                        <CheckCircle size={16} />
                      </div>
                      <span className={`text-sm ${todo.includes('Completed') ? 'text-blue-100/50 line-through' : 'text-blue-100/90'}`}>
                        {todo}
                      </span>
                    </motion.li>
                  ))}
                </ul>
                <Button 
                  className="mt-6 w-full rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-md shadow-blue-500/10 transition-all duration-300"
                  onClick={handleTestToast}
                >
                  <Plus size={16} className="mr-1" />
                  Add New Task
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div 
            variants={cardVariants}
            whileHover="hover"
          >
            <Card className="backdrop-blur-xl border border-white/10 shadow-xl rounded-3xl overflow-hidden h-full"
              style={{
                background: `linear-gradient(135deg, rgba(42, 67, 101, 0.3) 0%, rgba(26, 41, 64, 0.4) 100%)`,
              }}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-white flex items-center gap-2">
                    <DollarSign size={18} className="text-green-300" />
                    Budget Overview
                  </CardTitle>
                  <span className="text-xs px-2 py-1 bg-green-500/20 text-green-300 rounded-full">
                    {getBudgetProgress()}% used
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-100/70">Total Budget</span>
                      <span className="text-white font-medium">${data.budgetOverview.total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-100/70">Spent So Far</span>
                      <span className="text-white font-medium">${data.budgetOverview.spent.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-100/70">Remaining</span>
                      <span className="text-white font-medium">${(data.budgetOverview.total - data.budgetOverview.spent).toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-blue-100/70">Budget Progress</span>
                      <span className="text-blue-100">{getBudgetProgress()}%</span>
                    </div>
                    <div className="w-full h-2 bg-blue-500/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${getBudgetProgress()}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className={`h-full rounded-full ${
                          getBudgetProgress() < 50 
                            ? 'bg-green-400' 
                            : getBudgetProgress() < 80 
                              ? 'bg-yellow-400' 
                              : 'bg-red-400'
                        }`}
                      ></motion.div>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/5 rounded-xl p-3">
                        <p className="text-xs text-blue-100/70 mb-1">Top Category</p>
                        <p className="text-sm text-white">Venue & Catering</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3">
                        <p className="text-xs text-blue-100/70 mb-1">Last Expense</p>
                        <p className="text-sm text-white">Flowers ($450)</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button 
                  variant="outline"
                  className="mt-6 w-full rounded-xl border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white gap-1"
                >
                  View Budget Details
                  <ChevronRight size={16} />
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div 
            variants={cardVariants}
            whileHover="hover"
          >
            <Card className="backdrop-blur-xl border border-white/10 shadow-xl rounded-3xl overflow-hidden h-full"
              style={{
                                background: `linear-gradient(135deg, rgba(42, 67, 101, 0.3) 0%, rgba(26, 41, 64, 0.4) 100%)`,
              }}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-white flex items-center gap-2">
                    <Calendar size={18} className="text-purple-300" />
                    Key Dates
                  </CardTitle>
                  <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full">
                    {data.keyDates.length} events
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-4">
                  {data.keyDates.map((dateItem, index) => {
                    const [date, description] = dateItem.split(':');
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-3"
                      >
                        <div className={`p-2 rounded-lg ${
                          index === 0 
                            ? 'bg-purple-500/20 text-purple-300' 
                            : 'bg-blue-500/10 text-blue-300'
                        }`}>
                          <Calendar size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{date}</p>
                          <p className="text-xs text-blue-100/70">{description}</p>
                        </div>
                        <div className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full ${
                          index === 0 
                            ? 'bg-purple-500/10 text-purple-300' 
                            : 'bg-blue-500/10 text-blue-300'
                        }`}>
                          {index === 0 ? 'Upcoming' : index < 2 ? '2 weeks' : '1 month'}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Calendar view */}
                <div className="mt-6 p-3 rounded-xl bg-white/5 space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-white">July 2025</p>
                    <div className="flex gap-1">
                      <button className="p-1 rounded-md hover:bg-white/10">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-100/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button className="p-1 rounded-md hover:bg-white/10">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-100/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-7 gap-1 text-center text-xs">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                      <div key={i} className="text-blue-100/50">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {Array.from({ length: 31 }, (_, i) => {
                      // Add some highlight days for the demo
                      const isHighlighted = [5, 12, 20].includes(i + 1);
                      const isToday = i + 1 === 15;
                      
                      return (
                        <button 
                          key={i} 
                          className={`text-xs rounded-full aspect-square flex items-center justify-center ${
                            isToday 
                              ? 'bg-purple-500 text-white' 
                              : isHighlighted 
                                ? 'bg-blue-500/20 text-blue-300' 
                                : 'text-blue-100/70 hover:bg-white/5'
                          }`}
                        >
                          {i + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                <Button 
                  variant="outline"
                  className="mt-6 w-full rounded-xl border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white gap-1"
                >
                  View Full Timeline
                  <ChevronRight size={16} />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Additional dashboard section */}
        <motion.div
          variants={itemVariants}
          className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <motion.div
            variants={cardVariants}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
            className="lg:col-span-2 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden"
            style={{
              background: `linear-gradient(135deg, rgba(42, 67, 101, 0.3) 0%, rgba(26, 41, 64, 0.4) 100%)`,
            }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Recent Activity
                </h3>
                <Button variant="ghost" size="sm" className="text-blue-300 hover:text-white">
                  View All
                </Button>
              </div>

              <div className="space-y-4">
                {[
                  { 
                    activity: "Budget updated", 
                    description: "Increased floral budget by $200", 
                    time: "2 hours ago", 
                    icon: <DollarSign size={14} />,
                    color: "bg-green-500/20 text-green-400" 
                  },
                  { 
                    activity: "Task completed", 
                    description: "Sent invitations to all guests", 
                    time: "Yesterday", 
                    icon: <CheckCircle size={14} />,
                    color: "bg-blue-500/20 text-blue-400" 
                  },
                  { 
                    activity: "Event added", 
                    description: "Scheduled final venue walkthrough", 
                    time: "2 days ago", 
                    icon: <Calendar size={14} />,
                    color: "bg-purple-500/20 text-purple-400" 
                  }
                ].map((item, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all duration-200"
                  >
                    <div className={`p-2 rounded-lg ${item.color}`}>
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{item.activity}</p>
                      <p className="text-xs text-blue-100/70">{item.description}</p>
                    </div>
                    <span className="text-xs text-blue-100/50">{item.time}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={cardVariants}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
            className="backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden"
            style={{
              background: `linear-gradient(135deg, rgba(42, 67, 101, 0.3) 0%, rgba(26, 41, 64, 0.4) 100%)`,
            }}
          >
            <div className="p-6">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Wedding Team
              </h3>

              <div className="space-y-3">
                {[
                  { 
                    name: "Jessica Parker", 
                    role: "Wedding Planner", 
                    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80"
                  },
                  { 
                    name: "Michael Chen", 
                    role: "Photographer", 
                    image: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80" 
                  },
                  { 
                    name: "Sarah Johnson", 
                    role: "Catering Manager", 
                    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80" 
                  }
                ].map((person, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all duration-200"
                  >
                    <img 
                      src={person.image} 
                      alt={person.name} 
                      className="w-10 h-10 rounded-full object-cover border border-white/20" 
                    />
                    <div>
                      <p className="text-sm font-medium text-white">{person.name}</p>
                      <p className="text-xs text-blue-100/70">{person.role}</p>
                    </div>
                    <Button size="icon-sm" variant="ghost" className="ml-auto rounded-full text-blue-300 hover:text-white hover:bg-white/10">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </Button>
                  </motion.div>
                ))}
              </div>

              <Button 
                variant="outline"
                className="mt-6 w-full rounded-xl border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white gap-1"
              >
                Manage Vendors
                <ChevronRight size={16} />
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

