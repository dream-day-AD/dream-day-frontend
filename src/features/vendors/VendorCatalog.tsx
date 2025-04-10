import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
} from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

interface Vendor {
  id: string;
  name: string;
  category: 'venue' | 'photographer' | 'florist' | 'caterer' | 'other';
  location: string;
  priceRange: string;
  rating: number;
  description: string;
  images: string[];
}

const VendorCatalog = () => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterLocation, setFilterLocation] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState(''); // Add search state
  const queryClient = useQueryClient();

  const {
    data: vendors,
    isLoading,
    error,
  } = useQuery<Vendor[]>({
    queryKey: ['vendors', filterCategory, filterLocation],
    queryFn: async () => {
      const response = await api.get('/vendors', {
        params: {
          category: filterCategory === 'all' ? undefined : filterCategory,
          location: filterLocation || undefined,
        },
      });
      return response.data;
    },
  });

  const bookVendorMutation = useMutation({
    mutationFn: (vendorId: string) => api.post('/bookings', { vendorId }),
    onSuccess: () => {
      toast.success('Booking request sent successfully!');
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
    onError: () => toast.error('Failed to send booking request.'),
  });

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const filteredVendors = vendors?.filter((vendor) =>
    vendor.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading)
    return <div className="p-6 text-center">Loading vendors...</div>;
  if (error)
    return (
      <div className="p-6 text-center text-red-500">Error loading vendors</div>
    );

  return (
    <div className="p-6 space-y-6">
      <Toaster richColors position="top-right" />
      <h2 className="text-2xl font-semibold">Vendor Catalog</h2>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <Select onValueChange={setFilterCategory} defaultValue="all">
          <SelectTrigger
            className="w-full md:w-48 bg-gray-800 text-white"
            aria-label="Filter by category"
          >
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="venue">Venue</SelectItem>
            <SelectItem value="photographer">Photographer</SelectItem>
            <SelectItem value="florist">Florist</SelectItem>
            <SelectItem value="caterer">Caterer</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        <Input
          placeholder="Filter by location"
          value={filterLocation}
          onChange={(e) => setFilterLocation(e.target.value)}
          className="w-full md:w-48 bg-gray-800 text-white"
          aria-label="Filter by location"
        />
        <Input
          placeholder="Search by name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-48 bg-gray-800 text-white"
          aria-label="Search vendors"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredVendors?.map((vendor) => (
          <motion.div
            key={vendor.id}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <Card className="bg-[var(--card-bg)] border-none">
              <CardHeader>
                <CardTitle>{vendor.name}</CardTitle>
                <p className="text-sm text-gray-400">{vendor.category}</p>
              </CardHeader>
              <CardContent className="space-y-2">
                <img
                  src={vendor.images[0] || 'https://via.placeholder.com/150'}
                  alt={vendor.name}
                  className="w-full h-40 object-cover rounded-md"
                />
                <p>Location: {vendor.location}</p>
                <p>Price Range: {vendor.priceRange}</p>
                <p>Rating: {vendor.rating} / 5</p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">View Details</Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[var(--card-bg)] text-white">
                    <DialogHeader>
                      <DialogTitle>{vendor.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p>{vendor.description}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {vendor.images.map((img, index) => (
                          <img
                            key={index}
                            src={img || 'https://via.placeholder.com/150'}
                            alt={`${vendor.name} ${index + 1}`}
                            className="w-full h-24 object-cover rounded-md"
                          />
                        ))}
                      </div>
                      <Button
                        onClick={() => bookVendorMutation.mutate(vendor.id)}
                        disabled={bookVendorMutation.isPending}
                      >
                        {bookVendorMutation.isPending
                          ? 'Booking...'
                          : 'Request Booking'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default VendorCatalog;
