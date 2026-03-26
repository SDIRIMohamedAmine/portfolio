import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Shows a spinner while auth state is resolving,
// then redirects unauthenticated users to /admin-space/login
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-border-bright border-t-accent-gold rounded-full animate-spin" />
          <p className="font-mono text-xs text-text-muted">Checking auth…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin-space/login" replace />;
  }

  return children;
}
