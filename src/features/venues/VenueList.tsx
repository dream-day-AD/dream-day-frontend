import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const VenueList = () => {
  const { role } = useSelector((state) => state.auth);
  const { data: venues, isLoading, error } = useQuery({
    queryKey: ['venues'],
    queryFn: () => api.get('/Venues').then((res) => res.data),
  });

  if (isLoading) return <div className="p-6 text-center">Loading venues...</div>;
  if (error) return <div className="p-6 text-center text-red-500">Error loading venues: {error.message}</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Venues</h2>
        {role === 'admin' && (
          <Link to="/venues/new">
            <Button variant="outline">Add New Venue</Button>
          </Link>
        )}
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {venues.map((venue) => (
          <Card key={venue.VenueId} className="bg-[var(--card-bg)] border-none">
            <CardHeader>
              <CardTitle>{venue.Name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Address: {venue.Address}</p>
              <p>Capacity: {venue.Capacity}</p>
              <p>Price: ${venue.Price.toFixed(2)}</p>
              {role === 'admin' && (
                <Link to={`/venues/edit/${venue.VenueId}`}>
                  <Button variant="link">Edit</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default VenueList;