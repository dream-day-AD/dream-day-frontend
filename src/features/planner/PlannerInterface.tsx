import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import * as signalR from '@microsoft/signalr';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { 
  Calendar, 
  CheckCircle, 
  CircleDollarSign, 
  MessageCircle, 
  Clock, 
  Building, 
  Send, 
  Plus,
  AlertTriangle, 
  RefreshCw, 
  LogOut, 
  User,
  CheckCircle2,
  Store,
  MoreHorizontal
} from 'lucide-react';

interface Wedding {
  id: string;
  coupleName: string;
  date: string;
  budget: number;
  tasks: { id: string; description: string; completed: boolean }[];
  vendors: { id: string; name: string; category: string }[];
}

interface Message {
  weddingId: string;
  sender: string;
  content: string;
  timestamp: string;
}

const PlannerInterface = () => {
  // Dark blue color palette variables
  const colors = {
    darkBlue1: '#0A1929', // Darkest blue
    darkBlue2: '#11294D', // Dark blue
    darkBlue3: '#1A3A6E', // Medium blue
    darkBlue4: '#2E4E8F', // Lighter accent blue
    lightAccent: '#4C9FE6', // Light blue accent
  };

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { role, name } = useSelector((state: RootState) => state.auth);

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
  // Mock wedding data
  const mockWeddings: Wedding[] = [
    {
      id: "1",
      coupleName: "Sarah & Michael",
      date: "2025-06-15T16:00:00",
      budget: 25000,
      tasks: [
        { id: "t1", description: "Book venue", completed: true },
        { id: "t2", description: "Hire photographer", completed: true },
        { id: "t3", description: "Order flowers", completed: false },
        { id: "t4", description: "Send invitations", completed: false },
        { id: "t5", description: "Finalize menu", completed: false },
      ],
      vendors: [
        { id: "v1", name: "Sunset Gardens", category: "venue" },
        { id: "v2", name: "Emma Photography", category: "photographer" },
      ]
    },
    {
      id: "2",
      coupleName: "Jessica & Robert",
      date: "2025-08-22T17:30:00",
      budget: 30000,
      tasks: [
        { id: "t6", description: "Book venue", completed: true },
        { id: "t7", description: "Hire band", completed: false },
        { id: "t8", description: "Finalize guest list", completed: false },
      ],
      vendors: [
        { id: "v3", name: "Ocean View Hall", category: "venue" },
      ]
    },
    {
      id: "3",
      coupleName: "Emily & James",
      date: "2025-05-08T15:00:00",
      budget: 22000,
      tasks: [
        { id: "t9", description: "Book venue", completed: true },
        { id: "t10", description: "Hire photographer", completed: true },
        { id: "t11", description: "Order cake", completed: true },
        { id: "t12", description: "Book transportation", completed: false },
      ],
      vendors: [
        { id: "v4", name: "Mountain Retreat", category: "venue" },
        { id: "v5", name: "John Smith Photography", category: "photographer" },
        { id: "v6", name: "Sweet Delights", category: "bakery" },
      ]
    }
  ];

  // Mock messages
  const mockMessages: Message[] = [
    {
      weddingId: "1",
      sender: "Sarah",
      content: "Hi, can we discuss the flower arrangements for the ceremony?",
      timestamp: "2023-05-01T10:15:00"
    },
    {
      weddingId: "1",
      sender: "Planner",
      content: "Of course! I have some suggestions based on your color scheme. Would you prefer roses or lilies?",
      timestamp: "2023-05-01T10:20:00"
    },
    {
      weddingId: "1",
      sender: "Sarah",
      content: "I think lilies would be beautiful. Can you send me some examples?",
      timestamp: "2023-05-01T10:25:00"
    },
    {
      weddingId: "2",
      sender: "Jessica",
      content: "Do you have any recommendations for a DJ?",
      timestamp: "2023-05-02T14:30:00"
    },
    {
      weddingId: "2",
      sender: "Planner",
      content: "Yes! I have three excellent DJs in mind for your wedding. I'll send their portfolios this afternoon.",
      timestamp: "2023-05-02T14:35:00"
    }
  ];

  // Fetch weddings data
  const {
    data: weddings = mockWeddings,
    isLoading,
    error,
    refetch
  } = useQuery<Wedding[]>({
    queryKey: ['planner-weddings'],
    queryFn: async () => {
      const response = await api.get('/planner/weddings');
      return response.data;
    },
    enabled: false, // Disabled for demo purposes
  });

  // State for selected wedding
  const [selectedWeddingId, setSelectedWeddingId] = useState<string | null>(
    weddings.length > 0 ? weddings[0].id : null
  );

  // Get selected wedding
  const selectedWedding = weddings.find(w => w.id === selectedWeddingId) || null;

  // Filter messages for selected wedding
  const weddingMessages = mockMessages.filter(m => m.weddingId === selectedWeddingId);

  // Set up SignalR connection
  useEffect(() => {
    if (!selectedWeddingId) return;

    // Create connection
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${api.defaults.baseURL}/chatHub`)
      .withAutomaticReconnect()
      .build();

    // Set up message handler
    newConnection.on("ReceiveMessage", (weddingId: string, sender: string, content: string) => {
      if (weddingId === selectedWeddingId) {
        const newMessage: Message = {
          weddingId,
          sender,
          content,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, newMessage]);
      }
    });

    // Start connection
    newConnection.start()
      .then(() => {
        console.log("SignalR connected");
        newConnection.invoke("JoinWeddingGroup", selectedWeddingId)
          .catch(err => console.error("Error joining wedding group:", err));
      })
      .catch(err => console.error("Error starting SignalR:", err));

    setConnection(newConnection);

    // Clean up on unmount
    return () => {
      if (newConnection) {
        newConnection.stop();
      }
    };
  }, [selectedWeddingId]);

  // Scroll to bottom of chat on new messages
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, weddingMessages]);

  // Initialize messages from mock data when wedding changes
  useEffect(() => {
    setMessages(weddingMessages);
  }, [selectedWeddingId]);
  // Send message
  const sendMessage = async () => {
    if (!selectedWeddingId || !message.trim() || !connection) return;

    try {
      // Send via SignalR
      await connection.invoke("SendMessage", selectedWeddingId, name, message);
      
      // Add to local state (would normally come back through SignalR)
      const newMessage: Message = {
        weddingId: selectedWeddingId,
        sender: "Planner",
        content: message,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, newMessage]);
      
      // Clear input
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message", {
        description: "Please try again or check your connection.",
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
      });
    }
  };

  // Toggle task completion
  const toggleTaskCompletion = (taskId: string) => {
    // This would be a mutation in a real app
    const updatedWeddings = weddings.map(wedding => {
      if (wedding.id === selectedWeddingId) {
        const updatedTasks = wedding.tasks.map(task => {
          if (task.id === taskId) {
            return { ...task, completed: !task.completed };
          }
          return task;
        });
        return { ...wedding, tasks: updatedTasks };
      }
      return wedding;
    });

    // Success notification
    const task = selectedWedding?.tasks.find(t => t.id === taskId);
    const taskName = task?.description || 'Task';
    const isComplete = !task?.completed;
    
    toast.success(`Task ${isComplete ? 'completed' : 'reopened'}`, {
      description: `"${taskName}" has been marked as ${isComplete ? 'completed' : 'incomplete'}.`,
      icon: isComplete ? <CheckCircle className="h-5 w-5 text-green-500" /> : <RefreshCw className="h-5 w-5 text-blue-500" />,
    });
    
    // In a real app, we would update the server and refetch or use optimistic updates
  };

  // Format date relative to today
  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Past';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 30) return `${diffDays} days`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
    return `${Math.floor(diffDays / 365)} years`;
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get wedding statistics
  const getWeddingStats = (wedding: Wedding) => {
    const totalTasks = wedding.tasks.length;
    const completedTasks = wedding.tasks.filter(t => t.completed).length;
    const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    const weddingDate = new Date(wedding.date);
    const now = new Date();
    const daysRemaining = Math.ceil((weddingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      completedTasks,
      totalTasks,
      completionPercentage,
      daysRemaining,
    };
  };

  // Format time for chat messages
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (role !== 'planner' && role !== 'admin') return (
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
        <h3 className="text-xl font-semibold text-white mb-2">Access Restricted</h3>
        <p className="text-blue-100/70 mb-6">This interface is only accessible to wedding planners.</p>
        <Button 
          className="w-full rounded-xl py-5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
          onClick={() => window.history.back()}
        >
          <LogOut size={18} className="mr-2" />
          Go Back
        </Button>
      </motion.div>
    </div>
  );
  
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
            <span className="text-blue-400 text-2xl">P</span>
          </div>
        </div>
        <p className="text-blue-100/80">Loading planner interface...</p>
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
        <h3 className="text-xl font-semibold text-white mb-2">Error Loading Data</h3>
        <p className="text-blue-100/70 mb-6">We couldn't load your wedding data. Please try again later.</p>
        <Button 
          className="w-full rounded-xl py-5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
          onClick={() => refetch()}
        >
          <RefreshCw size={18} className="mr-2" />
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
        className="max-w-7xl mx-auto relative z-10"
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
              Welcome, {name}
            </motion.h2>
            <motion.h1 
              className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Planner Dashboard
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
            
            <Button 
              variant="blue" 
              size="sm" 
              className="rounded-full gap-2"
              onClick={() => refetch()}
            >
              <RefreshCw size={16} className='text-white' />
              <span className='text-white'>Refresh</span>
            </Button>
          </motion.div>
        </motion.div>
        
        {/* Main dashboard layout - Sidebar and Content */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-6">
          {/* Weddings sidebar */}
          <div className="w-full md:w-72 lg:w-80 flex-shrink-0 space-y-4">
            <Card className="backdrop-blur-xl border border-white/10 shadow-xl rounded-3xl overflow-hidden"
              style={{
                background: `linear-gradient(135deg, rgba(42, 67, 101, 0.3) 0%, rgba(26, 41, 64, 0.4) 100%)`,
              }}
            >
              <CardHeader className="p-4 md:p-5">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Calendar size={18} className="text-blue-300" />
                  <span>Upcoming Weddings</span>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="p-0">
                <div className="space-y-1">
                  {weddings.map(wedding => {
                    const isSelected = wedding.id === selectedWeddingId;
                    const { daysRemaining } = getWeddingStats(wedding);
                    
                    return (
                      <button
                        key={wedding.id}
                        className={`w-full text-left p-4 md:p-5 transition-all ${
                          isSelected 
                            ? 'bg-white/10 border-l-4 border-blue-400' 
                            : 'hover:bg-white/5 border-l-4 border-transparent'
                        }`}
                        onClick={() => setSelectedWeddingId(wedding.id)}
                      >
                        <h3 className={`font-medium ${isSelected ? 'text-white' : 'text-blue-100/90'}`}>
                          {wedding.coupleName}
                        </h3>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-sm text-blue-100/70">
                            {new Date(wedding.date).toLocaleDateString('en-US', { 
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                          <Badge className={`rounded-full text-xs py-0.5 ${
                            daysRemaining <= 7
                              ? 'bg-red-500/20 text-red-300 border-red-500/30'
                              : daysRemaining <= 30
                                ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                                : 'bg-green-500/20 text-green-300 border-green-500/30'
                          }`}>
                            {formatRelativeDate(wedding.date)}
                          </Badge>
                        </div>
                        
                        {isSelected && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="flex items-center gap-2 mt-2 text-xs text-blue-100/70"
                          >
                            <span>${wedding.budget.toLocaleString()}</span>
                            <span>•</span>
                            <span>{wedding.tasks.length} tasks</span>
                            <span>•</span>
                            <span>{wedding.vendors.length} vendors</span>
                          </motion.div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            
            <Card className="backdrop-blur-xl border border-white/10 shadow-xl rounded-3xl overflow-hidden"
              style={{
                background: `linear-gradient(135deg, rgba(42, 67, 101, 0.3) 0%, rgba(26, 41, 64, 0.4) 100%)`,
              }}
            >
              <CardContent className="p-5">
                <h3 className="font-medium text-white mb-4">Quick Stats</h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-blue-100/70">Active Weddings</span>
                      <span className="text-blue-100">{weddings.length}</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="h-full rounded-full bg-blue-400"
                      ></motion.div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-blue-100/70">Upcoming this Month</span>
                      <span className="text-blue-100">
                        {weddings.filter(w => {
                          const date = new Date(w.date);
                          const now = new Date();
                          const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                          return diffDays <= 30;
                        }).length}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '50%' }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="h-full rounded-full bg-yellow-400"
                      ></motion.div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-blue-100/70">Task Completion</span>
                      <span className="text-blue-100">
                        {Math.round(
                          (weddings.flatMap(w => w.tasks).filter(t => t.completed).length / 
                          weddings.flatMap(w => w.tasks).length) * 100
                        )}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '75%' }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="h-full rounded-full bg-green-400"
                      ></motion.div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main content area */}
          <div className="flex-1">
            {selectedWedding ? (
              <Card className="backdrop-blur-xl border border-white/10 shadow-xl rounded-3xl overflow-hidden h-full"
                style={{
                  background: `linear-gradient(135deg, rgba(42, 67, 101, 0.3) 0%, rgba(26, 41, 64, 0.4) 100%)`,
                }}
              >
                {/* Wedding header */}
                <div className="p-5 md:p-6 border-b border-white/10">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-semibold text-white">{selectedWedding.coupleName}</h2>
                      <p className="text-blue-100/70 text-sm">{formatDate(selectedWedding.date)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 rounded-xl px-3 py-1">
                        ${selectedWedding.budget.toLocaleString()} Budget
                      </Badge>
                      <Badge className={`rounded-xl px-3 py-1 ${
                        getWeddingStats(selectedWedding).daysRemaining <= 7
                          ? 'bg-red-500/20 text-red-300 border-red-500/30'
                          : getWeddingStats(selectedWedding).daysRemaining <= 30
                            ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                            : 'bg-green-500/20 text-green-300 border-green-500/30'
                      }`}>
                        {getWeddingStats(selectedWedding).daysRemaining} days remaining
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {/* Tabs */}
                <Tabs defaultValue="overview" className="w-full">
                  <div className="px-5 md:px-6 border-b border-white/10">
                    <TabsList className="bg-transparent h-12 p-0 gap-1">
                      <TabsTrigger 
                        value="overview" 
                        className="rounded-lg text-sm h-10 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=inactive]:text-white"
                      >
                        Overview
                      </TabsTrigger>
                      <TabsTrigger 
                        value="tasks" 
                        className="rounded-lg text-sm h-10 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=inactive]:text-white"
                      >
                        Tasks
                      </TabsTrigger>
                      <TabsTrigger 
                        value="vendors" 
                        className="rounded-lg text-sm h-10 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=inactive]:text-white"
                      >
                        Vendors
                      </TabsTrigger>
                      <TabsTrigger 
                        value="chat" 
                        className="rounded-lg text-sm h-10 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=inactive]:text-white"
                      >
                        Chat
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  
                  {/* Overview Tab */}
                  <TabsContent value="overview" className="p-5 md:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <motion.div
                        whileHover={{ y: -5 }}
                        transition={{ duration: 0.2 }}
                        className="backdrop-blur-sm rounded-3xl border border-white/10 p-4 flex items-center gap-4"
                        style={{
                          background: `linear-gradient(135deg, rgba(46, 78, 143, 0.2) 0%, rgba(26, 58, 110, 0.2) 100%)`,
                        }}
                      >
                        <div className="p-3 rounded-xl bg-blue-500/20 border border-blue-500/30">
                          <Clock size={24} className="text-blue-300" />
                        </div>
                        <div>
                          <p className="text-sm text-blue-100/70">Days Remaining</p>
                          <p className="text-xl font-bold text-white">{getWeddingStats(selectedWedding).daysRemaining}</p>
                          <p className="text-xs text-blue-100/60">Wedding Day: {new Date(selectedWedding.date).toLocaleDateString()}</p>
                        </div>
                      </motion.div>
                      
                      <motion.div
                        whileHover={{ y: -5 }}
                        transition={{ duration: 0.2 }}
                        className="backdrop-blur-sm rounded-3xl border border-white/10 p-4 flex items-center gap-4"
                        style={{
                          background: `linear-gradient(135deg, rgba(46, 78, 143, 0.2) 0%, rgba(26, 58, 110, 0.2) 100%)`,
                        }}
                      >
                        <div className="p-3 rounded-xl bg-green-500/20 border border-green-500/30">
                          <CheckCircle size={24} className="text-green-300" />
                        </div>
                        <div>
                          <p className="text-sm text-blue-100/70">Task Progress</p>
                          <p className="text-xl font-bold text-white">{getWeddingStats(selectedWedding).completionPercentage}%</p>
                          <p className="text-xs text-blue-100/60">
                            {getWeddingStats(selectedWedding).completedTasks} of {getWeddingStats(selectedWedding).totalTasks} tasks completed
                          </p>
                        </div>
                      </motion.div>
                      
                      <motion.div
                        whileHover={{ y: -5 }}
                        transition={{ duration: 0.2 }}
                        className="backdrop-blur-sm rounded-3xl border border-white/10 p-4 flex items-center gap-4"
                        style={{
                          background: `linear-gradient(135deg, rgba(46, 78, 143, 0.2) 0%, rgba(26, 58, 110, 0.2) 100%)`,
                        }}
                      >
                        <div className="p-3 rounded-xl bg-yellow-500/20 border border-yellow-500/30">
                          <CircleDollarSign size={24} className="text-yellow-300" />
                        </div>
                        <div>
                          <p className="text-sm text-blue-100/70">Budget</p>
                          <p className="text-xl font-bold text-white">${selectedWedding.budget.toLocaleString()}</p>
                          <p className="text-xs text-blue-100/60">Total allocated budget</p>
                        </div>
                      </motion.div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-white">Recent Tasks</h3>
                        
                        <div className="space-y-2">
                          {selectedWedding.tasks.slice(0, 3).map((task) => (
                            <div 
                              key={task.id}
                              className="backdrop-blur-sm rounded-xl border border-white/10 p-3 flex items-center gap-3"
                              style={{
                                background: `linear-gradient(135deg, rgba(46, 78, 143, 0.1) 0%, rgba(26, 58, 110, 0.1) 100%)`,
                              }}
                            >
                              <button
                                onClick={() => toggleTaskCompletion(task.id)}
                                className={`rounded-full p-1 transition-colors ${
                                  task.completed 
                                    ? 'bg-green-500/20 text-green-400' 
                                    : 'bg-blue-500/20 text-blue-400'
                                }`}
                              >
                                {task.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                              </button>
                              <span className={`text-sm ${
                                task.completed ? 'text-blue-100/50 line-through' : 'text-blue-100/90'
                              }`}>
                                {task.description}
                              </span>
                            </div>
                          ))}
                        </div>
                        
                        <Button 
                          variant="outline" 
                          className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white w-full"
                        >
                          View All Tasks
                        </Button>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-white">Booked Vendors</h3>
                        
                        <div className="space-y-2">
                          {selectedWedding.vendors.slice(0, 3).map((vendor) => (
                            <div 
                              key={vendor.id}
                              className="backdrop-blur-sm rounded-xl border border-white/10 p-3 flex items-center gap-3"
                              style={{
                                background: `linear-gradient(135deg, rgba(46, 78, 143, 0.1) 0%, rgba(26, 58, 110, 0.1) 100%)`,
                              }}
                            >
                              <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                                <Store size={18} />
                              </div>
                              <div className="flex-1">
                                <span className="text-sm text-blue-100/90">{vendor.name}</span>
                                <p className="text-xs text-blue-100/60 capitalize">{vendor.category}</p>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon-sm" 
                                className="rounded-full text-blue-100/60 hover:text-white hover:bg-white/10"
                              >
                                <MoreHorizontal size={16} />
                              </Button>
                            </div>
                          ))}
                        </div>
                        
                        <Button 
                          variant="outline" 
                          className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white w-full"
                        >
                          View All Vendors
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                  
                  {/* Tasks Tab */}
                  <TabsContent value="tasks" className="p-5 md:p-6">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-white">Wedding Tasks</h3>
                        <Button 
                          variant="blue" 
                          size="sm" 
                          className="rounded-xl gap-2"
                        >
                          <Plus size={16} />
                          <span>Add Task</span>
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        {selectedWedding.tasks.map((task) => (
                          <div 
                            key={task.id}
                            className="backdrop-blur-sm rounded-xl border border-white/10 p-4 flex items-center gap-3"
                            style={{
                              background: `linear-gradient(135deg, rgba(46, 78, 143, 0.1) 0%, rgba(26, 58, 110, 0.1) 100%)`,
                            }}
                          >
                            <button
                              onClick={() => toggleTaskCompletion(task.id)}
                              className={`rounded-full p-1.5 transition-colors ${
                                task.completed 
                                  ? 'bg-green-500/20 text-green-400' 
                                  : 'bg-blue-500/20 text-blue-400'
                              }`}
                            >
                              {task.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                            </button>
                            <div className="flex-1">
                              <span className={`text-base ${
                                task.completed ? 'text-blue-100/50 line-through' : 'text-blue-100/90'
                              }`}>
                                {task.description}
                              </span>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon-sm" 
                              className="rounded-full text-blue-100/60 hover:text-white hover:bg-white/10"
                            >
                              <MoreHorizontal size={16} />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  
                  {/* Vendors Tab */}
                  <TabsContent value="vendors" className="p-5 md:p-6">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-white">Booked Vendors</h3>
                        <Button 
                          variant="blue" 
                          size="sm" 
                          className="rounded-xl gap-2"
                        >
                          <Plus size={16} />
                          <span>Add Vendor</span>
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedWedding.vendors.map((vendor) => (
                          <motion.div 
                            key={vendor.id}
                            whileHover={{ y: -5 }}
                            transition={{ duration: 0.2 }}
                            className="backdrop-blur-sm rounded-xl border border-white/10 p-4"
                            style={{
                              background: `linear-gradient(135deg, rgba(46, 78, 143, 0.2) 0%, rgba(26, 58, 110, 0.2) 100%)`,
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div className="p-2.5 rounded-xl bg-purple-500/20 border border-purple-500/30">
                                <Store size={24} className="text-purple-300" />
                              </div>
                              <div className="flex-1">
                                <h4 className="text-white font-medium">{vendor.name}</h4>
                                <Badge className="mt-1 bg-blue-500/20 text-blue-300 border-blue-500/30 rounded-full capitalize">
                                  {vendor.category}
                                </Badge>
                                <div className="mt-3 flex gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="rounded-lg border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white text-xs"
                                  >
                                    View Details
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="rounded-lg text-blue-300 hover:text-blue-200 hover:bg-blue-500/10 text-xs"
                                  >
                                    <MessageCircle size={14} className="mr-1" />
                                    Contact
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  
                  {/* Chat Tab */}
                  <TabsContent value="chat" className="flex flex-col h-[calc(100vh-16rem)] md:h-[calc(100vh-18rem)]">
                    {/* Chat messages */}
                    <div 
                      ref={chatContainerRef}
                      className="flex-1 overflow-y-auto p-5 md:p-6 space-y-4"
                    >
                      {messages.length === 0 ? (
                        <div className="h-full flex items-center justify-center">
                          <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 mb-4">
                              <MessageCircle size={32} className="text-blue-300" />
                            </div>
                            <h3 className="text-lg font-medium text-white mb-2">No Messages Yet</h3>
                            <p className="text-blue-100/70 max-w-md">
                              Start the conversation with the couple to discuss wedding plans.
                            </p>
                          </div>
                        </div>
                      ) : (
                        messages.map((msg, index) => (
                          <div 
                            key={index}
                            className={`flex ${msg.sender === 'Planner' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[75%] ${
                              msg.sender === 'Planner'
                                ? 'bg-blue-600/30 rounded-t-xl rounded-l-xl'
                                : 'bg-white/10 rounded-t-xl rounded-r-xl'
                            } p-3 backdrop-blur-sm`}>
                              {msg.sender !== 'Planner' && (
                                <div className="flex items-center gap-1.5 mb-1">
                                  <div className="w-6 h-6 rounded-full bg-purple-500/30 flex items-center justify-center">
                                    <User size={12} className="text-purple-300" />
                                  </div>
                                  <span className="text-xs font-medium text-blue-100/80">{msg.sender}</span>
                                </div>
                              )}
                              <p className="text-blue-100/90 text-sm">{msg.content}</p>
                              <p className="text-right text-xs text-blue-100/50 mt-1">
                                {formatMessageTime(msg.timestamp)}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    
                    {/* Chat input */}
                    <div className="p-4 border-t border-white/10">
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          sendMessage();
                        }}
                        className="flex gap-2"
                      >
                        <Input
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Type your message..."
                          className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-blue-100/40 rounded-xl h-11 focus:border-blue-400/60 transition-all duration-300"
                        />
                        <Button 
                          type="submit"
                          className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 h-11 px-5"
                          disabled={!message.trim()}
                        >
                          <Send size={18} />
                        </Button>
                      </form>
                    </div>
                  </TabsContent>
                </Tabs>
              </Card>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 mb-4">
                    <Calendar size={32} className="text-blue-300" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">No Wedding Selected</h3>
                  <p className="text-blue-100/70 max-w-md">
                    Select a wedding from the sidebar to view details and manage plans.
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

// For the Circle component used in TaskItem
function Circle(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

export default PlannerInterface;
