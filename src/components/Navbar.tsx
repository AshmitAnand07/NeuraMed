"use client";

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Menu, X, Pill, LogOut, User as UserIcon, Home, Package, Heart, Plus } from 'lucide-react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const pathname = usePathname();

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true);
        setIsOpen(false);
    };

    const confirmLogout = () => {
        logout();
        setShowLogoutConfirm(false);
    };

    const isActive = (path: string) => {
        return pathname === path ? "text-teal-700 font-bold bg-teal-50 px-4 py-2 rounded-lg text-lg" : "text-gray-600 hover:text-teal-600 font-medium transition px-4 py-2 text-lg";
    };

    const isActiveMobile = (path: string) => {
        return pathname === path ? "block px-4 py-3 rounded-lg text-xl font-bold text-teal-800 bg-teal-100" : "block px-4 py-3 rounded-lg text-xl font-medium text-gray-700 hover:text-teal-600 hover:bg-gray-50";
    };

    const isBottomActive = (paths: string[]) => {
        return paths.some(p => pathname.includes(p)) ? "text-teal-600" : "text-gray-400 hover:text-teal-500";
    };

    const getDashboardPath = () => {
        if (!user) return '/';
        if (user.role === 'admin') return '/admin-dashboard';
        if (user.role === 'ngo') return '/ngo-dashboard';
        return '/dashboard';
    };

    return (
        <>
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full transform transition-all scale-100 border border-gray-100">
                        <div className="flex flex-col items-center text-center">
                            <div className="bg-red-50 p-4 rounded-full mb-5">
                                <LogOut className="h-10 w-10 text-red-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Log Out?</h3>
                            <p className="text-gray-600 mb-8 text-lg">
                                Are you sure you want to log out? You will need to sign in again to access your account.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 w-full">
                                <button
                                    onClick={() => setShowLogoutConfirm(false)}
                                    className="flex-1 px-6 py-4 bg-gray-100 text-gray-800 font-bold rounded-xl hover:bg-gray-200 transition duration-200 text-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmLogout}
                                    className="flex-1 px-6 py-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition duration-200 shadow-sm text-lg"
                                >
                                    Log Out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Top Navbar */}
            <nav className="bg-white shadow-sm border-b border-teal-100 relative z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20">
                        <div className="flex items-center">
                            <Link href="/" className="flex-shrink-0 flex items-center gap-3">
                                <div className="bg-teal-600 p-2 rounded-xl">
                                    <Pill className="h-8 w-8 text-white" />
                                </div>
                                <span className="font-bold text-3xl text-teal-800 tracking-tight">NeuraMed AI</span>
                            </Link>
                        </div>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center space-x-2">
                            <Link href="/about" className={isActive('/about')}>About</Link>
                            <Link href="/how-it-works" className={isActive('/how-it-works')}>How It Works</Link>

                            {user ? (
                                <div className="flex items-center gap-6 ml-8">
                                    <Link href={getDashboardPath()}>
                                        <span className={`cursor-pointer px-4 py-2 text-lg ${pathname.includes('dashboard') ? 'text-teal-700 font-bold border-b-4 border-teal-600' : 'text-gray-600 font-medium hover:text-teal-600'}`}>
                                            {user.role === 'ngo' ? 'NGO Portal' : 'Dashboard'}
                                        </span>
                                    </Link>
                                    <div className="flex items-center gap-4 border-l-2 pl-6 border-gray-200">
                                        <span className="text-lg text-gray-700 font-medium">Hi, {user.name}</span>
                                        <button
                                            onClick={handleLogoutClick}
                                            className="text-red-500 hover:text-red-700 p-2 rounded-xl hover:bg-red-50 transition flex items-center gap-2"
                                            title="Logout"
                                        >
                                            <LogOut size={24} />
                                            <span className="font-medium">Logout</span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4 ml-6">
                                    <Link href="/login" className="text-teal-700 font-bold text-lg hover:underline px-4">Log in</Link>
                                    <Link href="/register" className="bg-teal-600 text-white px-6 py-3 rounded-full font-bold text-lg hover:bg-teal-700 transition shadow-sm hover:shadow-md">
                                        Get Started
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile Hamburger (Only for unauthenticated or non-core pages) */}
                        <div className="md:hidden flex items-center">
                            {user && <span className="mr-4 font-bold text-gray-700">Hi, {user.name.split(' ')[0]}</span>}
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="text-gray-600 hover:text-teal-600 focus:outline-none p-2 bg-gray-50 rounded-lg"
                            >
                                {isOpen ? <X size={32} /> : <Menu size={32} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Dropdown Menu (For About/How it Works/Logout) */}
                {isOpen && (
                    <div className="md:hidden bg-white border-t border-gray-100 pb-6 pt-4 absolute w-full shadow-2xl z-50">
                        <div className="px-4 space-y-3">
                            <Link href="/about" onClick={() => setIsOpen(false)} className={isActiveMobile('/about')}>About</Link>
                            <Link href="/how-it-works" onClick={() => setIsOpen(false)} className={isActiveMobile('/how-it-works')}>How It Works</Link>
                            {user ? (
                                <>
                                    <Link href={getDashboardPath()} onClick={() => setIsOpen(false)} className={isActiveMobile('/dashboard')}>Dashboard</Link>
                                    <button onClick={handleLogoutClick} className="w-full text-left block px-4 py-3 rounded-lg text-xl font-bold text-red-600 bg-red-50 hover:bg-red-100 mt-4">
                                        Log Out
                                    </button>
                                </>
                            ) : (
                                <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
                                    <Link href="/login" onClick={() => setIsOpen(false)} className="block w-full text-center px-4 py-4 rounded-xl text-xl font-bold text-teal-700 bg-teal-50">Log in</Link>
                                    <Link href="/register" onClick={() => setIsOpen(false)} className="block w-full text-center px-4 py-4 rounded-xl text-xl font-bold text-white bg-teal-600">Register Now</Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            {/* Mobile Bottom Navigation Bar (App-like feel) */}
            <div className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around items-center h-20 z-40 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <Link href={getDashboardPath()} className={`flex flex-col items-center justify-center w-full h-full ${pathname === '/' || pathname.includes('dashboard') ? 'text-teal-600' : 'text-gray-400 hover:text-teal-500'}`}>
                    <Home size={28} strokeWidth={pathname.includes('dashboard') ? 2.5 : 2} />
                    <span className="text-xs font-bold mt-1">Home</span>
                </Link>
                
                <Link href="/inventory" className={`flex flex-col items-center justify-center w-full h-full ${pathname === '/inventory' ? 'text-teal-600' : 'text-gray-400 hover:text-teal-500'}`}>
                    <Package size={28} strokeWidth={pathname === '/inventory' ? 2.5 : 2} />
                    <span className="text-xs font-bold mt-1">Inventory</span>
                </Link>

                {/* Floating Action Button for Scan/Add */}
                <Link href="/add-medicine" className="relative -top-6 flex flex-col items-center justify-center">
                    <div className="h-16 w-16 bg-teal-600 rounded-full flex items-center justify-center text-white shadow-xl border-4 border-white transform transition hover:scale-105 active:scale-95">
                        <Plus size={36} strokeWidth={2.5} />
                    </div>
                    <span className="text-xs font-bold text-gray-700 mt-1 absolute -bottom-5">Scan</span>
                </Link>

                <Link href="/donations" className={`flex flex-col items-center justify-center w-full h-full ${pathname === '/donations' ? 'text-teal-600' : 'text-gray-400 hover:text-teal-500'}`}>
                    <Heart size={28} strokeWidth={pathname === '/donations' ? 2.5 : 2} />
                    <span className="text-xs font-bold mt-1">Donations</span>
                </Link>

                {user ? (
                    <button onClick={handleLogoutClick} className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-red-500">
                        <UserIcon size={28} />
                        <span className="text-xs font-bold mt-1">Profile</span>
                    </button>
                ) : (
                    <Link href="/login" className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-teal-500">
                        <UserIcon size={28} />
                        <span className="text-xs font-bold mt-1">Login</span>
                    </Link>
                )}
            </div>
        </>
    );
}
