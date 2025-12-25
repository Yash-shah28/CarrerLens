import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import Skeleton from './ui/Skeleton';
import { Menu, X, LogOut, User as UserIcon } from 'lucide-react';
import Magnetic from './Magnetic';

const Navbar = () => {
    const { user, logout, loading } = useUser();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        setIsMenuOpen(false);
        navigate('/login');
    };

    return (
        <nav className="bg-slate-900/60 border-b border-slate-800/50 sticky top-0 z-50 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <Magnetic strength={0.2}>
                        <Link to="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent flex items-center gap-3 group">
                            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center group-hover:rotate-[360deg] transition-transform duration-700 ease-in-out">
                                <div className="w-5 h-5 border-2 border-white rounded-md rotate-45 group-hover:scale-110 transition-transform"></div>
                            </div>
                            <span className="tracking-tight">CarrerLens</span>
                        </Link>
                    </Magnetic>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-10">
                        {loading ? (
                            <Skeleton className="h-8 w-24 rounded-lg" />
                        ) : user ? (
                            <div className="flex items-center gap-8">
                                <Magnetic strength={0.3}>
                                    <div className="flex items-center gap-2.5 px-4 py-2 bg-slate-800/40 rounded-full border border-slate-700/50 hover:border-blue-500/30 transition-all cursor-pointer">
                                        <div className="w-7 h-7 bg-blue-500/20 rounded-full flex items-center justify-center">
                                            <UserIcon className="w-4 h-4 text-blue-400" />
                                        </div>
                                        <span className="text-slate-300 text-sm font-medium">
                                            Hi, <span className="text-white font-bold">{user.fullName.split(' ')[0]}</span>
                                        </span>
                                    </div>
                                </Magnetic>
                                <Magnetic strength={0.4}>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 text-slate-400 hover:text-red-400 px-2 py-2 rounded-xl transition-all duration-300 group"
                                    >
                                        <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                        <span className="text-sm font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">Logout</span>
                                    </button>
                                </Magnetic>
                            </div>
                        ) : (
                            <div className="flex items-center gap-8">
                                <Magnetic strength={0.3}>
                                    <Link to="/login" className="text-slate-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">
                                        Login
                                    </Link>
                                </Magnetic>
                                <Magnetic strength={0.5}>
                                    <Link to="/register" className="bg-blue-600 hover:bg-blue-500 text-white px-7 py-3 rounded-2xl transition-all duration-300 shadow-lg shadow-blue-600/20 text-sm font-bold uppercase tracking-widest">
                                        Get Started
                                    </Link>
                                </Magnetic>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`md:hidden overflow-hidden transition-all duration-300 border-t border-slate-800 bg-slate-900 ${isMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-4 pt-2 pb-6 space-y-4">
                    {loading ? (
                        <div className="space-y-4 py-2">
                            <Skeleton className="h-10 w-full rounded-xl" />
                            <Skeleton className="h-10 w-full rounded-xl" />
                        </div>
                    ) : user ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 px-3 py-3 bg-slate-800/50 rounded-xl border border-slate-700">
                                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                                    <UserIcon className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-white font-medium">{user.fullName}</p>
                                    <p className="text-slate-400 text-xs">{user.email || user.username}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 bg-red-500/10 text-red-500 py-3 rounded-xl border border-red-500/20 font-medium"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3 pt-2">
                            <Link
                                to="/login"
                                onClick={() => setIsMenuOpen(false)}
                                className="flex items-center justify-center text-slate-300 hover:text-white py-3 rounded-xl font-medium"
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                onClick={() => setIsMenuOpen(false)}
                                className="flex items-center justify-center bg-blue-600 text-white py-3 rounded-xl font-medium shadow-lg shadow-blue-600/20"
                            >
                                Get Started
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
