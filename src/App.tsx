import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from '@/components/common/Navbar';
import { Dashboard } from '@/features/dashboard/Dashboard';
import Login from '@/features/auth/Login';
import Register from '@/features/auth/Register';
import VendorCatalog from '@/features/vendors/VendorCatalog';
import Checklist from '@/features/checklist/Checklist';
import GuestList from '@/features/guests/GuestList';
import BudgetTracker from '@/features/budget/BudgetTracker';
import Timeline from '@/features/timeline/Timeline';
import PlannerInterface from '@/features/planner/PlannerInterface';
import Reports from '@/features/reports/Reports';
import AdminDashboard from '@/features/admin/AdminDashboard';
import LandingPage from '@/features/landing/LandingPage';
import EventList from '@/features/events/EventList';
import EventForm from '@/features/events/EventForm';
import VenueList from '@/features/venues/VenueList';
import VenueForm from '@/features/venues/VenueForm';
import BookingList from '@/features/bookings/BookingList';
import BookingForm from '@/features/bookings/BookingForm';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

function App() {
  const { token } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  console.log('App - Token:', token ? 'Logged In' : 'Logged Out', 'Pathname:', location.pathname);

  const ProtectedRoute = ({ element }: { element: React.ReactNode }) =>
    token ? (
      <>
        <Navbar />
        {element}
      </>
    ) : (
      <Navigate to="/login" state={{ from: location }} replace />
    );

  return (
    <div className="flex flex-col min-h-screen">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
        <Route path="/vendors" element={<ProtectedRoute element={<VendorCatalog />} />} />
        <Route path="/checklist" element={<ProtectedRoute element={<Checklist />} />} />
        <Route path="/guests" element={<ProtectedRoute element={<GuestList />} />} />
        <Route path="/budget" element={<ProtectedRoute element={<BudgetTracker />} />} />
        <Route path="/timeline" element={<ProtectedRoute element={<Timeline />} />} />
        <Route path="/planner" element={<ProtectedRoute element={<PlannerInterface />} />} />
        <Route path="/reports" element={<ProtectedRoute element={<Reports />} />} />
        <Route path="/admin" element={<ProtectedRoute element={<AdminDashboard />} />} />
        <Route path="/events" element={<ProtectedRoute element={<EventList />} />} />
        <Route path="/events/new" element={<ProtectedRoute element={<EventForm />} />} />
        <Route path="/events/:id" element={<ProtectedRoute element={<EventForm />} />} />
        <Route path="/venues" element={<ProtectedRoute element={<VenueList />} />} />
        <Route path="/venues/new" element={<ProtectedRoute element={<VenueForm />} />} />
        <Route path="/venues/edit/:id" element={<ProtectedRoute element={<VenueForm />} />} />
        <Route path="/bookings" element={<ProtectedRoute element={<BookingList />} />} />
        <Route path="/bookings/new" element={<ProtectedRoute element={<BookingForm />} />} />
        <Route path="/bookings/:id" element={<ProtectedRoute element={<BookingForm />} />} />
        <Route path="/login" element={!token ? <Login /> : <Navigate to="/" replace />} />
        <Route path="/register" element={!token ? <Register /> : <Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;