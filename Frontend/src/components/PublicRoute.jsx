import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const PublicRoute = () => {
    const { user, loading } = useUser();

    if (loading) {
        return null;
    }

    return user ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

export default PublicRoute;
