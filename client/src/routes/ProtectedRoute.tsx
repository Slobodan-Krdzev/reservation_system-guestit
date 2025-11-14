import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '../store/auth';

export const ProtectedRoute = () => {
  const location = useLocation();
  const { user, token, hydrate, loading, hydrated } = useAuthStore();

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  if (loading || !hydrated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

