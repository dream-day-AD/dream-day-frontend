import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { 
  Search, 
  MapPin, 
  Star, 
  Calendar, 
  DollarSign, 
  Filter, 
  ChevronDown, 
  X, 
  Check, 
  Building, 
  Camera, 
  Flower, 
  UtensilsCrossed, 
  Grid3X3, 
  Heart, 
  HeartOff, 
  AlignJustify,
  Grid,
  BookOpen,
  Loader2,
  AlertTriangle,
  Phone,
  CheckCircle
} from 'lucide-react';

interface Vendor {
  id: string;
  name: string;
  category: 'venue' | 'photographer' | 'florist' | 'caterer' | 'other';
  location: string;
  priceRange: string;
  rating: number;
  description: string;
  images: string[];
  contact?: string;
  features?: string[];
  availability?: string[];
  isFavorite?: boolean;
}

const categoryIcons = {
  venue: <Building size={18} />,
  photographer: <Camera size={18} />,
  florist: <Flower size={18} />,
  caterer: <UtensilsCrossed size={18} />,
  other: <Grid3X3 size={18} />
};

const getCategoryColor = (category: string) => {
  switch(category) {
    case 'venue': return { bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-500/30' };
    case 'photographer': return { bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-500/30' };
    case 'florist': return { bg: 'bg-green-500/20', text: 'text-green-300', border: 'border-green-500/30' };
    case 'caterer': return { bg: 'bg-yellow-500/20', text: 'text-yellow-300', border: 'border-yellow-500/30' };
    default: return { bg: 'bg-gray-500/20', text: 'text-gray-300', border: 'border-gray-500/30' };
  }
};
const VendorCatalog = () => {
  // Dark blue color palette variables
  const colors = {
    darkBlue1: '#0A1929', // Darkest blue
    darkBlue2: '#11294D', // Dark blue
    darkBlue3: '#1A3A6E', // Medium blue
    darkBlue4: '#2E4E8F', // Lighter accent blue
    lightAccent: '#4C9FE6', // Light blue accent
  };

  // State variables for filtering and display
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterLocation, setFilterLocation] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [minRating, setMinRating] = useState<string>('0');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
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

  // Mock data for demo purposes
  const mockVendors: Vendor[] = [
    {
      id: '1',
      name: 'Sunset Gardens Resort',
      category: 'venue',
      location: 'San Francisco, CA',
      priceRange: '$$$',
      rating: 4.8,
      description: 'A beautiful garden venue with stunning sunset views, perfect for outdoor ceremonies and receptions. Features include a spacious pavilion, lush gardens, and excellent catering options.',
      images: [
        'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=798&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=869&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1507504031003-b417219a0fde?q=80&w=870&auto=format&fit=crop',
      ],
      contact: '(555) 123-4567',
      features: ['Outdoor ceremony space', 'Indoor reception hall', 'On-site catering', 'Parking available'],
      availability: ['2025-05-15', '2025-06-22', '2025-07-10'],
      isFavorite: true
    },
    {
      id: '2',
      name: 'Emma Chen Photography',
      category: 'photographer',
      location: 'New York, NY',
      priceRange: '$$',
      rating: 4.9,
      description: 'Award-winning wedding photographer with over 10 years of experience capturing beautiful moments with a mix of traditional and photojournalistic styles.',
      images: [
        'https://images.unsplash.com/photo-1537633552985-df8429e8048b?q=80&w=870&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1525038479321-95a0d5a379d0?q=80&w=1035&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1484156818044-35e2699e1960?q=80&w=870&auto=format&fit=crop',
      ],
      contact: '(555) 234-5678',
      features: ['Full day coverage', 'Second shooter available', 'Digital and print options', 'Engagement sessions'],
      availability: ['2025-04-25', '2025-05-08', '2025-06-12'],
      isFavorite: false
    },
    {
      id: '3',
      name: 'Blooming Elegance',
      category: 'florist',
      location: 'Chicago, IL',
      priceRange: '$$',
      rating: 4.7,
      description: 'Specialized in creating lush, romantic floral arrangements for weddings. We work with seasonal blooms and can accommodate any style from modern to classic.',
      images: [
        'https://images.unsplash.com/photo-1527061011048-533a21f98d8d?q=80&w=773&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1612006564629-6ed7162d5dea?q=80&w=1035&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1604764963175-b51c2d3f43a5?q=80&w=869&auto=format&fit=crop',
      ],
      contact: '(555) 345-6789',
      features: ['Bouquets', 'Centerpieces', 'Ceremony decor', 'Sustainable options'],
      availability: ['Available year-round'],
      isFavorite: true
    },
    {
      id: '4',
      name: 'Gourmet Celebrations',
      category: 'caterer',
      location: 'Los Angeles, CA',
      priceRange: '$$$',
      rating: 4.6,
      description: 'Farm-to-table catering service specializing in gourmet cuisine for weddings and special events. Customizable menus to suit your taste and dietary needs.',
      images: [
        'https://images.unsplash.com/photo-1529543544282-cdab85927e1b?q=80&w=870&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=870&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?q=80&w=870&auto=format&fit=crop',
      ],
      contact: '(555) 456-7890',
      features: ['Custom menus', 'Dietary accommodations', 'Staff included', 'Bar service'],
      availability: ['2025-04-20', '2025-05-05', '2025-06-18'],
      isFavorite: false
    },
  ];

  // Fetch vendors with filters
  const {
    data: vendors = mockVendors, // Using mock data for demo
    isLoading,
    error,
    refetch,
  } = useQuery<Vendor[]>({
    queryKey: ['vendors', filterCategory, filterLocation, priceRange, minRating],
    queryFn: async () => {
      const response = await api.get('/vendors', {
        params: {
          category: filterCategory === 'all' ? undefined : filterCategory,
          location: filterLocation || undefined,
          priceRange: priceRange === 'all' ? undefined : priceRange,
          minRating: minRating === '0' ? undefined : minRating,
        },
      });
      return response.data;
    },
    enabled: false, // Disabled for demo purposes
  });
  // Book vendor mutation
  const bookVendorMutation = useMutation({
    mutationFn: (vendorId: string) => api.post('/bookings', { vendorId }),
    onSuccess: () => {
      toast.success('Booking request sent successfully!', {
        description: 'The vendor will contact you soon to confirm details.',
        icon: <Check className="h-5 w-5 text-green-500" />,
      });
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      setSelectedVendor(null);
    },
    onError: () => toast.error('Failed to send booking request.', {
      description: 'Please try again or contact support for assistance.',
      icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
    }),
  });

  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: ({ id, isFavorite }: { id: string; isFavorite: boolean }) => 
      api.patch(`/vendors/${id}/favorite`, { isFavorite }),
    onSuccess: (_, variables) => {
      queryClient.setQueryData(['vendors'], (old: Vendor[] | undefined) => 
        old?.map(vendor => 
          vendor.id === variables.id 
            ? { ...vendor, isFavorite: variables.isFavorite }
            : vendor
        )
      );
      
      if (variables.isFavorite) {
        toast.success('Added to favorites!', {
          description: 'Vendor has been added to your favorites list.',
          icon: <Heart className="h-5 w-5 text-red-500" />,
        });
      } else {
        toast('Removed from favorites', {
          description: 'Vendor has been removed from your favorites list.',
          icon: <HeartOff className="h-5 w-5 text-gray-500" />,
        });
      }
    },
    onError: () => toast.error('Failed to update favorites.', {
      description: 'Please try again or refresh the page.',
      icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
    }),
  });

  // Filter vendors based on all criteria
  const filteredVendors = vendors.filter(vendor => {
    // Filter by search query
    const matchesSearch = 
      vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by category
    const matchesCategory = filterCategory === 'all' || vendor.category === filterCategory;
    
    // Filter by location
    const matchesLocation = 
      !filterLocation || 
      vendor.location.toLowerCase().includes(filterLocation.toLowerCase());
    
    // Filter by price range
    const matchesPriceRange = 
      priceRange === 'all' || 
      (priceRange === '$' && vendor.priceRange === '$') ||
      (priceRange === '$$' && vendor.priceRange === '$$') ||
      (priceRange === '$$$' && vendor.priceRange === '$$$') ||
      (priceRange === '$$$$' && vendor.priceRange === '$$$$');
    
    // Filter by minimum rating
    const matchesRating = vendor.rating >= Number(minRating);
    
    return matchesSearch && matchesCategory && matchesLocation && matchesPriceRange && matchesRating;
  });

  // Reset all filters
  const resetFilters = () => {
    setFilterCategory('all');
    setFilterLocation('');
    setSearchQuery('');
    setPriceRange('all');
    setMinRating('0');
    setIsFilterPanelOpen(false);
  };

  // Format price range for display
  const formatPriceRange = (range: string) => {
    switch(range) {
      case '$': return 'Budget';
      case '$$': return 'Moderate';
      case '$$$': return 'Premium';
      case '$$$$': return 'Luxury';
      default: return range;
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
            <span className="text-blue-400 text-2xl">V</span>
          </div>
        </div>
        <p className="text-blue-100/80">Loading vendor catalog...</p>
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
        <h3 className="text-xl font-semibold text-white mb-2">Error Loading Vendors</h3>
        <p className="text-blue-100/70 mb-6">We couldn't load the vendor catalog. Please try again later.</p>
        <Button 
          className="w-full rounded-xl py-5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
          onClick={() => refetch()}
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
              Vendor Catalog
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
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="icon-sm" 
                onClick={() => setViewMode('grid')}
                className={`rounded-full text-blue-100/60 hover:text-white hover:bg-white/10 ${
                  viewMode === 'grid' ? 'bg-white/10 text-white' : ''
                }`}
              >
                <Grid size={18} />
              </Button>
              <Button 
                variant="outline" 
                size="icon-sm" 
                onClick={() => setViewMode('list')}
                className={`rounded-full text-blue-100/60 hover:text-white hover:bg-white/10 ${
                  viewMode === 'list' ? 'bg-white/10 text-white' : ''
                }`}
              >
                <AlignJustify size={18} />
              </Button>
            </div>
          </motion.div>
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="backdrop-blur-xl border border-white/10 shadow-lg rounded-3xl p-5"
            style={{
              background: `linear-gradient(135deg, rgba(42, 67, 101, 0.3) 0%, rgba(26, 41, 64, 0.4) 100%)`,
            }}
          >
            <div className="flex flex-col lg:flex-row items-stretch gap-4">
              {/* Search input */}
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-100/50 h-5 w-5" />
                <Input
                  placeholder="Search vendors by name or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-blue-100/40 rounded-xl h-11 focus:border-blue-400/60 transition-all duration-300"
                />
              </div>
              
              {/* Quick filter buttons */}
              <div className="flex gap-2 flex-wrap md:flex-nowrap">
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger
                    className="h-11 bg-white/5 border-white/10 text-white rounded-xl min-w-32"
                    aria-label="Filter by category"
                  >
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl backdrop-blur-md border border-white/10"
                    style={{ background: 'linear-gradient(135deg, rgba(42, 67, 101, 0.9) 0%, rgba(26, 41, 64, 0.95) 100%)' }}
                  >
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="venue">Venue</SelectItem>
                    <SelectItem value="photographer">Photographer</SelectItem>
                    <SelectItem value="florist">Florist</SelectItem>
                    <SelectItem value="caterer">Caterer</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button 
                  variant="outline" 
                  className="h-11 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white gap-2"
                  onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                >
                  <Filter size={18} />
                  <span className="hidden sm:inline">Advanced Filters</span>
                </Button>
              </div>
            </div>
            
            {/* Advanced filters */}
            <AnimatePresence>
              {isFilterPanelOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/10">
                    <div className="space-y-2">
                      <label className="text-sm text-blue-100/70">Location</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-100/50 h-4 w-4" />
                        <Input
                          placeholder="City, state, or zip"
                          value={filterLocation}
                          onChange={(e) => setFilterLocation(e.target.value)}
                          className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-blue-100/40 rounded-xl h-10 focus:border-blue-400/60"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm text-blue-100/70">Price Range</label>
                      <Select value={priceRange} onValueChange={setPriceRange}>
                        <SelectTrigger
                          className="h-10 bg-white/5 border-white/10 text-white rounded-xl"
                          aria-label="Filter by price range"
                        >
                          <SelectValue placeholder="Any Price" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl backdrop-blur-md border border-white/10"
                          style={{ background: 'linear-gradient(135deg, rgba(42, 67, 101, 0.9) 0%, rgba(26, 41, 64, 0.95) 100%)' }}
                        >
                          <SelectItem value="all">Any Price</SelectItem>
                          <SelectItem value="$">Budget ($)</SelectItem>
                          <SelectItem value="$$">Moderate ($$)</SelectItem>
                          <SelectItem value="$$$">Premium ($$$)</SelectItem>
                          <SelectItem value="$$$$">Luxury ($$$$)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm text-blue-100/70">Minimum Rating</label>
                      <Select value={minRating} onValueChange={setMinRating}>
                        <SelectTrigger
                          className="h-10 bg-white/5 border-white/10 text-white rounded-xl"
                          aria-label="Filter by minimum rating"
                        >
                          <SelectValue placeholder="Any Rating" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl backdrop-blur-md border border-white/10"
                          style={{ background: 'linear-gradient(135deg, rgba(42, 67, 101, 0.9) 0%, rgba(26, 41, 64, 0.95) 100%)' }}
                        >
                          <SelectItem value="0">Any Rating</SelectItem>
                          <SelectItem value="3">3+ Stars</SelectItem>
                          <SelectItem value="4">4+ Stars</SelectItem>
                          <SelectItem value="4.5">4.5+ Stars</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white"
                      onClick={resetFilters}
                    >
                      Reset Filters
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
        
        {/* Results count */}
        <motion.div variants={itemVariants} className="flex justify-between items-center mb-6">
          <p className="text-blue-100/70">
            {filteredVendors.length} {filteredVendors.length === 1 ? 'vendor' : 'vendors'} found
          </p>
          
          {(filterCategory !== 'all' || filterLocation || priceRange !== 'all' || minRating !== '0' || searchQuery) && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-blue-100/60 hover:text-white gap-1.5"
              onClick={resetFilters}
            >
              <X size={16} />
              Clear filters
            </Button>
          )}
        </motion.div>

        {/* Vendor Grid/List */}
        {filteredVendors.length === 0 ? (
          <motion.div 
            variants={itemVariants}
            className="backdrop-blur-xl border border-white/10 shadow-xl rounded-3xl p-10 text-center"
            style={{
              background: `linear-gradient(135deg, rgba(42, 67, 101, 0.3) 0%, rgba(26, 41, 64, 0.4) 100%)`,
            }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 mb-4">
              <Search size={32} className="text-blue-300" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">No Vendors Found</h3>
            <p className="text-blue-100/70 max-w-md mx-auto mb-6">
              We couldn't find any vendors matching your search criteria. Try adjusting your filters or search terms.
            </p>
            <Button 
              onClick={resetFilters}
              className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            >
              Reset All Filters
            </Button>
          </motion.div>
        ) : (
          <motion.div variants={itemVariants}>
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-6'
            }>
              <AnimatePresence>
                {filteredVendors.map((vendor) => {
                  // Get category styling
                  const { bg, text, border } = getCategoryColor(vendor.category);
                  
                  return viewMode === 'grid' ? (
                    // Grid layout
                    <motion.div
                      key={vendor.id}
                      variants={cardVariants}
                      whileHover="hover"
                      layout
                    >
                      <Card className="backdrop-blur-xl border border-white/10 shadow-xl rounded-3xl overflow-hidden h-full"
                        style={{
                          background: `linear-gradient(135deg, rgba(42, 67, 101, 0.3) 0%, rgba(26, 41, 64, 0.4) 100%)`,
                        }}
                      >
                        <div className="relative">
                          <img
                            src={(vendor.images && vendor.images[0]) || 'https://via.placeholder.com/400x250?text=No+Image'}
                            alt={vendor.name}
                            className="w-full h-48 object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0A1929]/80 via-transparent to-transparent"></div>
                          <div className="absolute top-3 left-3 flex gap-2">
                            <Badge className={`${bg} ${text} ${border} rounded-full px-2 py-1 flex items-center gap-1.5`}>
                              {categoryIcons[vendor.category]}
                              <span className="text-xs font-medium capitalize">{vendor.category}</span>
                            </Badge>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon-sm" 
                            className="absolute top-3 right-3 rounded-full bg-black/20 backdrop-blur-sm text-white hover:bg-black/40 hover:text-white"
                            onClick={() => toggleFavoriteMutation.mutate({ 
                              id: vendor.id, 
                              isFavorite: !vendor.isFavorite 
                            })}
                          >
                            {vendor.isFavorite ? (
                              <Heart size={18} className="fill-red-500 text-red-500" />
                            ) : (
                              <Heart size={18} />
                            )}
                          </Button>
                        </div>
                        
                        <CardHeader className="p-5 pb-0">
                          <CardTitle className="text-white text-xl">{vendor.name}</CardTitle>
                          <CardDescription className="flex items-center gap-1 text-blue-100/70">
                            <MapPin size={14} />
                            {vendor.location}
                          </CardDescription>
                        </CardHeader>
                        
                        <CardContent className="p-5 space-y-4">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1">
                              <Star className="text-yellow-400 fill-yellow-400" size={18} />
                              <span className="text-white font-medium">{vendor.rating}</span>
                              <span className="text-blue-100/70 text-sm">/5</span>
                            </div>
                            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 rounded-full">
                              {vendor.priceRange}
                            </Badge>
                          </div>
                          
                          <p className="text-blue-100/70 text-sm line-clamp-2">
                            {vendor.description}
                          </p>
                          
                          <div className="flex gap-2 pt-2">
                            <Dialog onOpenChange={(open) => {
                              if (open) setSelectedVendor(vendor);
                              else setSelectedVendor(null);
                            }}>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  className="flex-1 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white"
                                >
                                  View Details
                                </Button>
                              </DialogTrigger>
                            </Dialog>
                            
                            <Button 
                              className="flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                              onClick={() => {
                                setSelectedVendor(vendor);
                                bookVendorMutation.mutate(vendor.id);
                              }}
                              disabled={bookVendorMutation.isPending}
                            >
                              {bookVendorMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                'Book Now'
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ) : (
                    // List layout
                    <motion.div
                      key={vendor.id}
                      variants={cardVariants}
                      whileHover="hover"
                      layout
                    >
                      <Card className="backdrop-blur-xl border border-white/10 shadow-xl rounded-3xl overflow-hidden"
                        style={{
                          background: `linear-gradient(135deg, rgba(42, 67, 101, 0.3) 0%, rgba(26, 41, 64, 0.4) 100%)`,
                        }}
                      >
                        <div className="flex flex-col md:flex-row">
                          <div className="relative w-full md:w-1/4 aspect-video md:aspect-square">
                            <img
                              src={(vendor.images && vendor.images[0]) || 'https://via.placeholder.com/400x250?text=No+Image'}
                              alt={vendor.name}
                              className="w-full h-full object-cover"
                            />
                            <Button 
                              variant="ghost" 
                              size="icon-sm" 
                              className="absolute top-3 right-3 rounded-full bg-black/20 backdrop-blur-sm text-white hover:bg-black/40 hover:text-white"
                              onClick={() => toggleFavoriteMutation.mutate({ 
                                id: vendor.id, 
                                isFavorite: !vendor.isFavorite 
                              })}
                            >
                              {vendor.isFavorite ? (
                                <Heart size={18} className="fill-red-500 text-red-500" />
                              ) : (
                                <Heart size={18} />
                              )}
                            </Button>
                          </div>
                          
                          <div className="flex-1 p-5">
                            <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                              <div>
                                <h3 className="text-white text-xl font-semibold">{vendor.name}</h3>
                                <div className="flex flex-wrap items-center gap-3 mt-1">
                                  <Badge className={`${bg} ${text} ${border} rounded-full px-2 py-1 flex items-center gap-1.5`}>
                                    {categoryIcons[vendor.category]}
                                    <span className="text-xs font-medium capitalize">{vendor.category}</span>
                                  </Badge>
                                  <div className="flex items-center gap-1 text-blue-100/70">
                                    <MapPin size={14} />
                                    <span>{vendor.location}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                  <Star className="text-yellow-400 fill-yellow-400" size={18} />
                                  <span className="text-white font-medium">{vendor.rating}</span>
                                  <span className="text-blue-100/70 text-sm">/5</span>
                                </div>
                                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 rounded-full">
                                  {vendor.priceRange}
                                </Badge>
                              </div>
                            </div>
                            
                            <p className="text-blue-100/70 text-sm mb-4 line-clamp-2 md:line-clamp-none">
                              {vendor.description}
                            </p>
                            
                            <div className="flex flex-wrap gap-2 mt-auto">
                              <Dialog onOpenChange={(open) => {
                                if (open) setSelectedVendor(vendor);
                                else setSelectedVendor(null);
                              }}>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white"
                                  >
                                    View Details
                                  </Button>
                                </DialogTrigger>
                              </Dialog>
                              
                              <Button 
                                className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                                onClick={() => {
                                  setSelectedVendor(vendor);
                                  bookVendorMutation.mutate(vendor.id);
                                }}
                                disabled={bookVendorMutation.isPending}
                              >
                                {bookVendorMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  'Book Now'
                                )}
                              </Button>
                              
                              {vendor.contact && (
                                <Button 
                                  variant="ghost" 
                                  className="rounded-xl text-blue-300 hover:text-blue-200 hover:bg-blue-500/10 gap-1.5"
                                >
                                  <Phone size={16} />
                                  {vendor.contact}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </motion.div>
      
      {/* Vendor Detail Dialog */}
      <Dialog open={!!selectedVendor} onOpenChange={(open) => !open && setSelectedVendor(null)}>
        <DialogContent 
          className="max-w-4xl rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl p-0 overflow-hidden"
          style={{ background: `linear-gradient(135deg, rgba(42, 67, 101, 0.9) 0%, rgba(26, 41, 64, 0.95) 100%)` }}
        >
          {selectedVendor && (
            <>
              <div className="relative h-64 md:h-80 w-full">
                <img
                  src={(selectedVendor.images && selectedVendor.images[0]) || 'https://via.placeholder.com/800x400?text=No+Image'}
                  alt={selectedVendor.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A1929]/90 via-[#0A1929]/30 to-transparent"></div>
                
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                  <Badge className={`${
                    getCategoryColor(selectedVendor.category).bg
                  } ${
                    getCategoryColor(selectedVendor.category).text
                  } ${
                    getCategoryColor(selectedVendor.category).border
                  } rounded-full px-3 py-1.5 flex items-center gap-2 text-sm`}>
                    {categoryIcons[selectedVendor.category]}
                    <span className="capitalize">{selectedVendor.category}</span>
                  </Badge>
                  
                  <Button 
                    variant="ghost" 
                    size="icon-sm" 
                    className="rounded-full bg-black/20 backdrop-blur-sm text-white hover:bg-black/40 hover:text-white"
                    onClick={() => toggleFavoriteMutation.mutate({ 
                      id: selectedVendor.id, 
                      isFavorite: !selectedVendor.isFavorite 
                    })}
                  >
                    {selectedVendor.isFavorite ? (
                      <Heart size={20} className="fill-red-500 text-red-500" />
                    ) : (
                      <Heart size={20} />
                    )}
                  </Button>
                </div>
                
                <div className="absolute bottom-4 left-6 right-6">
                  <h2 className="text-white text-2xl md:text-3xl font-bold">{selectedVendor.name}</h2>
                  <div className="flex flex-wrap items-center gap-4 mt-2">
                    <div className="flex items-center gap-1 text-blue-100">
                      <MapPin size={16} />
                      <span>{selectedVendor.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Star className="text-yellow-400 fill-yellow-400" size={16} />
                      <span className="text-white font-medium">{selectedVendor.rating}</span>
                      <span className="text-blue-100/70">/5</span>
                    </div>
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 rounded-full">
                      {selectedVendor.priceRange} · {formatPriceRange(selectedVendor.priceRange)}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="w-full bg-white/5 border border-white/10 rounded-xl p-1 mb-6">
                    <TabsTrigger value="details" className="rounded-lg text-sm data-[state=active]:bg-white/10 data-[state=active]:text-white">
                      Details
                    </TabsTrigger>
                    <TabsTrigger value="gallery" className="rounded-lg text-sm data-[state=active]:bg-white/10 data-[state=active]:text-white">
                      Gallery
                    </TabsTrigger>
                    <TabsTrigger value="availability" className="rounded-lg text-sm data-[state=active]:bg-white/10 data-[state=active]:text-white">
                      Availability
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="details" className="space-y-6">
                    <div className="space-y-3">
                      <h3 className="text-lg font-medium text-white">About</h3>
                      <p className="text-blue-100/80 leading-relaxed">
                        {selectedVendor.description}
                      </p>
                    </div>
                    
                    {selectedVendor.features && selectedVendor.features.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-lg font-medium text-white">Features & Services</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {selectedVendor.features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <CheckCircle size={16} className="text-green-400" />
                              <span className="text-blue-100/80">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {selectedVendor.contact && (
                      <div className="space-y-3">
                        <h3 className="text-lg font-medium text-white">Contact Information</h3>
                        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-3">
                          <Phone size={18} className="text-blue-300" />
                          <span className="text-blue-100/80">{selectedVendor.contact}</span>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="gallery">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {(selectedVendor.images || []).map((img, index) => (
                        <div key={index} className="rounded-xl overflow-hidden border border-white/10">
                          <img
                            src={img || 'https://via.placeholder.com/400x300?text=No+Image'}
                            alt={`${selectedVendor.name} ${index + 1}`}
                            className="w-full h-48 object-cover transition-transform hover:scale-105 duration-300"
                          />
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="availability">
                    <div className="space-y-3">
                      <h3 className="text-lg font-medium text-white">Available Dates</h3>
                      {selectedVendor.availability && selectedVendor.availability.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedVendor.availability.map((date, index) => (
                            <Badge key={index} className="bg-blue-500/20 text-blue-300 border-blue-500/30 rounded-xl px-3 py-1.5">
                              {date}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-blue-100/70">Please contact the vendor for availability information.</p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
              
              <div className="px-6 pb-6 pt-2 flex flex-col sm:flex-row gap-3">
                <Button 
                  className="flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 h-12"
                  onClick={() => bookVendorMutation.mutate(selectedVendor.id)}
                  disabled={bookVendorMutation.isPending}
                >
                  {bookVendorMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <BookOpen size={18} />
                      <span>Request Booking</span>
                    </div>
                  )}
                </Button>
                
                {selectedVendor.contact && (
                  <Button 
                    variant="outline" 
                    className="flex-1 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white h-12 gap-2"
                  >
                    <Phone size={18} />
                    <span>Contact Directly</span>
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorCatalog;
