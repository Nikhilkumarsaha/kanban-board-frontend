import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth-store';

export function PrivateRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}