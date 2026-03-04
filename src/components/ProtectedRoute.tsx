import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    allowedRoles?: ('student' | 'teacher' | 'admin')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
    const { user, loading, isAuthenticated } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect the user to their appropriate dashboard based on their role
        switch (user.role) {
            case 'admin':
                return <Navigate to="/dashboard/admin" replace />;
            case 'teacher':
                return <Navigate to="/dashboard/faculty" replace />;
            case 'student':
            default:
                return <Navigate to="/dashboard/student" replace />;
        }
    }

    return <Outlet />;
};

export default ProtectedRoute;
