import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function ProtectedRoute() {
    const { isLoggedIn } = useAuth();

    if (!isLoggedIn) {
        // Redirect to login if not authenticated
        return <Navigate to="/login" replace />;
    }

    // Render child routes if authenticated
    return <Outlet />;
}

export function PublicRoute() {
    const { isLoggedIn } = useAuth();

    if (isLoggedIn) {
        // Redirect to app if already authenticated
        return <Navigate to="/app/dashboard" replace />;
    }

    // Render child routes (like login/register) if not authenticated
    return <Outlet />;
}
