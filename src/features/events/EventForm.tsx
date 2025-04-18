import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';

const EventForm = () => {
  const { id } = useParams(); // For editing an existing event
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch event data if editing
  const { data: event, isLoading: eventLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: () => api.get(`/Events/${id}`).then(res => res.data),
    enabled: !!id,
  });

  // Fetch venues for the dropdown
  const { data: venues, isLoading: venuesLoading } = useQuery({
    queryKey: ['venues'],
    queryFn: () => api.get('/Venues').then(res => res.data),
  });

  const [formData, setFormData] = useState({
    eventId: event?.EventId || '',
    eventName: event?.EventName || '',
    date: event?.Date ? new Date(event.Date).toISOString().split('T')[0] : '',
    time: event?.Time || '',
    description: event?.Description || '',
    venueId: event?.VenueId || '',
  });

  const mutation = useMutation({
    mutationFn: (eventData) => id
      ? api.put(`/Events/${id}`, { ...eventData, eventId: id })
      : api.post('/Events', eventData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success(id ? 'Event updated successfully!' : 'Event created successfully!');
      navigate('/events');
    },
    onError: (error) => {
      toast.error('Failed to save event: ' + error.message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const eventData = {
      eventName: formData.eventName,
      date: formData.date,
      time: formData.time,
      description: formData.description,
      venueId: formData.venueId,
    };
    mutation.mutate(eventData);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (id && eventLoading) return <div className="p-6 text-center">Loading event...</div>;
  if (venuesLoading) return <div className="p-6 text-center">Loading venues...</div>;

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-6">{id ? 'Edit Event' : 'Create Event'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="eventName">Event Name</Label>
          <Input
            id="eventName"
            name="eventName"
            value={formData.eventName}
            onChange={handleInputChange}
            required
            className="bg-gray-800 text-white"
          />
        </div>
        <div>
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleInputChange}
            required
            className="bg-gray-800 text-white"
          />
        </div>
        <div>
          <Label htmlFor="time">Time</Label>
          <Input
            id="time"
            name="time"
            type="time"
            value={formData.time}
            onChange={handleInputChange}
            required
            className="bg-gray-800 text-white"
          />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="bg-gray-800 text-white"
          />
        </div>
        <div>
          <Label htmlFor="venueId">Venue</Label>
          <Select
            name="venueId"
            value={formData.venueId}
            onValueChange={(value) => setFormData(prev => ({ ...prev, venueId: value }))}
            required
          >
            <SelectTrigger className="bg-gray-800 text-white">
              <SelectValue placeholder="Select a venue" />
            </SelectTrigger>
            <SelectContent>
              {venues?.map((venue) => (
                <SelectItem key={venue.VenueId} value={venue.VenueId}>
                  {venue.Name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving...' : id ? 'Update Event' : 'Create Event'}
        </Button>
      </form>
    </div>
  );
};

export default EventForm;