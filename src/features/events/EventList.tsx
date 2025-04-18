import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const EventList = () => {
  const { data: events, isLoading, error } = useQuery({
    queryKey: ['events'],
    queryFn: () => api.get('/Events').then((res) => res.data),
  });

  if (isLoading) return <div className="p-6 text-center">Loading events...</div>;
  if (error) return <div className="p-6 text-center text-red-500">Error loading events: {error.message}</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Your Events</h2>
        <Link to="/events/new">
          <Button variant="outline">Create New Event</Button>
        </Link>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <Card key={event.EventId} className="bg-[var(--card-bg)] border-none">
            <CardHeader>
              <CardTitle>{event.EventName}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Date: {new Date(event.Date).toLocaleDateString()}</p>
              <p>Time: {event.Time}</p>
              <p>Venue: {event.Venue?.Name || 'Not assigned'}</p>
              <Link to={`/events/${event.EventId}`}>
                <Button variant="link">View Details</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EventList;