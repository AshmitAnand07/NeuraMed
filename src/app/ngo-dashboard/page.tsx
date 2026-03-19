"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import {
    Heart, Package, CheckCircle2, MapPin, Phone, Calendar,
    User, Globe, FileText, Search, Clock, ArrowRight,
    Sparkles, TrendingUp, AlertCircle, ChevronRight, X,
    Shield, ShieldCheck, Mail, Building2, HandHeart, Loader2
} from 'lucide-react';

interface Donation {
    _id: string;
    medicineId: {
        _id: string;
        name: string;
        expiryDate: string;
        quantityStrips?: number;
        quantityTablets?: number;
        status: string;
    };
    donorId: {
        name: string;
        email: string;
        phone?: string;
    };
    ngoName?: string;
    pickupAddress?: string;
    pickupDate?: string;
    phone?: string;
    status: 'pending' | 'accepted' | 'collected' | 'rejected';
    pincode: string;
    quantityStrips?: number;
    quantityTablets?: number;
    requestedAt: string;
    completedAt?: string;
}

export default function NgoDashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('donations');
    const [donations, setDonations] = useState<Donation[]>([]);
    const [dataLoading, setDataLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const showToast = useCallback((message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    }, []);

    const fetchDonations = useCallback(async () => {
        try {
            const res = await fetch('/api/donations');
            if (res.ok) {
                const data = await res.json();
                setDonations(data);
            }
        } catch (e) {
            console.error("Failed to fetch donations");
        } finally {
            setDataLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!loading && (!user || user.role !== 'ngo')) {
            router.push('/login');
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (user && user.role === 'ngo') {
            fetchDonations();
        }
    }, [user, fetchDonations]);

    const handleDonationAction = async (donationId: string, action: 'accepted' | 'rejected' | 'collected') => {
        setActionLoading(donationId);
        try {
            const res = await fetch(`/api/donations/${donationId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: action })
            });
            if (res.ok) {
                await fetchDonations();
                const labels = { accepted: 'Donation accepted!', rejected: 'Donation rejected.', collected: 'Donation marked as collected!' };
                showToast(labels[action], action === 'rejected' ? 'error' : 'success');
            } else {
                showToast('Action failed. Please try again.', 'error');
            }
        } catch (e) {
            showToast('Network error. Please try again.', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-emerald-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
                    <p className="text-teal-600 font-medium animate-pulse">Loading your portal...</p>
                </div>
            </div>
        );
    }

    const pendingDonations = donations.filter(d => d.status === 'pending');
    const acceptedDonations = donations.filter(d => d.status === 'accepted');
    const collectedDonations = donations.filter(d => d.status === 'collected');

    const filteredDonations = pendingDonations.filter(d =>
        d.medicineId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.donorId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const activityDonations = [...acceptedDonations, ...collectedDonations].sort(
        (a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
    );

    const stats = [
        {
            label: 'Pending Donations',
            value: pendingDonations.length,
            icon: Package,
            gradient: 'from-amber-400 to-orange-500',
            bgLight: 'bg-amber-50',
            textColor: 'text-amber-600'
        },
        {
            label: 'Accepted',
            value: acceptedDonations.length,
            icon: TrendingUp,
            gradient: 'from-blue-400 to-indigo-500',
            bgLight: 'bg-blue-50',
            textColor: 'text-blue-600'
        },
        {
            label: 'Collected',
            value: collectedDonations.length,
            icon: CheckCircle2,
            gradient: 'from-emerald-400 to-teal-500',
            bgLight: 'bg-emerald-50',
            textColor: 'text-emerald-600'
        },
        {
            label: 'Service Area',
            value: (user as any).pincode || '—',
            icon: MapPin,
            gradient: 'from-purple-400 to-pink-500',
            bgLight: 'bg-purple-50',
            textColor: 'text-purple-600'
        }
    ];

    const tabs = [
        { id: 'donations', label: 'Available Donations', icon: Heart, count: pendingDonations.length },
        { id: 'activity', label: 'My Activity', icon: Clock, count: activityDonations.length },
        { id: 'profile', label: 'Organization', icon: Building2 }
    ];

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    };

    const getDaysUntilExpiry = (dateStr: string) => {
        const days = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return days;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30">
            {/* Toast Notification */}
            {toast && (
                <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-right duration-300">
                    <div className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border ${
                        toast.type === 'success'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'bg-red-50 border-red-200 text-red-800'
                    }`}>
                        {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                        <span className="font-medium text-sm">{toast.message}</span>
                        <button onClick={() => setToast(null)} className="ml-2 opacity-60 hover:opacity-100">
                            <X size={14} />
                        </button>
                    </div>
                </div>
            )}

            {/* ───── Hero Header ───── */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-500" />
                <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }} />
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className={`transition-all duration-700 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="h-12 w-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white text-xl font-bold border border-white/20">
                                    {user.name.charAt(0)}
                                </div>
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-bold text-white">
                                        Welcome back, {user.name}
                                    </h1>
                                    <p className="text-teal-100 text-sm mt-0.5">
                                        Manage donations & make an impact in your community
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className={`transition-all duration-700 delay-200 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm border ${
                                (user as any).isVerified
                                    ? 'bg-emerald-400/20 text-white border-emerald-300/30'
                                    : 'bg-yellow-400/20 text-yellow-100 border-yellow-300/30'
                            }`}>
                                {(user as any).isVerified
                                    ? <><ShieldCheck size={16} className="animate-pulse" /> Verified Organization</>
                                    : <><Shield size={16} /> Verification Pending</>
                                }
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 pb-12">
                {/* ───── Stats Cards ───── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {stats.map((stat, i) => (
                        <div
                            key={stat.label}
                            className={`relative bg-white rounded-2xl shadow-sm border border-gray-100 p-5 overflow-hidden group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-default ${
                                mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                            }`}
                            style={{ transitionDelay: `${i * 100 + 300}ms` }}
                        >
                            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.gradient} opacity-5 rounded-bl-full group-hover:opacity-10 transition-opacity`} />
                            <div className={`inline-flex p-2.5 rounded-xl ${stat.bgLight} mb-3`}>
                                <stat.icon size={22} className={stat.textColor} />
                            </div>
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">{stat.label}</p>
                            <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                                {dataLoading ? (
                                    <span className="inline-block w-10 h-7 bg-gray-100 rounded animate-pulse" />
                                ) : stat.value}
                            </p>
                        </div>
                    ))}
                </div>

                {/* ───── Tab Navigation ───── */}
                <div className="flex gap-1 bg-gray-100/80 p-1 rounded-2xl mb-6 overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                                activeTab === tab.id
                                    ? 'bg-white text-teal-700 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                            {tab.count !== undefined && (
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                    activeTab === tab.id
                                        ? 'bg-teal-100 text-teal-700'
                                        : 'bg-gray-200 text-gray-500'
                                }`}>
                                    {dataLoading ? '…' : tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* ═══════════════════ TAB: Available Donations ═══════════════════ */}
                {activeTab === 'donations' && (
                    <div>
                        {/* Search Bar */}
                        <div className="relative mb-6">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by medicine or donor name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 text-sm transition-all"
                            />
                        </div>

                        {dataLoading ? (
                            /* Loading Skeleton */
                            <div className="grid gap-4 md:grid-cols-2">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-gray-100" />
                                            <div className="flex-1">
                                                <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                                                <div className="h-3 bg-gray-100 rounded w-1/2 mb-4" />
                                                <div className="h-3 bg-gray-100 rounded w-full mb-2" />
                                                <div className="h-3 bg-gray-100 rounded w-2/3" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredDonations.length === 0 ? (
                            /* Empty State */
                            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                                <div className="inline-flex p-4 bg-teal-50 rounded-2xl mb-4">
                                    <Sparkles size={36} className="text-teal-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    {searchTerm ? 'No matching donations found' : 'All caught up!'}
                                </h3>
                                <p className="text-gray-500 max-w-md mx-auto">
                                    {searchTerm
                                        ? `No pending donations match "${searchTerm}". Try a different search.`
                                        : 'There are no pending donations in your area right now. Check back soon!'}
                                </p>
                            </div>
                        ) : (
                            /* Donation Cards */
                            <div className="grid gap-4 md:grid-cols-2">
                                {filteredDonations.map((donation) => {
                                    const daysLeft = getDaysUntilExpiry(donation.medicineId?.expiryDate);
                                    const isUrgent = daysLeft <= 30 && daysLeft > 0;
                                    const isExpired = daysLeft <= 0;

                                    return (
                                        <div
                                            key={donation._id}
                                            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group"
                                        >
                                            {/* Urgency stripe */}
                                            <div className={`h-1 ${isExpired ? 'bg-red-400' : isUrgent ? 'bg-amber-400' : 'bg-emerald-400'}`} />

                                            <div className="p-5">
                                                {/* Medicine Header */}
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-start gap-3">
                                                        <div className={`p-2.5 rounded-xl ${isUrgent ? 'bg-amber-50' : 'bg-teal-50'}`}>
                                                            <Package size={20} className={isUrgent ? 'text-amber-500' : 'text-teal-500'} />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold text-gray-900 text-base">
                                                                {donation.medicineId?.name || 'Unknown Medicine'}
                                                            </h4>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-xs text-gray-500">
                                                                    {donation.quantityStrips || 0} strips · {donation.quantityTablets || 0} tablets
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                                        isExpired ? 'bg-red-100 text-red-700' :
                                                        isUrgent ? 'bg-amber-100 text-amber-700' :
                                                        'bg-emerald-100 text-emerald-700'
                                                    }`}>
                                                        {isExpired ? 'Expired' : isUrgent ? `${daysLeft}d left` : 'Safe'}
                                                    </span>
                                                </div>

                                                {/* Details Grid */}
                                                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <User size={14} className="text-gray-400 flex-shrink-0" />
                                                        <span className="truncate">{donation.donorId?.name || 'Anonymous'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <Phone size={14} className="text-gray-400 flex-shrink-0" />
                                                        <span className="truncate">{donation.phone || donation.donorId?.phone || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                                                        <span className="truncate">{donation.pickupAddress || 'Not specified'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <Calendar size={14} className="text-gray-400 flex-shrink-0" />
                                                        <span className="truncate">
                                                            {donation.pickupDate ? formatDate(donation.pickupDate) : 'Flexible'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Expiry */}
                                                <div className="text-xs text-gray-400 mb-4">
                                                    Expires: {formatDate(donation.medicineId?.expiryDate)} · Requested: {formatDate(donation.requestedAt)}
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleDonationAction(donation._id, 'accepted')}
                                                        disabled={actionLoading === donation._id}
                                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 transition-all duration-200 disabled:opacity-50 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                                                    >
                                                        {actionLoading === donation._id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                                                        Accept
                                                    </button>
                                                    <button
                                                        onClick={() => handleDonationAction(donation._id, 'rejected')}
                                                        disabled={actionLoading === donation._id}
                                                        className="px-4 py-2.5 bg-gray-100 text-gray-600 text-sm font-semibold rounded-xl hover:bg-red-50 hover:text-red-600 transition-all duration-200 disabled:opacity-50"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* ═══════════════════ TAB: My Activity ═══════════════════ */}
                {activeTab === 'activity' && (
                    <div>
                        {dataLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="bg-white rounded-2xl p-5 animate-pulse">
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 bg-gray-100 rounded-xl" />
                                            <div className="flex-1">
                                                <div className="h-4 bg-gray-100 rounded w-1/2 mb-2" />
                                                <div className="h-3 bg-gray-100 rounded w-1/3" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : activityDonations.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                                <div className="inline-flex p-4 bg-blue-50 rounded-2xl mb-4">
                                    <Clock size={36} className="text-blue-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No activity yet</h3>
                                <p className="text-gray-500 max-w-md mx-auto">
                                    Once you accept or collect donations, your activity will appear here.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {activityDonations.map(donation => (
                                    <div
                                        key={donation._id}
                                        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-all duration-200"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={`p-2.5 rounded-xl flex-shrink-0 ${
                                                donation.status === 'collected' ? 'bg-emerald-50' : 'bg-blue-50'
                                            }`}>
                                                {donation.status === 'collected'
                                                    ? <CheckCircle2 size={20} className="text-emerald-500" />
                                                    : <HandHeart size={20} className="text-blue-500" />
                                                }
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">
                                                    {donation.medicineId?.name || 'Unknown Medicine'}
                                                </h4>
                                                <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <User size={12} /> {donation.donorId?.name || 'Anonymous'}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Package size={12} /> {donation.quantityStrips || 0}s · {donation.quantityTablets || 0}t
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar size={12} /> {formatDate(donation.requestedAt)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 sm:flex-shrink-0">
                                            <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                                                donation.status === 'collected'
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : 'bg-blue-100 text-blue-700'
                                            }`}>
                                                {donation.status === 'collected' ? '✓ Collected' : '⏳ Accepted'}
                                            </span>
                                            {donation.status === 'accepted' && (
                                                <button
                                                    onClick={() => handleDonationAction(donation._id, 'collected')}
                                                    disabled={actionLoading === donation._id}
                                                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50 shadow-sm hover:shadow-md"
                                                >
                                                    {actionLoading === donation._id
                                                        ? <Loader2 size={14} className="animate-spin" />
                                                        : <CheckCircle2 size={14} />
                                                    }
                                                    Mark Collected
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ═══════════════════ TAB: Organization Profile ═══════════════════ */}
                {activeTab === 'profile' && (
                    <div className="max-w-3xl">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            {/* Profile Header */}
                            <div className="relative h-28 bg-gradient-to-r from-teal-500 to-emerald-400">
                                <div className="absolute -bottom-8 left-6">
                                    <div className="h-16 w-16 bg-white rounded-2xl shadow-lg flex items-center justify-center text-teal-600 text-2xl font-bold border-4 border-white">
                                        {user.name.charAt(0)}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-12 pb-6 px-6">
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
                                    {(user as any).isVerified && (
                                        <ShieldCheck size={18} className="text-emerald-500" />
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 mb-6">{user.email}</p>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    {[
                                        { icon: MapPin, label: 'Address', value: (user as any).address },
                                        { icon: Phone, label: 'Phone', value: (user as any).phone },
                                        { icon: Globe, label: 'Website', value: (user as any).website, isLink: true },
                                        { icon: Mail, label: 'Pincode', value: (user as any).pincode },
                                    ].map(item => (
                                        <div key={item.label} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/80">
                                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                                <item.icon size={16} className="text-teal-500" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{item.label}</p>
                                                {item.isLink && item.value ? (
                                                    <a href={item.value} target="_blank" rel="noopener noreferrer"
                                                       className="text-sm text-teal-600 hover:underline break-all">
                                                        {item.value}
                                                    </a>
                                                ) : (
                                                    <p className="text-sm text-gray-900">{item.value || 'Not provided'}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {(user as any).description && (
                                    <div className="mt-4 p-4 rounded-xl bg-gray-50/80">
                                        <div className="flex items-center gap-2 mb-2">
                                            <FileText size={14} className="text-teal-500" />
                                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">About</p>
                                        </div>
                                        <p className="text-sm text-gray-700 leading-relaxed">{(user as any).description}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
