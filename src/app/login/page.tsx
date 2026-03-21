"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Login failed');
            }

            login(data.user);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <div>
                    <h2 className="mt-6 text-center text-3xl sm:text-4xl font-extrabold text-gray-900">
                        Welcome Back
                    </h2>
                    <p className="mt-3 text-center text-base sm:text-lg text-gray-600">
                        Sign in to manage your medicine inventory
                    </p>
                </div>
                <form className="mt-8 space-y-6 sm:space-y-8" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-4 rounded-xl text-base font-medium text-center">
                            {error}
                        </div>
                    )}
                    <div className="rounded-xl shadow-sm space-y-4">
                        <div>
                            <label className="block text-base font-medium text-gray-700 mb-1 pl-1">Email Address</label>
                            <input
                                type="email"
                                required
                                className="appearance-none relative block w-full px-4 py-4 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-lg transition-colors"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-base font-medium text-gray-700 mb-1 pl-1">Password</label>
                            <input
                                type="password"
                                required
                                className="appearance-none relative block w-full px-4 py-4 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-lg transition-colors"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-4 px-6 border border-transparent text-lg font-bold rounded-xl text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
                        >
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </div>

                    <div className="text-center pt-4">
                        <p className="text-base text-gray-600">
                            Don't have an account?{' '}
                            <Link href="/register" className="font-bold text-teal-600 hover:text-teal-700 p-2 -m-2">
                                Register here
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
