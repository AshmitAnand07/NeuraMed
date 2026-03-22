"use client";

import React, { useState, useEffect } from 'react';
import { 
    LayoutDashboard, 
    Calendar, 
    Clock, 
    User, 
    LogOut, 
    ShieldAlert,
    Filter,
    ChevronDown,
    Activity,
    CheckCircle2,
    XCircle,
    Info
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { authHeaders } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import ProfilePanel from '@/components/ProfilePanel';

interface LogEntry {
    _id: string;
    medicineName: string;
    familyMemberName: string;
    actionTime: string;
    status: 'Taken' | 'Missed' | 'Refused';
    createdAt: string;
}

export default function HistoryPage() {
    const { user, loading: authLoading, logout } = useAuth();
    const router = useRouter();
    
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [familyMembers, setFamilyMembers] = useState<{_id: string, name: string}[]>([]);
    const [selectedMember, setSelectedMember] = useState('all');
    const [loading, setLoading] = useState(true);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    useEffect(() => {
        fetchFamilyMembers();
    }, []);

    useEffect(() => {
        fetchLogs();
    }, [selectedMember]);

    const fetchFamilyMembers = async () => {
        try {
            const res = await fetch('/api/family-members', { credentials: 'include', headers: authHeaders() });
            if (res.ok) setFamilyMembers(await res.json());
        } catch (error) {
            console.error('Failed to fetch family members');
        }
    };

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const url = new URL('/api/logs', window.location.origin);
            if (selectedMember !== 'all') {
                url.searchParams.append('familyMemberId', selectedMember);
            }
            const res = await fetch(url.toString(), { credentials: 'include', headers: authHeaders() });
            if (res.ok) {
                const data = await res.json();
                setLogs(data);
            }
        } catch (error) {
            console.error('Failed to fetch logs', error);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-[100dvh] flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-bold animate-pulse">Loading Logs...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        router.push('/login');
        return null;
    }

    const lastTaken = logs.find(log => log.status === 'Taken');

    const getStatusIcon = (status: string) => {
        if (status === 'Taken') return <CheckCircle2 className="text-emerald-500 w-5 h-5" />;
        if (status === 'Refused') return <XCircle className="text-red-500 w-5 h-5" />;
        return <Info className="text-orange-500 w-5 h-5" />;
    };

    const getStatusColor = (status: string) => {
        if (status === 'Taken') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        if (status === 'Refused') return 'bg-red-50 text-red-700 border-red-200';
        return 'bg-orange-50 text-orange-700 border-orange-200';
    };

    const formatDate = (dateString: string) => {
        const d = new Date(dateString);
        return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const formatTime = (dateString: string) => {
        const d = new Date(dateString);
        return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    return (
        <div className="min-h-screen bg-gray-50/50 flex">
            {/* Sidebar */}
            <aside className="w-80 bg-white border-r border-gray-100 flex-col hidden lg:flex">
                <div className="p-8">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-12 h-12 bg-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-200">
                            <ShieldAlert className="text-white w-7 h-7" />
                        </div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">NeuraMed AI</h1>
                    </div>

                    <nav className="space-y-2">
                        <button onClick={() => router.push('/dashboard')} className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-gray-400 font-black hover:bg-gray-50 transition-all">
                            <LayoutDashboard size={22} />
                            Dashboard
                        </button>
                        <button className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl bg-teal-50 text-teal-600 font-black transition-all">
                            <Calendar size={22} />
                            Logs
                        </button>
                        <button onClick={() => router.push('/inventory')} className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-gray-400 font-black hover:bg-gray-50 transition-all">
                            <Clock size={22} />
                            Inventory
                        </button>
                        <button onClick={() => setIsProfileOpen(true)} className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-gray-400 font-black hover:bg-gray-50 transition-all">
                            <User size={22} />
                            Family Profile
                        </button>
                    </nav>
                </div>

                <div className="mt-auto p-8">
                    <button 
                        onClick={logout}
                        className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-red-400 font-black hover:bg-red-50 transition-all"
                    >
                        <LogOut size={22} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto h-screen custom-scrollbar">
                {/* Header */}
                <header className="sticky top-0 z-30 bg-gray-50/80 backdrop-blur-md px-8 py-6 border-b border-gray-100">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h2 className="text-3xl font-black text-gray-900 leading-tight">Medicine Intake Logs</h2>
                            <p className="text-gray-500 font-bold text-sm mt-1">Track history and adherence</p>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Family Member Filter */}
                            <div className="relative">
                                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
                                <select 
                                    className="pl-11 pr-10 py-3 bg-white border-2 border-gray-50 rounded-2xl focus:border-teal-500 outline-none font-bold text-sm appearance-none cursor-pointer shadow-sm min-w-[180px]"
                                    value={selectedMember}
                                    onChange={(e) => setSelectedMember(e.target.value)}
                                >
                                    <option value="all">Every Member</option>
                                    <option value="self">Only Me</option>
                                    {familyMembers.map(fm => (
                                        <option key={fm._id} value={fm._id}>{fm.name}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4 pointer-events-none" />
                            </div>

                            <button
                                onClick={() => setIsProfileOpen(true)}
                                className="w-14 h-14 bg-white border-2 border-gray-100 rounded-2xl flex items-center justify-center hover:bg-gray-50 transition active:scale-95 shadow-sm"
                            >
                                <User className="text-gray-400" size={24} />
                            </button>
                        </div>
                    </div>
                </header>

                <div className="p-8 max-w-5xl mx-auto space-y-10">
                    
                    {/* Recent Activity Section */}
                    {lastTaken && (
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm animate-in zoom-in-95 duration-500">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600">
                                    <Activity size={20} />
                                </div>
                                <h3 className="text-xl font-black text-gray-900">Last Medicine Taken</h3>
                            </div>
                            
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gray-50/50 p-6 rounded-2xl border border-gray-100/50">
                                <div>
                                    <p className="text-2xl font-black text-gray-900">{lastTaken.medicineName}</p>
                                    <p className="text-sm font-bold text-gray-500 mt-1">Taken by: <span className="text-teal-600">{lastTaken.familyMemberName}</span></p>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <p className="text-lg font-black text-gray-900">{formatTime(lastTaken.createdAt)}</p>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{formatDate(lastTaken.createdAt)}</p>
                                    </div>
                                    <div className="px-4 py-2 bg-emerald-100 text-emerald-800 font-bold rounded-xl border border-emerald-200">
                                        ✔ Taken
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Timeline */}
                    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                        <h3 className="text-xl font-black text-gray-900 mb-8">Log History</h3>
                        
                        {loading ? (
                            <div className="flex justify-center py-20">
                                <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : logs.length === 0 ? (
                            <div className="text-center py-20">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Calendar className="w-8 h-8 text-gray-300" />
                                </div>
                                <h4 className="text-lg font-black text-gray-900">No Logs Found</h4>
                                <p className="text-gray-500 font-medium mt-1">No medicine intake history recorded yet.</p>
                            </div>
                        ) : (
                            <div className="relative border-l-2 border-gray-100 ml-4 space-y-8 pb-4">
                                {logs.map((log) => (
                                    <div key={log._id} className="relative pl-8">
                                        {/* Timeline Dot */}
                                        <div className="absolute -left-[11px] top-1.5 w-5 h-5 bg-white border-2 border-teal-500 rounded-full shadow-sm"></div>
                                        
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="text-sm font-black text-gray-900">{formatTime(log.createdAt)}</span>
                                                    <span className="text-xs font-bold text-gray-400">– {log.actionTime}</span>
                                                </div>
                                                <p className="text-base font-medium text-gray-700">
                                                    <span className="font-black text-teal-700">{log.familyMemberName}</span> 
                                                    {log.status === 'Taken' ? ' took ' : ' missed/refused '} 
                                                    <span className="font-black text-gray-900">{log.medicineName}</span>
                                                </p>
                                            </div>

                                            <div className={`px-4 py-1.5 rounded-full border text-xs font-bold flex items-center gap-2 ${getStatusColor(log.status)}`}>
                                                {getStatusIcon(log.status)}
                                                {log.status}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </main>

            <ProfilePanel isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
        </div>
    );
}
