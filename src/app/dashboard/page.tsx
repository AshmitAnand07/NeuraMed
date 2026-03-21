"use client";

import React, { useState, useEffect } from 'react';
import { 
    LayoutDashboard, 
    Bell, 
    Calendar, 
    Settings, 
    LogOut, 
    Plus,
    Search,
    AlertTriangle,
    CheckCircle2,
    Clock,
    User,
    ChevronDown,
    Filter,
    ShieldAlert,
    AlertCircle,
    Info,
    ClipboardList
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { authHeaders } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import MedicineSchedule from '@/components/MedicineSchedule';
import ProfilePanel from '@/components/ProfilePanel';

interface Medicine {
    _id: string;
    name: string;
    dosage?: string;
    time: string;
    frequency: string;
    lastTakenDate?: string;
    familyMember: string;
    familyMemberId?: string;
    refusalCount: number;
    isRefused: boolean;
}

interface Alert {
    _id: string;
    patientId: { _id: string; name: string };
    medicineId: { _id: string; name: string };
    familyMemberId?: { _id: string; name: string } | string;
    message: string;
    type: 'info' | 'critical';
    createdAt: string;
}

export default function DashboardPage() {
    const { user, loading: authLoading, logout } = useAuth();
    const router = useRouter();
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [familyMembers, setFamilyMembers] = useState<{_id: string, name: string}[]>([]);
    const [selectedMember, setSelectedMember] = useState('all');
    const [loading, setLoading] = useState(true);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    useEffect(() => {
        fetchData();
        fetchFamilyMembers();
    }, []);

    const fetchData = async () => {
        try {
            const headers = authHeaders();
            const [medsRes, alertsRes] = await Promise.all([
                fetch('/api/medicines', { credentials: 'include', headers }),
                fetch('/api/alerts', { credentials: 'include', headers })
            ]);
            
            if (medsRes.ok) {
                const data = await medsRes.json();
                setMedicines(Array.isArray(data) ? data : []);
            }
            if (alertsRes.ok) {
                const data = await alertsRes.json();
                setAlerts(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchFamilyMembers = async () => {
        try {
            const res = await fetch('/api/family-members', { credentials: 'include', headers: authHeaders() });
            if (res.ok) setFamilyMembers(await res.json());
        } catch (error) {
            console.error('Failed to fetch family members');
        }
    };

    const filteredMedicines = selectedMember === 'all' 
        ? medicines 
        : medicines.filter(m => m.familyMemberId === selectedMember || (selectedMember === 'self' && !m.familyMemberId));

    // Group alerts by family member
    const groupedAlerts = alerts.reduce((acc: Record<string, Alert[]>, alert) => {
        let memberName = 'Self';
        
        if (alert.familyMemberId) {
            if (alert.familyMemberId && typeof alert.familyMemberId === 'object' && 'name' in alert.familyMemberId) {
                memberName = alert.familyMemberId.name;
            } else {
                const fm = familyMembers.find(f => f._id === alert.familyMemberId);
                memberName = fm ? fm.name : 'Family Member';
            }
        }
        
        if (!acc[memberName]) acc[memberName] = [];
        acc[memberName].push(alert);
        return acc;
    }, {});

    if (loading || authLoading) {
        return (
            <div className="min-h-[100dvh] flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-bold animate-pulse">Initializing NeuraMed Portal...</p>
                </div>
            </div>
        );
    }

    // Auth guard — redirect to login if not authenticated
    if (!user) {
        router.push('/login');
        return (
            <div className="min-h-[100dvh] flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-bold">Redirecting securely...</p>
                </div>
            </div>
        );
    }

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
                        <button className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl bg-teal-50 text-teal-600 font-black transition-all">
                            <LayoutDashboard size={22} />
                            Dashboard
                        </button>
                        <button onClick={() => router.push('/history')} className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-gray-400 font-black hover:bg-gray-50 transition-all">
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
                    <div className="bg-teal-600 rounded-3xl p-6 text-white relative overflow-hidden group mb-6">
                         <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                         <h4 className="font-black mb-2 relative z-10">Upgrade to Pro</h4>
                         <p className="text-xs text-teal-100 font-bold mb-4 opacity-80 relative z-10">Get AI-powered health analytics and 24/7 care support.</p>
                         <button className="bg-white text-teal-600 px-6 py-2.5 rounded-xl text-xs font-black shadow-lg relative z-10 transition active:scale-95">Upgrade Now</button>
                    </div>

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
                            <h2 className="text-3xl font-black text-gray-900 leading-tight">Welcome, {user?.name?.split(' ')[0]} 👋</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <p className="text-gray-400 font-bold text-sm">System armed & active</p>
                            </div>
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
                                    <option value="all">Everyone</option>
                                    <option value="self">Only Me</option>
                                    {familyMembers.map(fm => (
                                        <option key={fm._id} value={fm._id}>{fm.name}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4 pointer-events-none" />
                            </div>

                            <button 
                                onClick={() => router.push('/add-medicine')}
                                className="flex items-center gap-3 bg-teal-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-teal-700 transition shadow-xl shadow-teal-100 active:scale-95 whitespace-nowrap"
                            >
                                <Plus size={22} strokeWidth={3} />
                                <span className="hidden sm:inline">Add Medication</span>
                            </button>

                            <button
                                onClick={() => setIsProfileOpen(true)}
                                className="w-14 h-14 bg-white border-2 border-gray-100 rounded-2xl flex items-center justify-center hover:bg-gray-50 transition active:scale-95 shadow-sm"
                            >
                                <User className="text-gray-400" size={24} />
                            </button>
                        </div>
                    </div>
                </header>

                <div className="p-8 space-y-10">
                    {/* Alerts Section (Only show if there are alerts) */}
                    {Object.keys(groupedAlerts).length > 0 && (
                        <section className="animate-in fade-in slide-in-from-top-4 duration-500">
                             <div className="flex items-center gap-3 mb-6">
                                <h3 className="text-lg font-black text-gray-900 tracking-tight">Critical Care Alerts</h3>
                                <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{alerts.length}</span>
                             </div>

                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {Object.entries(groupedAlerts).map(([member, memberAlerts]) => (
                                    <div key={member} className="bg-white rounded-3xl p-6 border-2 border-red-50 shadow-sm">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
                                                <ShieldAlert size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-gray-900 leading-tight">{member}</h4>
                                                <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Medical Resistance</p>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-3">
                                            {memberAlerts.map((alert, idx) => (
                                                <div key={idx} className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50 flex gap-3 items-start">
                                                    <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                                                    <p className="text-xs font-bold text-gray-700 leading-relaxed">{alert.message}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </section>
                    )}

                    {/* Schedule Section */}
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                        <div className="xl:col-span-8">
                             <MedicineSchedule 
                                medicines={filteredMedicines} 
                                onUpdate={fetchData} 
                             />
                        </div>

                        <div className="xl:col-span-4 space-y-10">
                            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                                <h3 className="text-xl font-black text-gray-900 mb-6 tracking-tight">Daily Summary</h3>
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                                                <CheckCircle2 size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Compliance</p>
                                                <h4 className="text-lg font-black text-emerald-950">92%</h4>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center">
                                                <Clock size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-indigo-800 uppercase tracking-widest">Next Dose</p>
                                                <h4 className="text-lg font-black text-indigo-950">2:30 PM</h4>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-50">
                                        <button className="w-full py-4 rounded-2xl bg-gray-50 text-gray-400 font-bold hover:bg-gray-100 transition active:scale-95 flex items-center justify-center gap-2">
                                            <Info size={16} />
                                            View Full Report
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <ProfilePanel isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
        </div>
    );
}
