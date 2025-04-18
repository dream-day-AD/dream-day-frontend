import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const BookingList = () => {
  const { data: bookings, isLoading, error } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => api.get('/Bookings').then((res) => res.data),
  });

  if (isLoading) return <div className="p-6 text-center">Loading bookings...</div>;
  if (error) return <div className="p-6 text-center text-red-500">Error loading bookings: {error.message}</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Your Bookings</h2>
        <Link to="/bookings/new">
          <Button variant="outline">Create New Booking</Button>
        </Link>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {bookings.map((booking) => (
          <Card key={booking.BookingId} className="bg-[var(--card-bg)] border-none">
            <CardHeader>
              <CardTitle>Booking for {booking.Event.EventName}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Status: {booking.Status}</p>
              <p>Total Cost: ${booking.TotalCost.toFixed(2)}</p>
              <p>Venue: {booking.Event.Venue?.Name || 'Not assigned'}</p>
              <Link to={`/bookings/${booking.BookingId}`}>
                <Button variant="link">View Details</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BookingList;