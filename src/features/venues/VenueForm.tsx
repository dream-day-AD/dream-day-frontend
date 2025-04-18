import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

const VenueForm = () => {
  const { id } = useParams(); // For editing an existing venue
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { role } = useSelector((state) => state.auth);

  if (role !== 'admin') {
    return <div className="p-6 text-center text-red-500">Access denied. Admins only.</div>;
  }

  const { data: venue, isLoading: venueLoading } = useQuery({
    queryKey: ['venue', id],
    queryFn: () => api.get(`/Venues/${id}`).then(res => res.data),
    enabled: !!id,
  });

  const [formData, setFormData] = useState({
    venueId: venue?.VenueId || '',
    name: venue?.Name || '',
    address: venue?.Address || '',
    capacity: venue?.Capacity || '',
    price: venue?.Price || '',
  });

  const mutation = useMutation({
    mutationFn: (venueData) => id
      ? api.put(`/Venues/${id}`, { ...venueData, venueId: id })
      : api.post('/Venues', venueData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] });
      toast.success(id ? 'Venue updated successfully!' : 'Venue created successfully!');
      navigate('/venues');
    },
    onError: (error) => {
      toast.error('Failed to save venue: ' + error.message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const venueData = {
      name: formData.name,
      address: formData.address,
      capacity: parseInt(formData.capacity, 10),
      price: parseFloat(formData.price),
    };
    mutation.mutate(venueData);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (id && venueLoading) return <div className="p-6 text-center">Loading venue...</div>;

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-6">{id ? 'Edit Venue' : 'Create Venue'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Venue Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="bg-gray-800 text-white"
          />
        </div>
        <div>
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            required
            className="bg-gray-800 text-white"
          />
        </div>
        <div>
          <Label htmlFor="capacity">Capacity</Label>
          <Input
            id="capacity"
            name="capacity"
            type="number"
            value={formData.capacity}
            onChange={handleInputChange}
            required
            className="bg-gray-800 text-white"
          />
        </div>
        <div>
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={handleInputChange}
            required
            className="bg-gray-800 text-white"
          />
        </div>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving...' : id ? 'Update Venue' : 'Create Venue'}
        </Button>
      </form>
    </div>
  );
};

export default VenueForm;