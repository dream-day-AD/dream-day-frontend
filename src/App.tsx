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
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

function App() {
  const { token } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  // Debug log to track routing
  console.log('App - Token:', token ? 'Logged In' : 'Logged Out', 'Pathname:', location.pathname);

  // ProtectedRoute: Wraps authenticated routes with Navbar
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
        {/* Public route: Always show LandingPage at "/" */}
        <Route path="/" element={<LandingPage />} />
        {/* Protected routes */}
        <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
        <Route path="/vendors" element={<ProtectedRoute element={<VendorCatalog />} />} />
        <Route path="/checklist" element={<ProtectedRoute element={<Checklist />} />} />
        <Route path="/guests" element={<ProtectedRoute element={<GuestList />} />} />
        <Route path="/budget" element={<ProtectedRoute element={<BudgetTracker />} />} />
        <Route path="/timeline" element={<ProtectedRoute element={<Timeline />} />} />
        <Route path="/planner" element={<ProtectedRoute element={<PlannerInterface />} />} />
        <Route path="/reports" element={<ProtectedRoute element={<Reports />} />} />
        <Route path="/admin" element={<ProtectedRoute element={<AdminDashboard />} />} />
        {/* Auth routes: Redirect to "/" if already logged in */}
        <Route path="/login" element={!token ? <Login /> : <Navigate to="/" replace />} />
        <Route path="/register" element={!token ? <Register /> : <Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;