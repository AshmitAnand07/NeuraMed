"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'patient' | 'caretaker' | 'ngo' | 'admin';
    pincode?: string;
    phone?: string;
    createdAt?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (userData: User, token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Pages that require authentication
const PROTECTED_PATHS = ['/dashboard', '/add-medicine', '/inventory', '/history', '/caretaker'];

// Helper: get stored token
export function getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
}

// Helper: build auth headers - use this in all API calls
export function authHeaders(): HeadersInit {
    const token = getStoredToken();
    return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const handleAuthFailure = async () => {
            clearAuth();
            try {
                await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
            } catch (e) {
                console.error("Failed to clear cookie", e);
            }
            redirectIfProtected();
        };

        const checkUser = async () => {
            try {
                const token = getStoredToken();
                const res = await fetch('/api/auth/me', {
                    credentials: 'include',
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data?.user) {
                        setUser(data.user);
                    } else {
                        await handleAuthFailure();
                    }
                } else {
                    await handleAuthFailure();
                }
            } catch (error) {
                console.error("Session check failed", error);
                await handleAuthFailure();
            } finally {
                setLoading(false);
            }
        };

        const redirectIfProtected = () => {
            if (PROTECTED_PATHS.some(p => pathname?.startsWith(p))) {
                router.push('/login');
            }
        };

        checkUser();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const clearAuth = () => {
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('neuramed_user');
    };

    const login = (userData: User, token: string) => {
        if (!userData || !token) return;

        // Store token in localStorage so it can be sent as Bearer header
        localStorage.setItem('token', token);
        localStorage.setItem('neuramed_user', JSON.stringify(userData));
        setUser(userData);

        // Redirect based on role
        if (userData.role === 'ngo') {
            router.push('/ngo-dashboard');
        } else if (userData.role === 'admin') {
            router.push('/admin-dashboard');
        } else {
            router.push('/dashboard');
        }
    };

    const logout = async () => {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });
        } catch (error) {
            console.error("Logout failed", error);
        }

        clearAuth();
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
