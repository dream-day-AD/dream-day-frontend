import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'planner' | 'client';
  isActive: boolean;
}

interface SystemStats {
  activeUsers: number;
  totalWeddings: number;
  systemUptime: string;
}

// Mock data for frontend-only testing
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    isActive: true,
  },
  {
    id: '2',
    name: 'Planner Jane',
    email: 'jane@example.com',
    role: 'planner',
    isActive: true,
  },
  {
    id: '3',
    name: 'Client John',
    email: 'john@example.com',
    role: 'client',
    isActive: false,
  },
];

const mockStats: SystemStats = {
  activeUsers: 25,
  totalWeddings: 50,
  systemUptime: '99.9%',
};

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const { role } = useSelector((state: RootState) => state.auth);

  // Fetch users (mock data for now)
  const {
    data: users = mockUsers,
    isLoading: usersLoading,
    error: usersError,
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
  } = useQuery<SystemStats>({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const response = await api.get('/admin/stats');
      return response.data;
    },
    enabled: false, // Disable until backend is ready
  });

  // Toggle user status mutation (mock for now)
  const toggleUserStatusMutation = useMutation({
    mutationFn: (user: User) =>
      api.patch(`/admin/users/${user.id}`, { isActive: !user.isActive }),
    onSuccess: (_, user) => {
      queryClient.setQueryData(['admin-users'], (old: User[] | undefined) =>
        old?.map((u) =>
          u.id === user.id ? { ...u, isActive: !u.isActive } : u
        )
      );
      toast.success(`${user.name} status updated!`);
    },
    onError: () => toast.error('Failed to update user status.'),
  });

  if (role !== 'admin')
    return (
      <div className="p-6 text-center">Access restricted to admins only.</div>
    );
  if (usersLoading || statsLoading)
    return <div className="p-6 text-center">Loading admin dashboard...</div>;
  if (usersError || statsError)
    return (
      <div className="p-6 text-center text-red-500">
        Error loading admin dashboard
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      <Toaster richColors position="top-right" />
      <h2 className="text-2xl font-semibold">Admin Dashboard</h2>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-[var(--card-bg)] border-none">
          <CardHeader>
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      <Switch
                        checked={user.isActive}
                        onCheckedChange={() =>
                          toggleUserStatusMutation.mutate(user)
                        }
                        disabled={toggleUserStatusMutation.isPending}
                      />
                    </TableCell>
                    <TableCell>
                      <Button variant="destructive" size="sm">
                        Delete
                      </Button>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="bg-[var(--card-bg)] border-none">
          <CardHeader>
            <CardTitle>System Monitoring</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Active Users: {stats.activeUsers}</p>
            <p>Total Weddings: {stats.totalWeddings}</p>
            <p>System Uptime: {stats.systemUptime}</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
