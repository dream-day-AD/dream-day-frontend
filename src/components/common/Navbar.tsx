import { Button } from '@/components/ui/button';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '@/features/auth/authSlice';
import { RootState } from '@/redux/store';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export const Navbar = () => {
  const dispatch = useDispatch();
  const { role } = useSelector((state: RootState) => state.auth);

  return (
    <motion.nav
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-between p-4 bg-[var(--card-bg)] shadow-md"
      aria-label="Main navigation"
    >
      <h1 className="text-xl font-bold">DreamDay</h1>
      <div className="flex items-center gap-4">
        <Link to="/dashboard" className="text-white hover:underline">
          Dashboard
        </Link>
        <Link to="/vendors" className="text-white hover:underline">
          Vendors
        </Link>
        <Link to="/checklist" className="text-white hover:underline">
          Checklist
        </Link>
        <Link to="/guests" className="text-white hover:underline">
          Guests
        </Link>
        <Link to="/budget" className="text-white hover:underline">
          Budget
        </Link>
        <Link to="/timeline" className="text-white hover:underline">
          Timeline
        </Link>
        {role === 'planner' && (
          <Link to="/planner" className="text-white hover:underline">
            Planner
          </Link>
        )}
        <Link to="/reports" className="text-white hover:underline">
          Reports
        </Link>
        {role === 'admin' && (
          <Link to="/admin" className="text-white hover:underline">
            Admin
          </Link>
        )}
        {role && (
          <Button variant="outline" onClick={() => dispatch(logout())}>
            Logout
          </Button>
        )}
      </div>
    </motion.nav>
  );
};
