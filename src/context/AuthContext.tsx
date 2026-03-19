"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'ngo' | 'admin';
    pincode?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (userData: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkUser = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                } else {
                    setUser(null);
                    localStorage.removeItem('medicare_user');
                }
            } catch (error) {
                if (process.env.NODE_ENV === 'development') {
                    console.error("Session check failed", error);
                }
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkUser();
    }, []);

    const login = (userData: User) => {
        setUser(userData);
        // localStorage is kept as a backup/quick access but source of truth is cookie
        localStorage.setItem('medicare_user', JSON.stringify(userData));

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
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (error) {
            console.error("Logout failed", error);
        }

        setUser(null);
        localStorage.removeItem('medicare_user');
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
