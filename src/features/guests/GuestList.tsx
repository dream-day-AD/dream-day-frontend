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
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import Papa from 'papaparse';
import { MoreHorizontal } from 'lucide-react';

interface Guest {
  id: number; // Backend uses int
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
  const [newGuest, setNewGuest] = useState({ name: '', email: '' });
  const [editingSeatingId, setEditingSeatingId] = useState<number | null>(null);
  const [seatingValue, setSeatingValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const { data: guests = [], isLoading, error } = useQuery<Guest[]>({
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
      toast.success('Guest added successfully!');
      setNewGuest({ name: '', email: '' });
    },
    onError: () => toast.error('Failed to add guest.'),
  });

  const updateRSVPMutation = useMutation({
    mutationFn: ({ id, rsvp }: { id: number; rsvp: Guest['rsvp'] }) =>
      api.patch(`/guests/${id}`, { rsvp }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['guests'] }),
    onError: () => toast.error('Failed to update RSVP.'),
  });

  const updateMealMutation = useMutation({
    mutationFn: ({ id, mealPreference }: { id: number; mealPreference: Guest['mealPreference'] }) =>
      api.patch(`/guests/${id}`, { mealPreference }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['guests'] }),
    onError: () => toast.error('Failed to update meal preference.'),
  });

  const updateSeatingMutation = useMutation({
    mutationFn: ({ id, seating }: { id: number; seating: string }) =>
      api.patch(`/guests/${id}`, { seating }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      toast.success('Seating updated!');
      setEditingSeatingId(null);
    },
    onError: () => toast.error('Failed to update seating.'),
  });

  const deleteGuestMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/guests/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      toast.success('Guest removed successfully!');
    },
    onError: () => toast.error('Failed to remove guest.'),
  });

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

        importedGuests.forEach((guest) => addGuestMutation.mutate(guest));
      },
      error: () => toast.error('Failed to import CSV.'),
    });
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

  const rsvpCounts = {
    yes: guests.filter((g) => g.rsvp === 'yes').length,
    no: guests.filter((g) => g.rsvp === 'no').length,
    maybe: guests.filter((g) => g.rsvp === 'maybe').length,
    pending: guests.filter((g) => g.rsvp === 'pending').length,
  };

  const filteredGuests = guests.filter(
    (guest) =>
      guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) return <div className="p-6 text-center">Loading guests...</div>;
  if (error) return <div className="p-6 text-center text-red-500">Error loading guests</div>;

  return (
    <div className="p-6 space-y-6">
      <Toaster richColors position="top-right" />
      <h2 className="text-2xl font-semibold">Guest List</h2>

      <Card className="bg-[var(--card-bg)] border-none">
        <CardHeader>
          <CardTitle>Your Guests</CardTitle>
          <div className="text-sm text-gray-400">
            Total Guests: {guests.length} | Yes: {rsvpCounts.yes} | No: {rsvpCounts.no} | Maybe: {rsvpCounts.maybe} | Pending: {rsvpCounts.pending}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-col sm:flex-row">
            <form onSubmit={handleAddGuest} className="flex gap-2 flex-1">
              <Input
                placeholder="Name"
                value={newGuest.name}
                onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
                className="bg-gray-800 text-white"
              />
              <Input
                placeholder="Email"
                value={newGuest.email}
                onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
                className="bg-gray-800 text-white"
              />
              <Button type="submit" disabled={addGuestMutation.isPending}>
                {addGuestMutation.isPending ? 'Adding...' : 'Add Guest'}
              </Button>
            </form>
            <Input
              placeholder="Search by name or email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-800 text-white w-full sm:w-64"
              aria-label="Search guests"
            />
          </div>
          <div>
            <label htmlFor="csv-upload" className="text-sm text-gray-400">
              Import from CSV (name, email, rsvp, mealPreference, seating)
            </label>
            <Input
              id="csv-upload"
              type="file"
              accept=".csv"
              onChange={handleCSVImport}
              className="bg-gray-800 text-white mt-1"
              aria-label="Upload CSV file"
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>RSVP</TableHead>
                <TableHead>Meal Preference</TableHead>
                <TableHead>Seating</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGuests.map((guest) => (
                <motion.tr
                  key={guest.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <TableCell>{guest.name}</TableCell>
                  <TableCell>{guest.email}</TableCell>
                  <TableCell>
                    <Select
                      value={guest.rsvp}
                      onValueChange={(value) =>
                        updateRSVPMutation.mutate({ id: guest.id, rsvp: value as Guest['rsvp'] })
                      }
                    >
                      <SelectTrigger className="w-32 bg-gray-800 text-white" aria-label={`RSVP for ${guest.name}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                        <SelectItem value="maybe">Maybe</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
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
                      <SelectTrigger className="w-32 bg-gray-800 text-white" aria-label={`Meal preference for ${guest.name}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vegetarian">Vegetarian</SelectItem>
                        <SelectItem value="non-vegetarian">Non-Vegetarian</SelectItem>
                        <SelectItem value="vegan">Vegan</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {editingSeatingId === guest.id ? (
                      <Input
                        value={seatingValue}
                        onChange={(e) => setSeatingValue(e.target.value)}
                        onBlur={() => handleUpdateSeating(guest.id)}
                        className="bg-gray-700 text-white w-32"
                        autoFocus
                        aria-label={`Edit seating for ${guest.name}`}
                      />
                    ) : (
                      <span
                        className="cursor-pointer hover:text-gray-300"
                        onClick={() => {
                          setEditingSeatingId(guest.id);
                          setSeatingValue(guest.seating);
                        }}
                      >
                        {guest.seating || 'Unassigned'}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" aria-label={`More actions for ${guest.name}`}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-gray-800 text-white">
                        <DropdownMenuItem onClick={() => deleteGuestMutation.mutate(guest.id)}>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default GuestList;