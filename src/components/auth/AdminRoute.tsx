import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminRoute() {
    const { isLoggedIn, isAdmin } = useAuth();

    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    if (!isAdmin) {
        return <Navigate to="/app/home" replace />;
    }

    return <AdminLayout />;
}
