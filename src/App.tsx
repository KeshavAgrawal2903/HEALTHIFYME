import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/auth-store';
import { supabase } from './lib/supabase';
import { Activity, BarChart3, Home, User } from 'lucide-react';

// Lazy load components
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Auth = React.lazy(() => import('./pages/Auth'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Activities = React.lazy(() => import('./pages/Activities'));
const Analytics = React.lazy(() => import('./pages/Analytics'));

function App() {
  const { user, setUser } = useAuthStore();

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for changes on auth state
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <React.Suspense
          fallback={
            <div className="flex items-center justify-center min-h-screen">
              <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          }
        >
          <Routes>
            <Route
              path="/"
              element={
                user ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Navigate to="/auth" replace />
                )
              }
            />
            <Route
              path="/auth"
              element={user ? <Navigate to="/dashboard" replace /> : <Auth />}
            />
            <Route
              path="/dashboard"
              element={user ? <Dashboard /> : <Navigate to="/auth" replace />}
            />
            <Route
              path="/profile"
              element={user ? <Profile /> : <Navigate to="/auth" replace />}
            />
            <Route
              path="/activities"
              element={user ? <Activities /> : <Navigate to="/auth" replace />}
            />
            <Route
              path="/analytics"
              element={user ? <Analytics /> : <Navigate to="/auth" replace />}
            />
          </Routes>
        </React.Suspense>

        {user && (
          <nav className="fixed bottom-0 w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div className="max-w-screen-xl mx-auto px-4">
              <div className="flex justify-around py-3">
                <NavLink to="/dashboard" icon={<Home />} label="Home" />
                <NavLink to="/activities" icon={<Activity />} label="Activities" />
                <NavLink to="/analytics" icon={<BarChart3 />} label="Analytics" />
                <NavLink to="/profile" icon={<User />} label="Profile" />
              </div>
            </div>
          </nav>
        )}
      </div>
    </Router>
  );
}

function NavLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      className={`flex flex-col items-center ${
        isActive 
          ? 'text-blue-500 dark:text-blue-400' 
          : 'text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400'
      }`}
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </Link>
  );
}

export default App;