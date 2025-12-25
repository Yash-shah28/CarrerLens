import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import Skeleton from './ui/Skeleton';

const Navbar = () => {
    const { user, logout, loading } = useUser();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex justify-between items-center sticky top-0 z-50 backdrop-blur-md bg-slate-900/80">
            <Link to="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                CarrerLens
            </Link>
            <div className="flex items-center gap-6">
                {loading ? (
                    <Skeleton className="h-8 w-20 rounded-lg" />
                ) : user ? (
                    <>
                        <span className="text-slate-300">Welcome, <span className="text-white font-medium">{user.fullName}</span></span>
                        <button
                            onClick={handleLogout}
                            className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-4 py-2 rounded-lg transition-all duration-200 border border-red-500/20 shadow-lg shadow-red-500/10"
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="text-slate-300 hover:text-white transition-colors">Login</Link>
                        <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition-all duration-200 shadow-lg shadow-blue-600/20">
                            Get Started
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
