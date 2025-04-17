import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import api from '@/lib/api';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { Plus, CheckCircle, X, Calendar, AlertTriangle, Trash2, GripVertical, ArrowDownUp, Filter, Check, ChevronRight } from 'lucide-react';

interface Task {
  id: string;
  description: string;
  completed: boolean;
  order: number;
  priority?: 'low' | 'medium' | 'high';
}

const TaskItem = ({
  task,
  index,
  moveTask,
  onToggle,
  onDelete,
}: {
  task: Task;
  index: number;
  moveTask: (from: number, to: number) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) => {
  const ref = useRef<HTMLLIElement>(null);
  const [, drag] = useDrag({
    type: 'TASK',
    item: { index },
  });
  const [, drop] = useDrop({
    accept: 'TASK',
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        moveTask(item.index, index);
        item.index = index;
      }
    },
  });

  drag(ref);
  drop(ref);

  // Colors for priority based on the dark blue palette
  const priorityConfig = {
    low: {
      bg: 'bg-green-500/20',
      text: 'text-green-300',
      border: 'border-green-500/30',
      icon: <CheckCircle size={14} />
    },
    medium: {
      bg: 'bg-blue-500/20',
      text: 'text-blue-300',
      border: 'border-blue-500/30',
      icon: <AlertTriangle size={14} />
    },
    high: {
      bg: 'bg-red-500/20',
      text: 'text-red-300',
      border: 'border-red-500/30',
      icon: <AlertTriangle size={14} />
    }
  };

  const { bg, text, border, icon } = priorityConfig[task.priority || 'low'];

  return (
    <motion.li
      ref={ref}
      className="flex items-center gap-3 p-3 backdrop-blur-sm rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300"
      style={{
        background: 'linear-gradient(135deg, rgba(46, 78, 143, 0.2) 0%, rgba(26, 58, 110, 0.2) 100%)',
      }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
    >
      <div className="cursor-move text-blue-100/50 hover:text-blue-100/80 transition-colors">
        <GripVertical size={18} />
      </div>
      
      <Checkbox
        checked={task.completed}
        onCheckedChange={() => onToggle(task.id)}
        aria-label={`Toggle completion for ${task.description}`}
        className="border-white/20 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 transition-colors duration-300"
      />
      
      <Badge 
        variant="outline"
        className={`${bg} ${text} ${border} rounded-xl px-2 py-1 flex items-center gap-1.5`}
      >
        {icon}
        <span className="text-xs font-medium capitalize">{task.priority || 'Low'}</span>
      </Badge>
      
      <span
        className={`flex-1 text-sm ${
          task.completed 
            ? 'line-through text-blue-100/40 transition-all duration-300' 
            : 'text-blue-100/90'
        }`}
      >
        {task.description}
      </span>
      
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-full text-blue-100/60 hover:text-red-400 hover:bg-white/10"
            aria-label={`Delete ${task.description}`}
          >
            <Trash2 size={16} />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent 
          className="rounded-3xl border border-white/10 shadow-xl backdrop-blur-xl"
          style={{ background: 'linear-gradient(135deg, rgba(42, 67, 101, 0.8) 0%, rgba(26, 41, 64, 0.8) 100%)' }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Task</AlertDialogTitle>
            <AlertDialogDescription className="text-blue-100/70">
              Are you sure you want to delete "{task.description}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="rounded-3xl bg-white/5 border border-white/10 text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => onDelete(task.id)}
              className="rounded-3xl bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.li>
  );
};
const Checklist = () => {
  // Dark blue color palette variables
  const colors = {
    darkBlue1: '#0A1929', // Darkest blue
    darkBlue2: '#11294D', // Dark blue
    darkBlue3: '#1A3A6E', // Medium blue
    darkBlue4: '#2E4E8F', // Lighter accent blue
    lightAccent: '#4C9FE6', // Light blue accent
  };

  const [newTask, setNewTask] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('low');
  const [showCompleted, setShowCompleted] = useState(true);
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
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

  const {
    data: tasks = [],
    isLoading,
    error,
  } = useQuery<Task[]>({
    queryKey: ['checklist'],
    queryFn: async () => {
      const response = await api.get('/checklist');
      return response.data.sort((a: Task, b: Task) => a.order - b.order);
    },
  });

  const addTaskMutation = useMutation({
    mutationFn: (description: string) =>
      api.post('/checklist', {
        description,
        order: tasks.length,
        priority: newPriority,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist'] });
      toast.success('Task added successfully!', {
        description: 'Your new task has been added to the checklist.',
        icon: <Check className="h-5 w-5 text-green-500" />,
      });
      setNewTask('');
      setNewPriority('low');
    },
    onError: () => toast.error('Failed to add task.', {
      description: 'Please try again or check your connection.',
      icon: <X className="h-5 w-5 text-red-500" />,
    }),
  });

  const toggleTaskMutation = useMutation({
    mutationFn: (id: string) =>
      api.patch(`/checklist/${id}`, {
        completed: !tasks.find((t) => t.id === id)?.completed,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist'] });
      // No toast needed for toggles to avoid too many notifications
    },
    onError: () => toast.error('Failed to update task.', {
      description: 'Please try again or check your connection.',
    }),
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/checklist/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist'] });
      toast.success('Task deleted successfully!', {
        description: 'The task has been removed from your checklist.',
      });
    },
    onError: () => toast.error('Failed to delete task.', {
      description: 'Please try again or check your connection.',
    }),
  });

  const reorderTasksMutation = useMutation({
    mutationFn: (updatedTasks: Task[]) =>
      api.put('/checklist/reorder', {
        tasks: updatedTasks.map((t, i) => ({ ...t, order: i })),
      }),
    onSuccess: () =>
      queryClient.setQueryData(['checklist'], (old: Task[] | undefined) =>
        old?.slice().sort((a, b) => a.order - b.order)
      ),
    onError: () => toast.error('Failed to reorder tasks.', {
      description: 'Your changes could not be saved. Please try again.',
    }),
  });

  const moveTask = (from: number, to: number) => {
    const updatedTasks = [...tasks];
    const [movedTask] = updatedTasks.splice(from, 1);
    updatedTasks.splice(to, 0, movedTask);
    reorderTasksMutation.mutate(updatedTasks);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim()) addTaskMutation.mutate(newTask);
  };

  // Apply filters
  let filteredTasks = tasks;
  
  // Filter by completion status
  if (!showCompleted) {
    filteredTasks = filteredTasks.filter((task) => !task.completed);
  }
  
  // Filter by priority
  if (filterPriority !== 'all') {
    filteredTasks = filteredTasks.filter((task) => task.priority === filterPriority);
  }
  
  const completedCount = tasks.filter((task) => task.completed).length;
  const completionPercentage = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;
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
            <span className="text-blue-400 text-2xl">C</span>
          </div>
        </div>
        <p className="text-blue-100/80">Loading your checklist...</p>
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
        <h3 className="text-xl font-semibold text-white mb-2">Error Loading Checklist</h3>
        <p className="text-blue-100/70 mb-6">We couldn't load your checklist data. Please try again later.</p>
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
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen p-6 relative overflow-hidden" style={{
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
          className="max-w-5xl mx-auto relative z-10 space-y-8"
        >
          {/* Header */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col pt-20 md:flex-row md:items-center md:justify-between gap-4 mb-8"
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
                Your Checklist
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
            </motion.div>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Card className="backdrop-blur-xl border border-white/10 shadow-xl rounded-3xl overflow-hidden"
              style={{
                background: `linear-gradient(135deg, rgba(42, 67, 101, 0.3) 0%, rgba(26, 41, 64, 0.4) 100%)`,
              }}
            >
              <CardHeader className="p-6 pb-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <CardTitle className="text-xl text-white flex items-center gap-2">
                    <CheckCircle size={20} className="text-blue-300" />
                    <span>Tasks Progress</span>
                    <Badge variant="outline" className="ml-2 bg-blue-500/20 text-blue-300 border-blue-500/30 rounded-full">
                      {completedCount}/{tasks.length} completed
                    </Badge>
                  </CardTitle>
                  
                  <div className="flex flex-nowrap items-center gap-2 overflow-x-auto max-w-full pb-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCompleted(!showCompleted)}
                      className="rounded-full border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white text-xs whitespace-nowrap flex-shrink-0"
                    >
                      {showCompleted ? 'Hide Completed' : 'Show Completed'}
                    </Button>
                    
                    <div className="relative flex-shrink-0">
                      <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className="rounded-full border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white flex-shrink-0"
                      >
                        <Filter size={16} />
                      </Button>
                      
                      <AnimatePresence>
                        {isFilterOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute right-0 mt-2 w-48 rounded-xl border border-white/10 backdrop-blur-lg shadow-lg z-10"
                            style={{ background: 'linear-gradient(135deg, rgba(42, 67, 101, 0.8) 0%, rgba(26, 41, 64, 0.9) 100%)' }}
                          >
                            <div className="px-3 py-2 text-sm font-medium text-white border-b border-white/10">
                              Filter by Priority
                            </div>
                            <div className="py-1">
                              {['all', 'low', 'medium', 'high'].map((priority) => (
                                <button
                                  key={priority}
                                  className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                                    filterPriority === priority
                                      ? 'bg-blue-500/20 text-white'
                                      : 'text-blue-100/80 hover:bg-white/5 hover:text-white'
                                  }`}
                                  onClick={() => {
                                    setFilterPriority(priority as 'all' | 'low' | 'medium' | 'high');
                                    setIsFilterOpen(false);
                                  }}
                                >
                                  {priority === 'all' ? 'All Priorities' : `${priority.charAt(0).toUpperCase() + priority.slice(1)} Priority`}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="icon-sm"
                      className="rounded-full border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white flex-shrink-0"
                    >
                      <ArrowDownUp size={16} />
                    </Button>
                  </div>

                </div>
              </CardHeader>
              
              <CardContent className="p-4 sm:p-6">
                {/* Progress bar */}
                <motion.div className="mb-6">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-blue-100/70">Overall Progress</span>
                    <span className="text-blue-100">{completionPercentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${completionPercentage}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                      className={`h-full rounded-full ${
                        completionPercentage < 50 
                          ? 'bg-blue-500' 
                          : completionPercentage < 80 
                            ? 'bg-green-500' 
                            : 'bg-green-400'
                      }`}
                    ></motion.div>
                  </div>
                </motion.div>
                
                {/* Add task form */}
                <form
                  onSubmit={handleAddTask}
                  className="mb-8"
                >
                  <div className="flex flex-col sm:flex-row gap-3 mb-3">
                    <Input
                      value={newTask}
                      onChange={(e) => setNewTask(e.target.value)}
                      placeholder="Add a new task to your checklist"
                      className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-blue-100/40 rounded-xl h-11 focus:border-blue-400/60 transition-all duration-300"
                      aria-label="New task description"
                    />
                    
                    <Select
                      value={newPriority}
                      onValueChange={(value) => setNewPriority(value as 'low' | 'medium' | 'high')}
                    >
                      <SelectTrigger
                        className="w-full sm:w-40 bg-white/5 border-white/10 text-white rounded-xl h-11 focus:border-blue-400/60 transition-all duration-300"
                        aria-label="Task priority"
                      >
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl backdrop-blur-md border border-white/10"
                        style={{ background: 'linear-gradient(135deg, rgba(42, 67, 101, 0.9) 0%, rgba(26, 41, 64, 0.95) 100%)' }}
                      >
                        <SelectItem value="low" className="text-green-300">Low Priority</SelectItem>
                        <SelectItem value="medium" className="text-blue-300">Medium Priority</SelectItem>
                        <SelectItem value="high" className="text-red-300">High Priority</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button 
                      type="submit" 
                      disabled={addTaskMutation.isPending}
                      className="sm:w-auto w-full rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium shadow-lg shadow-blue-500/20 transition-all duration-300"
                    >
                      {addTaskMutation.isPending ? (
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
                          <Plus size={18} />
                          <span>Add Task</span>
                        </div>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-blue-100/50">
                    Tip: Drag and drop tasks to reorder them. Set priorities to help organize your wedding planning.
                  </p>
                </form>
                
                {/* Task list */}
                <AnimatePresence>
                  {filteredTasks.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-10"
                    >
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 mb-4">
                        <CheckCircle size={32} className="text-blue-300" />
                      </div>
                      <h3 className="text-lg font-medium text-white mb-2">No tasks to display</h3>
                      <p className="text-blue-100/70 max-w-md mx-auto">
                        {!showCompleted 
                          ? "You've completed all your tasks! Toggle 'Show Completed' to see them."
                          : filterPriority !== 'all'
                            ? `No ${filterPriority} priority tasks found. Try a different filter.`
                            : "Add your first task to start planning your wedding!"}
                      </p>
                    </motion.div>
                  ) : (
                    <ul className="space-y-3">
                      {filteredTasks.map((task, index) => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          index={index}
                          moveTask={moveTask}
                          onToggle={toggleTaskMutation.mutate}
                          onDelete={deleteTaskMutation.mutate}
                        />
                      ))}
                    </ul>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Task categories section */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Before the Wedding",
                icon: <Calendar size={18} className="text-blue-300" />,
                count: 5,
                bg: "from-blue-500/20 to-blue-600/10",
                border: "border-blue-500/30"
              },
              {
                title: "Day of Wedding",
                icon: <CheckCircle size={18} className="text-green-300" />,
                count: 8,
                bg: "from-green-500/20 to-green-600/10",
                border: "border-green-500/30"
              },
              {
                title: "After Wedding",
                icon: <Calendar size={18} className="text-purple-300" />,
                count: 3,
                bg: "from-purple-500/20 to-purple-600/10",
                border: "border-purple-500/30"
              }
            ].map((category, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
                className="backdrop-blur-lg rounded-3xl border border-white/10 p-4 flex items-center gap-4"
                style={{
                  background: `linear-gradient(135deg, rgba(46, 78, 143, 0.2) 0%, rgba(26, 58, 110, 0.2) 100%)`,
                }}
              >
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${category.bg} border ${category.border}`}>
                  {category.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-medium">{category.title}</h3>
                  <p className="text-sm text-blue-100/70">{category.count} tasks</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon-sm" 
                  className="rounded-full text-blue-100/60 hover:text-blue-300 hover:bg-white/10"
                >
                  <ChevronRight size={18} />
                </Button>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </DndProvider>
  );
};

export default Checklist;
