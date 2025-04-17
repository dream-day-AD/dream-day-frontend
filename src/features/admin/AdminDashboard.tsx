import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Edit, 
  Check, 
  X, 
  AlertTriangle, 
  BarChart3, 
  RefreshCw,
  Server,
  UserCheck,
  Heart,
  Activity,
  Search,
  Calendar,
  Filter,
  ChevronDown,
  LogOut
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'planner' | 'client';
  isActive: boolean;
  joinDate?: string;
  lastLogin?: string;
}

interface SystemStats {
  activeUsers: number;
  totalWeddings: number;
  totalUsers: number;
  clientUsers: number;
  plannerUsers: number;
  adminUsers: number;
  systemUptime: string;
  serverStatus: 'healthy' | 'warning' | 'critical';
  databaseStatus: 'healthy' | 'warning' | 'critical';
  lastBackup: string;
  storageUsed: string;
}

const AdminDashboard = () => {
  // Dark blue color palette variables
  const colors = {
    darkBlue1: '#0A1929', // Darkest blue
    darkBlue2: '#11294D', // Dark blue
    darkBlue3: '#1A3A6E', // Medium blue
    darkBlue4: '#2E4E8F', // Lighter accent blue
    lightAccent: '#4C9FE6', // Light blue accent
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'planner' | 'client'>('all');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const queryClient = useQueryClient();
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

  // Mock data for frontend-only testing
  const mockUsers: User[] = [
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@dreamday.com',
      role: 'admin',
      isActive: true,
      joinDate: '2023-01-15',
      lastLogin: '2023-04-16T08:45:12'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah@planperfect.com',
      role: 'planner',
      isActive: true,
      joinDate: '2023-02-10',
      lastLogin: '2023-04-15T14:22:33'
    },
    {
      id: '3',
      name: 'Michael Chen',
      email: 'michael@example.com',
      role: 'client',
      isActive: true,
      joinDate: '2023-03-05',
      lastLogin: '2023-04-12T09:15:45'
    },
    {
      id: '4',
      name: 'Jessica Parker',
      email: 'jessica@eventwise.com',
      role: 'planner',
      isActive: true,
      joinDate: '2023-01-25',
      lastLogin: '2023-04-16T11:34:22'
    },
    {
      id: '5',
      name: 'Robert Taylor',
      email: 'robert@example.com',
      role: 'client',
      isActive: false,
      joinDate: '2023-02-18',
      lastLogin: '2023-03-20T10:45:33'
    },
    {
      id: '6',
      name: 'Emily Thompson',
      email: 'emily@example.com',
      role: 'client',
      isActive: true,
      joinDate: '2023-03-22',
      lastLogin: '2023-04-14T16:12:05'
    },
    {
      id: '7',
      name: 'System Admin',
      email: 'sysadmin@dreamday.com',
      role: 'admin',
      isActive: true,
      joinDate: '2022-12-01',
      lastLogin: '2023-04-16T07:30:10'
    }
  ];

  const mockStats: SystemStats = {
    activeUsers: 145,
    totalWeddings: 72,
    totalUsers: 210,
    clientUsers: 175,
    plannerUsers: 30,
    adminUsers: 5,
    systemUptime: '99.97%',
    serverStatus: 'healthy',
    databaseStatus: 'healthy',
    lastBackup: '2023-04-16 03:00 AM',
    storageUsed: '64.5 GB / 100 GB'
  };

  // Fetch users (mock data for now)
  const {
    data: users = mockUsers,
    isLoading: usersLoading,
    error: usersError,
    refetch: refetchUsers
  } = useQuery<User[]>({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const response = await api.get('/admin/users');
      return response.data;
    },
    enabled: false, // Disable until backend is ready
  });

  // Fetch system stats (mock data for now)
  const {
    data: stats = mockStats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats
  } = useQuery<SystemStats>({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const response = await api.get('/admin/stats');
      return response.data;
    },
    enabled: false, // Disable until backend is ready
  });
  // Toggle user status mutation
  const toggleUserStatusMutation = useMutation({
    mutationFn: (user: User) =>
      api.patch(`/admin/users/${user.id}`, { isActive: !user.isActive }),
    onSuccess: (_, user) => {
      queryClient.setQueryData(['admin-users'], (old: User[] | undefined) =>
        old?.map((u) =>
          u.id === user.id ? { ...u, isActive: !u.isActive } : u
        )
      );
      toast.success(`User status updated`, {
        description: `${user.name} is now ${!user.isActive ? 'active' : 'inactive'}.`,
        icon: !user.isActive ? <Check className="h-5 w-5 text-green-500" /> : <X className="h-5 w-5 text-red-500" />,
      });
    },
    onError: () => toast.error('Failed to update user status', {
      description: 'Please try again or check your connection.',
      icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
    }),
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => api.delete(`/admin/users/${userId}`),
    onSuccess: (_, userId) => {
      queryClient.setQueryData(['admin-users'], (old: User[] | undefined) =>
        old?.filter((u) => u.id !== userId)
      );
      toast.success('User deleted successfully', {
        description: 'The user has been permanently removed from the system.',
        icon: <Check className="h-5 w-5 text-green-500" />,
      });
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    },
    onError: () => toast.error('Failed to delete user', {
      description: 'Please try again or check your connection.',
      icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
    }),
  });

  // Handle user deletion
  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      deleteUserMutation.mutate(userToDelete.id);
    }
  };

  // Filter users based on search term and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  // Get a count of active users by role
  const activeUsersByRole = {
    admin: users.filter(u => u.role === 'admin' && u.isActive).length,
    planner: users.filter(u => u.role === 'planner' && u.isActive).length,
    client: users.filter(u => u.role === 'client' && u.isActive).length,
  };

  // Format date from ISO string to readable format
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (role !== 'admin') return (
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
        <p className="text-blue-100/70 mb-6">This dashboard is only accessible to administrators.</p>
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
  
  if (usersLoading || statsLoading) return (
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
            <span className="text-blue-400 text-2xl">A</span>
          </div>
        </div>
        <p className="text-blue-100/80">Loading admin dashboard...</p>
      </motion.div>
    </div>
  );
  
  if (usersError || statsError) return (
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
        <h3 className="text-xl font-semibold text-white mb-2">Error Loading Dashboard</h3>
        <p className="text-blue-100/70 mb-6">We couldn't load the admin dashboard data. Please try again later.</p>
        <Button 
          className="w-full rounded-xl py-5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
          onClick={() => {
            refetchUsers();
            refetchStats();
          }}
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
              Welcome, {name}
            </motion.h2>
            <motion.h1 
              className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Admin Dashboard
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
              onClick={() => {
                refetchUsers();
                refetchStats();
                toast.success('Dashboard refreshed', {
                  description: 'All data has been updated to the latest values.'
                });
              }}
            >
              <RefreshCw size={16} className='text-white' />
              <span className='text-white'>Refresh Data</span>
            </Button>
          </motion.div>
        </motion.div>

        {/* System Stats Cards */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
              className="backdrop-blur-lg rounded-3xl border border-white/10 p-4 flex items-center gap-4"
              style={{
                background: `linear-gradient(135deg, rgba(46, 78, 143, 0.2) 0%, rgba(26, 58, 110, 0.2) 100%)`,
              }}
            >
              <div className="p-3 rounded-xl bg-blue-500/20 border border-blue-500/30">
                <UserCheck size={24} className="text-blue-300" />
              </div>
              <div>
                <p className="text-sm text-blue-100/70">Active Users</p>
                <p className="text-xl font-bold text-white">{stats.activeUsers}</p>
                <div className="flex gap-2 text-xs">
                  <span className="text-blue-200">{activeUsersByRole.admin} admins</span>
                  <span className="text-green-200">{activeUsersByRole.planner} planners</span>
                  <span className="text-yellow-200">{activeUsersByRole.client} clients</span>
                </div>
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
              <div className="p-3 rounded-xl bg-purple-500/20 border border-purple-500/30">
                <Heart size={24} className="text-purple-300" />
              </div>
              <div>
                <p className="text-sm text-blue-100/70">Active Weddings</p>
                <p className="text-xl font-bold text-white">{stats.totalWeddings}</p>
                <p className="text-xs text-blue-100/60">Currently being planned</p>
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
              <div className="p-3 rounded-xl bg-green-500/20 border border-green-500/30">
                <Server size={24} className="text-green-300" />
              </div>
              <div>
                <p className="text-sm text-blue-100/70">System Status</p>
                <p className="text-xl font-bold text-white">{stats.systemUptime}</p>
                <div className="flex gap-1 items-center">
                  <span className={`inline-block w-2 h-2 rounded-full ${
                    stats.serverStatus === 'healthy' ? 'bg-green-400' : 
                    stats.serverStatus === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                  }`}></span>
                  <span className="text-xs text-blue-100/60">All systems operational</span>
                </div>
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
              <div className="p-3 rounded-xl bg-yellow-500/20 border border-yellow-500/30">
                <Activity size={24} className="text-yellow-300" />
              </div>
              <div>
                <p className="text-sm text-blue-100/70">Storage</p>
                <p className="text-xl font-bold text-white">{stats.storageUsed}</p>
                <p className="text-xs text-blue-100/60">Last backup: {stats.lastBackup}</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
        
        {/* Main Content - User Management */}
        <motion.div variants={itemVariants}>
          <Card className="backdrop-blur-xl border border-white/10 shadow-xl rounded-3xl overflow-hidden"
            style={{
              background: `linear-gradient(135deg, rgba(42, 67, 101, 0.3) 0%, rgba(26, 41, 64, 0.4) 100%)`,
            }}
          >
            <CardHeader className="px-6 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <Users size={20} className="text-blue-300" />
                <span>User Management</span>
                <Badge className="ml-2 bg-blue-500/20 text-blue-300 border-blue-500/30 rounded-full">
                  {filteredUsers.length} users
                </Badge>
              </CardTitle>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-auto">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-100/50 h-4 w-4" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-blue-100/40 rounded-xl h-9 focus:border-blue-400/60 transition-all duration-300 w-full"
                  />
                </div>
                
                <div className="relative">
                  <Button 
                    variant="outline" 
                    className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white w-full sm:w-auto"
                    onClick={() => {}}
                  >
                    <Filter size={16} className="mr-1.5 text-blue-300" />
                    {filterRole === 'all' ? 'All Roles' : `${filterRole.charAt(0).toUpperCase() + filterRole.slice(1)}s`}
                    <ChevronDown size={16} className="ml-1.5" />
                  </Button>
                  <div className="absolute right-0 mt-1 w-40 rounded-xl overflow-hidden backdrop-blur-md border border-white/10 shadow-lg z-10 hidden">
                    {['all', 'admin', 'planner', 'client'].map((role) => (
                      <button
                        key={role}
                        className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                          filterRole === role 
                            ? 'bg-blue-500/20 text-white' 
                            : 'text-blue-100/80 hover:bg-white/5 hover:text-white'
                        }`}
                        onClick={() => setFilterRole(role as any)}
                      >
                        {role === 'all' ? 'All Roles' : `${role.charAt(0).toUpperCase() + role.slice(1)}s`}
                      </button>
                    ))}
                  </div>
                </div>
                
                <Button className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 gap-2">
                  <UserPlus size={16} />
                  <span>Add User</span>
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 mb-4">
                    <Users size={32} className="text-blue-300" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">No Users Found</h3>
                  <p className="text-blue-100/70 max-w-md mx-auto">
                    {searchTerm 
                      ? `No users match your search for "${searchTerm}". Try a different search term.`
                      : filterRole !== 'all'
                        ? `No ${filterRole} users found. Try a different filter.`
                        : "There are no users in the system."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-white/5 border-b border-white/10">
                      <TableRow className="hover:bg-transparent border-none">
                        <TableHead className="text-blue-100/70 font-medium">Name</TableHead>
                        <TableHead className="text-blue-100/70 font-medium">Email</TableHead>
                        <TableHead className="text-blue-100/70 font-medium">Role</TableHead>
                        <TableHead className="text-blue-100/70 font-medium">Status</TableHead>
                        <TableHead className="text-blue-100/70 font-medium">Joined</TableHead>
                        <TableHead className="text-blue-100/70 font-medium">Last Login</TableHead>
                        <TableHead className="text-blue-100/70 font-medium">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {filteredUsers.map((user) => (
                          <motion.tr
                            key={user.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.3 }}
                            className="border-white/5 hover:bg-white/5"
                          >
                            <TableCell className="font-medium text-white">{user.name}</TableCell>
                            <TableCell className="text-blue-100/80">{user.email}</TableCell>
                            <TableCell>
                              <Badge className={`
                                ${user.role === 'admin' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 
                                  user.role === 'planner' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 
                                  'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'} 
                                rounded-full text-xs py-1
                              `}>
                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={user.isActive}
                                  onCheckedChange={() => toggleUserStatusMutation.mutate(user)}
                                  disabled={toggleUserStatusMutation.isPending}
                                  className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-500"
                                />
                                <span className={`text-xs ${user.isActive ? 'text-green-300' : 'text-gray-400'}`}>
                                  {user.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-blue-100/70">
                              {user.joinDate ? new Date(user.joinDate).toLocaleDateString() : 'N/A'}
                            </TableCell>
                            <TableCell className="text-sm text-blue-100/70">
                              {formatDate(user.lastLogin)}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  className="rounded-full text-blue-100/60 hover:text-blue-300 hover:bg-white/10"
                                >
                                  <Edit size={16} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  className="rounded-full text-blue-100/60 hover:text-red-400 hover:bg-white/10"
                                  onClick={() => handleDeleteUser(user)}
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </div>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        
        {/* System Monitoring */}
        <motion.div variants={itemVariants}>
          <Card className="backdrop-blur-xl border border-white/10 shadow-xl rounded-3xl overflow-hidden"
            style={{
              background: `linear-gradient(135deg, rgba(42, 67, 101, 0.3) 0%, rgba(26, 41, 64, 0.4) 100%)`,
            }}
          >
            <CardHeader className="px-6 py-6">
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <BarChart3 size={20} className="text-blue-300" />
                <span>System Monitoring</span>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <h3 className="text-sm text-blue-100/70 mb-1">User Distribution</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-blue-100/90">Clients</span>
                      <span className="text-white">{stats.clientUsers}</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-yellow-400"
                        style={{ width: `${(stats.clientUsers / stats.totalUsers) * 100}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-blue-100/90">Planners</span>
                      <span className="text-white">{stats.plannerUsers}</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-green-400"
                        style={{ width: `${(stats.plannerUsers / stats.totalUsers) * 100}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-blue-100/90">Admins</span>
                      <span className="text-white">{stats.adminUsers}</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-blue-400"
                        style={{ width: `${(stats.adminUsers / stats.totalUsers) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <h3 className="text-sm text-blue-100/70 mb-1">Server Status</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-blue-100/90 text-sm">Uptime</span>
                      <Badge className="bg-green-500/20 text-green-300 border-green-500/30 rounded-full">
                        {stats.systemUptime}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-blue-100/90 text-sm">API Server</span>
                      <Badge className={`
                        ${stats.serverStatus === 'healthy' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 
                          stats.serverStatus === 'warning' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' : 
                          'bg-red-500/20 text-red-300 border-red-500/30'} 
                        rounded-full
                      `}>
                        {stats.serverStatus.charAt(0).toUpperCase() + stats.serverStatus.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-blue-100/90 text-sm">Database</span>
                      <Badge className={`
                        ${stats.databaseStatus === 'healthy' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 
                          stats.databaseStatus === 'warning' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' : 
                          'bg-red-500/20 text-red-300 border-red-500/30'} 
                        rounded-full
                      `}>
                        {stats.databaseStatus.charAt(0).toUpperCase() + stats.databaseStatus.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-blue-100/90 text-sm">Last Backup</span>
                      <span className="text-blue-100/70 text-sm">{stats.lastBackup}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <h3 className="text-sm text-blue-100/70 mb-1">Storage Usage</h3>
                  <p className="text-xl font-semibold text-white mb-1">{stats.storageUsed}</p>
                  
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-4">
                    <div 
                      className="h-full rounded-full bg-blue-400"
                      style={{ width: '64.5%' }} // Assuming 64.5GB / 100GB
                    ></div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full rounded-xl border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white gap-1.5"
                  >
                    <Server size={14} />
                    Database Management
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
      
      {/* Delete User Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent
          className="rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl p-0 overflow-hidden"
          style={{ background: `linear-gradient(135deg, rgba(42, 67, 101, 0.9) 0%, rgba(26, 41, 64, 0.95) 100%)` }}
        >
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-xl text-white">Confirm User Deletion</DialogTitle>
            <DialogDescription className="text-blue-100/70">
              This action cannot be undone. The user will be permanently removed from the system.
            </DialogDescription>
          </DialogHeader>
          
          {userToDelete && (
            <div className="p-6 pt-0 pb-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                    <Trash2 size={20} className="text-red-300" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{userToDelete.name}</h3>
                    <p className="text-blue-100/70 text-sm">{userToDelete.email}</p>
                    <div className="flex gap-2 items-center mt-1">
                      <Badge className={`
                        ${userToDelete.role === 'admin' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 
                          userToDelete.role === 'planner' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 
                          'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'} 
                        rounded-full text-xs py-0.5 px-1.5
                      `}>
                        {userToDelete.role}
                      </Badge>
                      <span className={`text-xs ${userToDelete.isActive ? 'text-green-300' : 'text-gray-400'}`}>
                        {userToDelete.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="p-6 pt-0 flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline"
              className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white flex-1"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              className="rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 flex-1"
              onClick={confirmDelete}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? (
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
                  <span>Deleting...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Trash2 size={16} />
                  <span>Delete User</span>
                </div>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
