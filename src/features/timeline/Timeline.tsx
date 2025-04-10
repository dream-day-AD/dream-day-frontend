import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { useState } from 'react'; // Add useState import
import { EventClickArg } from '@fullcalendar/core'; // Add type for event click

interface Event {
  id: string;
  title: string;
  start: string;
}

const mockEvents: Event[] = [
  { id: '1', title: 'Ceremony', start: '2025-12-25T14:00:00' },
  { id: '2', title: 'Vendor Arrival', start: '2025-12-25T12:00:00' },
];

const Timeline = () => {
  const [newEvent, setNewEvent] = useState({ title: '', start: '' });
  const queryClient = useQueryClient();

  const {
    data: events = mockEvents,
    isLoading,
    error,
  } = useQuery<Event[]>({
    queryKey: ['timeline'],
    queryFn: async () => {
      const response = await api.get('/timeline');
      return response.data;
    },
    enabled: false,
  });

  const addEventMutation = useMutation({
    mutationFn: (event: { title: string; start: string }) =>
      api.post('/timeline', event),
    onSuccess: () => {
      queryClient.setQueryData(['timeline'], (old: Event[] | undefined) => [
        ...(old || []),
        { id: Date.now().toString(), ...newEvent },
      ]);
      toast.success('Event added successfully!');
      setNewEvent({ title: '', start: '' });
    },
    onError: () => toast.error('Failed to add event.'),
  });

  const deleteEventMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/timeline/${id}`),
    onSuccess: (_, id) => {
      queryClient.setQueryData(['timeline'], (old: Event[] | undefined) =>
        old?.filter((e) => e.id !== id)
      );
      toast.success('Event removed successfully!');
    },
    onError: () => toast.error('Failed to remove event.'),
  });

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEvent.title && newEvent.start) addEventMutation.mutate(newEvent);
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    if (confirm(`Delete event "${clickInfo.event.title}"?`)) {
      deleteEventMutation.mutate(clickInfo.event.id);
    }
  };

  if (isLoading)
    return <div className="p-6 text-center">Loading timeline...</div>;
  if (error)
    return (
      <div className="p-6 text-center text-red-500">Error loading timeline</div>
    );

  return (
    <div className="p-6 space-y-6">
      <Toaster richColors position="top-right" />
      <h2 className="text-2xl font-semibold">Wedding Timeline</h2>

      <Card className="bg-[var(--card-bg)] border-none">
        <CardHeader>
          <CardTitle>Your Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleAddEvent} className="flex gap-2">
            <Input
              placeholder="Event Title"
              value={newEvent.title}
              onChange={(e) =>
                setNewEvent({ ...newEvent, title: e.target.value })
              }
              className="bg-gray-800 text-white"
            />
            <Input
              type="datetime-local"
              value={newEvent.start}
              onChange={(e) =>
                setNewEvent({ ...newEvent, start: e.target.value })
              }
              className="bg-gray-800 text-white w-48"
            />
            <Button type="submit" disabled={addEventMutation.isPending}>
              {addEventMutation.isPending ? 'Adding...' : 'Add Event'}
            </Button>
          </form>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin]}
              initialView="timeGridDay"
              events={events}
              eventClick={handleEventClick}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay',
              }}
              height="auto"
              themeSystem="standard"
            />
          </motion.div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Timeline;
