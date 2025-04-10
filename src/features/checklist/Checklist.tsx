import { useState, useRef } from 'react';
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
} from '@/components/ui/select'; // Add Select components
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
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import api from '@/lib/api';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

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

  const priorityColor = {
    low: 'bg-green-600',
    medium: 'bg-yellow-600',
    high: 'bg-red-600',
  }[task.priority || 'low'];

  return (
    <motion.li
      ref={ref}
      className="flex items-center gap-2 p-2 bg-gray-800 rounded-md hover:bg-gray-700 transition-colors"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Checkbox
        checked={task.completed}
        onCheckedChange={() => onToggle(task.id)}
        aria-label={`Toggle completion for ${task.description}`}
      />
      <Badge className={`${priorityColor} text-white mr-2`}>
        {task.priority || 'Low'}
      </Badge>
      <span
        className={
          task.completed ? 'line-through text-gray-500 flex-1' : 'flex-1'
        }
      >
        {task.description}
      </span>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="destructive"
            size="sm"
            className="ml-auto"
            aria-label={`Delete ${task.description}`}
          >
            Delete
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="bg-[var(--card-bg)] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{task.description}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => onDelete(task.id)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.li>
  );
};

const Checklist = () => {
  const [newTask, setNewTask] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>(
    'low'
  ); // Add priority state
  const [showCompleted, setShowCompleted] = useState(true);
  const queryClient = useQueryClient();

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
      }), // Include priority
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist'] });
      toast.success('Task added successfully!');
      setNewTask('');
      setNewPriority('low'); // Reset priority
    },
    onError: () => toast.error('Failed to add task.'),
  });

  const toggleTaskMutation = useMutation({
    mutationFn: (id: string) =>
      api.patch(`/checklist/${id}`, {
        completed: !tasks.find((t) => t.id === id)?.completed,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['checklist'] }),
    onError: () => toast.error('Failed to update task.'),
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/checklist/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist'] });
      toast.success('Task deleted successfully!');
    },
    onError: () => toast.error('Failed to delete task.'),
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
    onError: () => toast.error('Failed to reorder tasks.'),
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

  const filteredTasks = showCompleted
    ? tasks
    : tasks.filter((task) => !task.completed);
  const completedCount = tasks.filter((task) => task.completed).length;

  if (isLoading)
    return <div className="p-6 text-center">Loading checklist...</div>;
  if (error)
    return (
      <div className="p-6 text-center text-red-500">
        Error loading checklist
      </div>
    );

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-6 space-y-6">
        <Toaster richColors position="top-right" />
        <h2 className="text-2xl font-semibold">Wedding Checklist</h2>

        <Card className="bg-[var(--card-bg)] border-none">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>
              Your Tasks ({completedCount}/{tasks.length} completed)
            </CardTitle>
            <Button
              variant="outline"
              onClick={() => setShowCompleted(!showCompleted)}
              aria-label={
                showCompleted ? 'Hide completed tasks' : 'Show completed tasks'
              }
            >
              {showCompleted ? 'Hide Completed' : 'Show Completed'}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <form
              onSubmit={handleAddTask}
              className="flex gap-2 flex-col sm:flex-row"
            >
              <Input
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Add a new task"
                className="bg-gray-800 text-white flex-1"
                aria-label="New task description"
              />
              <Select
                value={newPriority}
                onValueChange={(value) =>
                  setNewPriority(value as 'low' | 'medium' | 'high')
                }
              >
                <SelectTrigger
                  className="w-full sm:w-32 bg-gray-800 text-white"
                  aria-label="Task priority"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" disabled={addTaskMutation.isPending}>
                {addTaskMutation.isPending ? 'Adding...' : 'Add'}
              </Button>
            </form>
            <ul className="space-y-2">
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
          </CardContent>
        </Card>
      </div>
    </DndProvider>
  );
};

export default Checklist;
