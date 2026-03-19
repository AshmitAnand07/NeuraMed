"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, AlertTriangle, Heart, Package, Search } from 'lucide-react';
import DisposalModal from '@/components/DisposalModal';

interface Medicine {
    _id: string;
    name: string;
    expiryDate: string;
    status: 'safe' | 'expiring' | 'expired';
    familyMember: string;
}

export default function Dashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [stats, setStats] = useState({ total: 0, expiring: 0, expired: 0, donated: 0 });
    const [disposalModal, setDisposalModal] = useState({ isOpen: false, medicineId: '', medicineName: '' });

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
            return;
        }
        if (user?.role === 'ngo') router.push('/ngo-dashboard');
        if (user?.role === 'admin') router.push('/admin-dashboard');

        if (user) fetchData();
    }, [user, loading, router]);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/medicines');
            if (res.ok) {
                const data = await res.json();
                const availableMedicines = data.filter((m: any) => {
                    const remStrips = (m.quantityStrips || 0) - (m.donatedStrips || 0);
                    const remTablets = (m.quantityTablets || 0) - (m.donatedTablets || 0);
                    return remStrips > 0 || remTablets > 0;
                });
                setMedicines(availableMedicines);
                const total = availableMedicines.length;
                const expiring = availableMedicines.filter((m: any) => m.status === 'expiring').length;
                const expired = availableMedicines.filter((m: any) => m.status === 'expired').length;
                const donated = data.filter((m: any) => (m.donatedStrips > 0 || m.donatedTablets > 0) || m.isDonated).length;
                setStats({ total, expiring, expired, donated });
            }
        } catch (e) {
            console.error("Failed to fetch medicines");
        }
    };

    if (loading || !user) return <div className="p-8 text-center text-teal-600">Loading Dashboard...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Hello, {user.name} 👋</h1>
                    <p className="text-gray-600 mt-1">Here is your medicine inventory status.</p>
                </div>
                <Link href="/add-medicine" className="bg-teal-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-teal-700 transition flex items-center gap-2 shadow-md">
                    <Plus size={20} /> Add Medicine
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <Link href="/inventory" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition cursor-pointer">
                    <div className="p-3 bg-blue-50 rounded-lg text-blue-600"><Package size={28} /></div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Medicines</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stats.total}</h3>
                    </div>
                </Link>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-red-50 flex items-center gap-4">
                    <div className="p-3 bg-red-50 rounded-lg text-red-600"><AlertTriangle size={28} /></div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Expiring Soon</p>
                        <h3 className="text-2xl font-bold text-red-600">{stats.expiring}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg text-gray-600"><AlertTriangle size={28} /></div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Expired</p>
                        <h3 className="text-2xl font-bold text-gray-800">{stats.expired}</h3>
                    </div>
                </div>
                <Link href="/donations" className="bg-white p-6 rounded-xl shadow-sm border border-pink-50 flex items-center gap-4 hover:shadow-md transition cursor-pointer">
                    <div className="p-3 bg-pink-50 rounded-lg text-pink-600"><Heart size={28} /></div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Donated</p>
                        <h3 className="text-2xl font-bold text-pink-600">{stats.donated}</h3>
                    </div>
                </Link>
            </div>

            {/* Recent Alerts / Inventory Preview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-800">Critical Alerts & Inventory</h3>
                    <Link href="/inventory" className="text-teal-600 text-sm font-medium hover:underline">View All</Link>
                </div>

                {medicines.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">
                        <Package size={48} className="mx-auto mb-3 text-gray-300" />
                        <p>No medicines found. Start by adding one!</p>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Family Member</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {medicines.slice(0, 5).map((med) => (
                                <tr key={med._id}>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{med.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{med.familyMember}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{new Date(med.expiryDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {med.status === 'safe' && <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Safe</span>}
                                        {med.status === 'expiring' && <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Expiring Soon</span>}
                                        {med.status === 'expired' && <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Expired</span>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {med.status === 'expiring' && (
                                            <Link href="/about#ngos" className="text-pink-600 hover:text-pink-800 font-medium">
                                                Donate
                                            </Link>
                                        )}
                                        {med.status === 'expired' && (
                                            <button 
                                                onClick={() => setDisposalModal({ isOpen: true, medicineId: med._id, medicineName: med.name })}
                                                className="text-red-600 hover:text-red-800 font-medium text-sm"
                                            >
                                                Dispose Safely
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <DisposalModal 
                isOpen={disposalModal.isOpen}
                onClose={() => setDisposalModal({ ...disposalModal, isOpen: false })}
                medicineId={disposalModal.medicineId}
                medicineName={disposalModal.medicineName}
                onDisposed={fetchData}
            />
        </div>
    );
}
