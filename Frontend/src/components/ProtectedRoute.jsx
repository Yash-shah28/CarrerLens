import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const ProtectedRoute = () => {
    const { user, loading } = useUser();

    if (loading) {
        return null; // Or a loading spinner, but App.jsx handles global loading
    }

    return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
