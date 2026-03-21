"use client";

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Menu, X, Pill, LogOut, User as UserIcon } from 'lucide-react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const pathname = usePathname();

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true);
        setIsOpen(false); // Close mobile menu if open
    };

    const confirmLogout = () => {
        logout();
        setShowLogoutConfirm(false);
    };

    const isActive = (path: string) => {
        return pathname === path ? "text-teal-700 font-bold bg-teal-50 px-3 py-1 rounded-lg" : "text-gray-600 hover:text-teal-600 font-medium transition px-3 py-1";
    };

    const isActiveMobile = (path: string) => {
        return pathname === path ? "block px-3 py-2 rounded-md text-base font-bold text-teal-800 bg-teal-100" : "block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-teal-600 hover:bg-gray-50";
    };

    return (
        <>
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full transform transition-all scale-100 border border-gray-100">
                        <div className="flex flex-col items-center text-center">
                            <div className="bg-red-50 p-3 rounded-full mb-4">
                                <LogOut className="h-8 w-8 text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Log Out?</h3>
                            <p className="text-gray-500 mb-6 text-sm">
                                Are you sure you want to log out of your account? You will need to sign in again to access.
                            </p>
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setShowLogoutConfirm(false)}
                                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmLogout}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition duration-200 shadow-sm"
                                >
                                    Log Out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <nav className="bg-white shadow-md border-b border-teal-100 relative z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Link href="/" className="flex-shrink-0 flex items-center gap-2">
                                <div className="bg-teal-600 p-1.5 rounded-lg">
                                    <Pill className="h-6 w-6 text-white" />
                                </div>
                                <span className="font-bold text-2xl text-teal-800 tracking-tight">NeuraMed AI</span>
                            </Link>
                        </div>

                        <div className="hidden md:flex items-center space-x-2">
                            <Link href="/about" className={isActive('/about')}>About</Link>
                            <Link href="/how-it-works" className={isActive('/how-it-works')}>How It Works</Link>

                            {user ? (
                                <div className="flex items-center gap-4 ml-6">
                                    <Link href={user.role === 'user' ? '/dashboard' : user.role === 'ngo' ? '/ngo-dashboard' : '/admin-dashboard'}>
                                        <span className={`cursor-pointer ${pathname.includes('dashboard') ? 'text-teal-700 font-bold border-b-2 border-teal-600' : 'text-gray-600 font-medium hover:text-teal-600'}`}>
                                            {user.role === 'ngo' ? 'NGO Portal' : 'Dashboard'}
                                        </span>
                                    </Link>
                                    <div className="flex items-center gap-2 border-l pl-4 border-gray-200">
                                        <span className="text-sm text-gray-500">Hi, {user.name}</span>
                                        <button
                                            onClick={handleLogoutClick}
                                            className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition"
                                            title="Logout"
                                        >
                                            <LogOut size={20} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4 ml-4">
                                    <Link href="/login" className="text-teal-700 font-medium hover:underline">Log in</Link>
                                    <Link href="/register" className="bg-teal-600 text-white px-5 py-2 rounded-full font-medium hover:bg-teal-700 transition shadow-sm hover:shadow-md">
                                        Get Started
                                    </Link>
                                </div>
                            )}
                        </div>

                        <div className="md:hidden flex items-center">
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="text-gray-600 hover:text-teal-600 focus:outline-none"
                            >
                                {isOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                {isOpen && (
                    <div className="md:hidden bg-white border-t border-gray-100 pb-4 absolute w-full shadow-lg">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            <Link href="/about" className={isActiveMobile('/about')}>About</Link>
                            <Link href="/how-it-works" className={isActiveMobile('/how-it-works')}>How It Works</Link>
                            {user ? (
                                <>
                                    <Link href="/dashboard" className={isActiveMobile('/dashboard')}>Dashboard</Link>
                                    <button onClick={handleLogoutClick} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50">Logout</button>
                                </>
                            ) : (
                                <>
                                    <Link href="/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-teal-600">Log in</Link>
                                    <Link href="/register" className="block px-3 py-2 rounded-md text-base font-medium text-teal-600 font-bold">Register</Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </nav>
        </>
    );
}
