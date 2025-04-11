import { Button } from '@/components/ui/button';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '@/features/auth/authSlice';
import { RootState } from '@/redux/store';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { role, name } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <motion.nav
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-between p-4 bg-[var(--card-bg)] shadow-md"
      aria-label="Main navigation"
    >
      <div className="flex items-center gap-2">
        <Link to="/" className="text-xl font-bold text-white hover:underline">
          DreamDay
        </Link>
        {name && <span className="text-white text-sm">({name})</span>}
      </div>
      <div className="flex items-center gap-4">
        {!role ? (
          <>
            <Link to="/" className="text-white hover:underline">
              Home
            </Link>
            <a href="#Aboutus" className="text-white hover:underline">
              About Us
            </a>
            <a href="#Contact" className="text-white hover:underline">
              Contact
            </a>
          </>
        ) : (
          <>
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
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">Logout</Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-gray-800 text-white border-none backdrop-blur-md">
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-300">
                    Do you really want to log out? You’ll need to log in again to access your dashboard.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleLogout}
                    className="bg-red-600 text-white hover:bg-red-700"
                  >
                    Logout
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </div>
    </motion.nav>
  );
};
