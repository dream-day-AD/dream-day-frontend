import { Routes, Route, Navigate } from 'react-router-dom';
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

  return (
    <div className="flex flex-col min-h-screen">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/dashboard"
          element={token ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/vendors"
          element={token ? <VendorCatalog /> : <Navigate to="/login" />}
        />
        <Route
          path="/checklist"
          element={token ? <Checklist /> : <Navigate to="/login" />}
        />
        <Route
          path="/guests"
          element={token ? <GuestList /> : <Navigate to="/login" />}
        />
        <Route
          path="/budget"
          element={token ? <BudgetTracker /> : <Navigate to="/login" />}
        />
        <Route
          path="/timeline"
          element={token ? <Timeline /> : <Navigate to="/login" />}
        />
        <Route
          path="/planner"
          element={token ? <PlannerInterface /> : <Navigate to="/login" />}
        />
        <Route
          path="/reports"
          element={token ? <Reports /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin"
          element={token ? <AdminDashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/login"
          element={!token ? <Login /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/register"
          element={!token ? <Register /> : <Navigate to="/dashboard" />}
        />
      </Routes>
    </div>
  );
}

export default App;
