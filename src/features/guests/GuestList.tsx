import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import Papa from 'papaparse';
import { 
  MoreHorizontal, 
  UserPlus, 
  Users, 
  Search, 
  Upload, 
  Check, 
  X, 
  HelpCircle, 
  Clock, 
  FileText,
  Edit,
  Trash2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Guest {
  id: number;
  name: string;
  email: string;
  rsvp: 'yes' | 'no' | 'maybe' | 'pending';
  mealPreference: 'vegetarian' | 'non-vegetarian' | 'vegan' | 'none';
  seating: string;
}

interface CSVGuestRow {
  name?: string;
  email?: string;
  rsvp?: string;
  mealPreference?: string;
  seating?: string;
}

const GuestList = () => {
  // Dark blue color palette variables
  const colors = {
    darkBlue1: '#0A1929', // Darkest blue
    darkBlue2: '#11294D', // Dark blue
    darkBlue3: '#1A3A6E', // Medium blue
    darkBlue4: '#2E4E8F', // Lighter accent blue
    lightAccent: '#4C9FE6', // Light blue accent
  };

  const [newGuest, setNewGuest] = useState({ name: '', email: '' });
  const [editingSeatingId, setEditingSeatingId] = useState<number | null>(null);
  const [seatingValue, setSeatingValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [csvUploading, setCsvUploading] = useState(false);
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

  const rowVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0, 
      x: 10,
      transition: { duration: 0.2 } 
    }
  };
  const {
    data: guests = [],
    isLoading,
    error,
  } = useQuery<Guest[]>({
    queryKey: ['guests'],
    queryFn: async () => {
      const response = await api.get('/guests');
      return response.data;
    },
  });

  const addGuestMutation = useMutation({
    mutationFn: (guest: { name: string; email: string }) =>
      api.post('/guests', {
        ...guest,
        rsvp: 'pending',
        mealPreference: 'none',
        seating: '',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      toast.success('Guest added successfully!', {
        description: 'Your new guest has been added to the list.',
        icon: <Check className="h-5 w-5 text-green-500" />,
      });
      setNewGuest({ name: '', email: '' });
    },
    onError: () => toast.error('Failed to add guest.', {
      description: 'Please check the information and try again.',
      icon: <X className="h-5 w-5 text-red-500" />,
    }),
  });

  const updateRSVPMutation = useMutation({
    mutationFn: ({ id, rsvp }: { id: number; rsvp: Guest['rsvp'] }) =>
      api.patch(`/guests/${id}`, { rsvp }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      toast.success('RSVP status updated', {
        description: 'The guest\'s RSVP has been successfully updated.',
      });
    },
    onError: () => toast.error('Failed to update RSVP.', {
      description: 'Please try again or check your connection.',
    }),
  });

  const updateMealMutation = useMutation({
    mutationFn: ({ id, mealPreference }: { id: number; mealPreference: Guest['mealPreference'] }) =>
      api.patch(`/guests/${id}`, { mealPreference }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      toast.success('Meal preference updated', {
        description: 'The guest\'s meal preference has been updated.',
      });
    },
    onError: () => toast.error('Failed to update meal preference.', {
      description: 'Please try again or check your connection.',
    }),
  });

  const updateSeatingMutation = useMutation({
    mutationFn: ({ id, seating }: { id: number; seating: string }) =>
      api.patch(`/guests/${id}`, { seating }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      toast.success('Seating assignment updated!', {
        description: 'The guest\'s seating has been successfully updated.',
      });
      setEditingSeatingId(null);
    },
    onError: () => toast.error('Failed to update seating.', {
      description: 'Please try again or check your connection.',
    }),
  });

  const deleteGuestMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/guests/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      toast.success('Guest removed successfully!', {
        description: 'The guest has been removed from your list.',
      });
    },
    onError: () => toast.error('Failed to remove guest.', {
      description: 'Please try again or check your connection.',
    }),
  });

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvUploading(true);
    
    Papa.parse<CSVGuestRow>(file, {
      header: true,
      complete: (result) => {
        const importedGuests = result.data
          .map((row) => ({
            name: row.name || '',
            email: row.email || '',
            rsvp: (row.rsvp as Guest['rsvp']) || 'pending',
            mealPreference: (row.mealPreference as Guest['mealPreference']) || 'none',
            seating: row.seating || '',
          }))
          .filter((g) => g.name && g.email);

        if (importedGuests.length === 0) {
          toast.error('No valid guests found in CSV', {
            description: 'Please check your CSV format and try again.',
            icon: <X className="h-5 w-5 text-red-500" />,
          });
          setCsvUploading(false);
          return;
        }

        toast.success(`Importing ${importedGuests.length} guests...`, {
          description: 'This may take a moment for large lists.',
          icon: <Upload className="h-5 w-5 text-blue-500" />,
        });
        
        // Import guests sequentially to avoid overwhelming the API
        const importSequentially = async () => {
          for (const guest of importedGuests) {
            await addGuestMutation.mutateAsync(guest);
          }
          toast.success(`${importedGuests.length} guests imported successfully!`, {
            description: 'All guests from your CSV file have been added.',
            icon: <Check className="h-5 w-5 text-green-500" />,
          });
          setCsvUploading(false);
        };
        
        importSequentially().catch(() => {
          toast.error('Failed to import all guests', {
            description: 'Some guests may not have been imported correctly.',
            icon: <X className="h-5 w-5 text-red-500" />,
          });
          setCsvUploading(false);
        });
      },
      error: () => {
        toast.error('Failed to import CSV.', {
          description: 'Please check your file format and try again.',
          icon: <X className="h-5 w-5 text-red-500" />,
        });
        setCsvUploading(false);
      },
    });
    
    // Clear the input value so the same file can be selected again
    e.target.value = '';
  };

  const handleAddGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGuest.name && newGuest.email) addGuestMutation.mutate(newGuest);
  };

  const handleUpdateSeating = (id: number) => {
    if (seatingValue.trim()) {
      updateSeatingMutation.mutate({ id, seating: seatingValue });
    }
  };
  // Calculate RSVP counts for statistics
  const rsvpCounts = {
    yes: guests.filter((g) => g.rsvp === 'yes').length,
    no: guests.filter((g) => g.rsvp === 'no').length,
    maybe: guests.filter((g) => g.rsvp === 'maybe').length,
    pending: guests.filter((g) => g.rsvp === 'pending').length,
  };

  // Calculate meal preference counts
  const mealCounts = {
    vegetarian: guests.filter((g) => g.mealPreference === 'vegetarian').length,
    'non-vegetarian': guests.filter((g) => g.mealPreference === 'non-vegetarian').length,
    vegan: guests.filter((g) => g.mealPreference === 'vegan').length,
    none: guests.filter((g) => g.mealPreference === 'none').length,
  };

  // Filter guests based on search query
  const filteredGuests = guests.filter(
    (guest) =>
      guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Define badge styles for RSVP statuses
  const rsvpBadgeStyles = {
    yes: {
      bg: 'bg-green-500/20',
      text: 'text-green-300',
      border: 'border-green-500/30',
      icon: <Check size={14} className='text-white' />
    },
    no: {
      bg: 'bg-red-500/20',
      text: 'text-red-300',
      border: 'border-red-500/30',
      icon: <X size={14} className='text-white' />
    },
    maybe: {
      bg: 'bg-yellow-500/20',
      text: 'text-yellow-300',
      border: 'border-yellow-500/30',
      icon: <HelpCircle size={14} className='text-white' />
    },
    pending: {
      bg: 'bg-blue-500/20',
      text: 'text-blue-300',
      border: 'border-blue-500/30',
      icon: <Clock size={14} className='text-white' />
    }
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
            <span className="text-blue-400 text-2xl">G</span>
          </div>
        </div>
        <p className="text-blue-100/80">Loading your guest list...</p>
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
        <h3 className="text-xl font-semibold text-white mb-2">Error Loading Guest List</h3>
        <p className="text-blue-100/70 mb-6">We couldn't load your guest data. Please try again later.</p>
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
                Guest Management
              </motion.h1>
            </div>
            
            <motion.div 
              variants={itemVariants}
              className="flex gap-3 items-center"
            >
              <div className="bg-white/5 backdrop-blur-sm rounded-full px-3 py-1 border border-white/10 text-blue-100/90 text-sm flex items-center gap-2">
                <Users size={16} className="text-blue-300" />
                <span>Total Guests: {guests.length}</span>
              </div>
              
              <Button variant="blue" size="sm" className="rounded-full gap-2">
                <FileText size={16} className='text-white' />
                <span className='text-white'>Export List</span>
              </Button>
            </motion.div>
          </motion.div>
          
          {/* RSVP Stats */}
          <motion.div variants={itemVariants}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {Object.entries(rsvpCounts).map(([status, count]) => {
                const { bg, text, border, icon } = rsvpBadgeStyles[status as keyof typeof rsvpBadgeStyles];
                return (
                  <motion.div
                    key={status}
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.2 }}
                    className="backdrop-blur-lg rounded-3xl border border-white/10 p-4 flex items-center gap-4"
                    style={{
                      background: `linear-gradient(135deg, rgba(46, 78, 143, 0.2) 0%, rgba(26, 58, 110, 0.2) 100%)`,
                    }}
                  >
                    <div className={`p-3 rounded-2xl ${bg} border ${border}`}>
                      {icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-medium capitalize">{status}</h3>
                      <p className="text-xl font-semibold text-blue-100/90">{count}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Guest List Card */}
          <motion.div variants={itemVariants}>
            <Card className="backdrop-blur-xl border border-white/10 shadow-xl rounded-3xl overflow-hidden"
              style={{
                background: `linear-gradient(135deg, rgba(42, 67, 101, 0.3) 0%, rgba(26, 41, 64, 0.4) 100%)`,
              }}
            >
              <CardHeader className="p-6 pb-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <CardTitle className="text-xl text-white flex items-center gap-2">
                    <Users size={20} className="text-blue-300" />
                    <span>Your Guest List</span>
                  </CardTitle>
                  
                  <div className="relative">
                    <div className="flex items-center bg-white/5 rounded-xl px-3 py-1 border border-white/10">
                      <Search size={18} className="text-blue-100/50 mr-2" />
                      <Input
                        placeholder="Search guests..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="border-0 bg-transparent text-white placeholder:text-blue-100/40 focus-visible:ring-0 focus-visible:ring-offset-0 h-9"
                        aria-label="Search guests"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                {/* Add guest form */}
                <form
                  onSubmit={handleAddGuest}
                  className="mb-8 p-4 rounded-xl bg-white/5 border border-white/10"
                >
                  <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                    <UserPlus size={16} className="text-blue-300" />
                    Add New Guest
                  </h3>
                  
                  <div className="flex flex-col sm:flex-row gap-3 mb-3">
                    <Input
                      placeholder="Guest Name"
                      value={newGuest.name}
                      onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
                      className="bg-white/5 border-white/10 text-white placeholder:text-blue-100/40 rounded-xl focus:border-blue-400/60 transition-all duration-300"
                      aria-label="Guest name"
                    />
                    
                    <Input
                      placeholder="Email Address"
                      value={newGuest.email}
                      onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
                      className="bg-white/5 border-white/10 text-white placeholder:text-blue-100/40 rounded-xl focus:border-blue-400/60 transition-all duration-300"
                      aria-label="Guest email"
                    />
                    
                    <Button 
                      type="submit" 
                      disabled={addGuestMutation.isPending || !newGuest.name || !newGuest.email}
                      className="sm:w-auto w-full rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium shadow-lg shadow-blue-500/20 transition-all duration-300"
                    >
                      {addGuestMutation.isPending ? (
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
                          <UserPlus size={18} />
                          <span>Add Guest</span>
                        </div>
                      )}
                    </Button>
                  </div>
                  
                  <div className="flex items-center mt-5">
                    <div className="border-t border-white/10 flex-grow"></div>
                    <p className="text-blue-100/50 text-xs mx-3">or import from file</p>
                    <div className="border-t border-white/10 flex-grow"></div>
                  </div>
                  
                  <div className="mt-4">
                    <label 
                      htmlFor="csv-upload"
                      className="flex items-center justify-center gap-2 py-2 px-4 border border-white/10 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer text-blue-100/90"
                    >
                      <Upload size={16} className="text-blue-300" />
                      <span>Import CSV File</span>
                    </label>
                    <Input
                      id="csv-upload"
                      type="file"
                      accept=".csv"
                      onChange={handleCSVImport}
                      className="hidden"
                      aria-label="Upload CSV file"
                      disabled={csvUploading}
                    />
                    <p className="text-xs text-blue-100/50 mt-2">
                      CSV Format: name, email, rsvp, mealPreference, seating
                    </p>
                  </div>
                </form>
                
                {/* Guest table */}
                {filteredGuests.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-10"
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 mb-4">
                      <Users size={32} className="text-blue-300" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">No guests found</h3>
                    <p className="text-blue-100/70 max-w-md mx-auto">
                      {searchQuery 
                        ? "No guests match your search criteria. Try a different search term."
                        : "Add your first guest to start building your wedding guest list!"}
                    </p>
                  </motion.div>
                ) : (
                  <div className="rounded-xl overflow-hidden border border-white/10">
                    <Table>
                      <TableHeader className="bg-white/5">
                        <TableRow className="hover:bg-white/5 border-white/10">
                          <TableHead className="text-blue-100/70 font-medium">Name</TableHead>
                          <TableHead className="text-blue-100/70 font-medium">Email</TableHead>
                          <TableHead className="text-blue-100/70 font-medium">RSVP</TableHead>
                          <TableHead className="text-blue-100/70 font-medium">Meal Preference</TableHead>
                          <TableHead className="text-blue-100/70 font-medium">Seating</TableHead>
                          <TableHead className="text-blue-100/70 font-medium">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <AnimatePresence>
                          {filteredGuests.map((guest) => {
                            const { bg, text, icon } = rsvpBadgeStyles[guest.rsvp];
                            return (
                              <motion.tr
                                key={guest.id}
                                variants={rowVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="border-white/5 hover:bg-white/5 transition-colors"
                              >
                                <TableCell className="font-medium text-white">{guest.name}</TableCell>
                                <TableCell className="text-blue-100/80">{guest.email}</TableCell>
                                <TableCell>
                                  <Select
                                    value={guest.rsvp}
                                    onValueChange={(value) =>
                                      updateRSVPMutation.mutate({ id: guest.id, rsvp: value as Guest['rsvp'] })
                                    }
                                  >
                                    <SelectTrigger 
                                      className={`w-32 ${bg} ${text} border-white/10 rounded-xl focus:ring-0`} 
                                      aria-label={`RSVP for ${guest.name}`}
                                    >
                                      <div className="flex items-center gap-1.5">
                                        {icon}
                                        <SelectValue />
                                      </div>
                                    </SelectTrigger>
                                    <SelectContent 
                                      className="rounded-xl backdrop-blur-md border border-white/10"
                                      style={{ background: 'linear-gradient(135deg, rgba(42, 67, 101, 0.9) 0%, rgba(26, 41, 64, 0.95) 100%)' }}
                                    >
                                      <SelectItem value="yes" className="text-green-300">Yes</SelectItem>
                                      <SelectItem value="no" className="text-red-300">No</SelectItem>
                                      <SelectItem value="maybe" className="text-yellow-300">Maybe</SelectItem>
                                      <SelectItem value="pending" className="text-blue-300">Pending</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell>
                                  <Select
                                    value={guest.mealPreference}
                                    onValueChange={(value) =>
                                      updateMealMutation.mutate({
                                        id: guest.id,
                                        mealPreference: value as Guest['mealPreference'],
                                      })
                                    }
                                  >
                                    <SelectTrigger 
                                      className="w-36 bg-white/5 border-white/10 text-white rounded-xl" 
                                      aria-label={`Meal preference for ${guest.name}`}
                                    >
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent 
                                      className="rounded-xl backdrop-blur-md border border-white/10"
                                      style={{ background: 'linear-gradient(135deg, rgba(42, 67, 101, 0.9) 0%, rgba(26, 41, 64, 0.95) 100%)' }}
                                    >
                                      <SelectItem value="vegetarian" className="text-green-300">Vegetarian</SelectItem>
                                      <SelectItem value="non-vegetarian" className="text-blue-300">Non-Vegetarian</SelectItem>
                                      <SelectItem value="vegan" className="text-purple-300">Vegan</SelectItem>
                                      <SelectItem value="none" className="text-blue-100/70">None</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell>
                                  {editingSeatingId === guest.id ? (
                                    <Input
                                      value={seatingValue}
                                      onChange={(e) => setSeatingValue(e.target.value)}
                                      onBlur={() => handleUpdateSeating(guest.id)}
                                      onKeyDown={(e) => e.key === 'Enter' && handleUpdateSeating(guest.id)}
                                      className="bg-white/10 border-white/20 text-white w-32 rounded-xl"
                                      autoFocus
                                      aria-label={`Edit seating for ${guest.name}`}
                                    />
                                  ) : (
                                    <div
                                      className="cursor-pointer hover:text-white flex items-center gap-1.5 py-1 px-2 bg-white/5 border border-white/10 rounded-lg w-fit"
                                      onClick={() => {
                                        setEditingSeatingId(guest.id);
                                        setSeatingValue(guest.seating);
                                      }}
                                    >
                                      <span>{guest.seating || 'Unassigned'}</span>
                                      <Edit size={14} className="text-blue-300" />
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button 
                                        variant="ghost" 
                                        size="icon-sm" 
                                        aria-label={`More actions for ${guest.name}`}
                                        className="rounded-full text-blue-100/60 hover:text-white hover:bg-white/10"
                                      >
                                        <MoreHorizontal size={16} />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent 
                                      className="rounded-xl backdrop-blur-md border border-white/10"
                                      style={{ background: 'linear-gradient(135deg, rgba(42, 67, 101, 0.9) 0%, rgba(26, 41, 64, 0.95) 100%)' }}
                                    >
                                      <DropdownMenuItem 
                                        onClick={() => deleteGuestMutation.mutate(guest.id)}
                                        className="text-red-300 focus:text-red-200 focus:bg-white/5 cursor-pointer"
                                      >
                                        <Trash2 size={14} className="mr-2" />
                                        Remove Guest
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </motion.tr>
                            );
                          })}
                        </AnimatePresence>
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
  );
};

export default GuestList;
