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

    if (loading || !user) return <div className="p-8 text-center text-teal-600 text-xl font-bold">Loading Dashboard...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">Hello, {user.name} 👋</h1>
                    <p className="text-gray-700 mt-2 text-lg md:text-xl font-medium">Here is your medicine inventory status.</p>
                </div>
                <Link href="/add-medicine" className="bg-teal-600 text-white px-8 py-4 md:py-3 rounded-xl font-bold hover:bg-teal-700 transition flex items-center justify-center gap-3 shadow-lg text-lg">
                    <Plus size={24} /> Add Medicine
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
                <Link href="/inventory" className="bg-white p-6 rounded-2xl shadow-sm border-2 border-transparent hover:border-teal-100 flex flex-col md:flex-row items-center md:items-start md:gap-4 transition cursor-pointer text-center md:text-left">
                    <div className="p-4 bg-blue-100 rounded-xl text-blue-700 mb-3 md:mb-0"><Package size={32} /></div>
                    <div>
                        <p className="text-base text-gray-600 font-bold mb-1">Total Medicines</p>
                        <h3 className="text-3xl font-extrabold text-gray-900">{stats.total}</h3>
                    </div>
                </Link>
                <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-red-50 flex flex-col md:flex-row items-center md:items-start md:gap-4 text-center md:text-left">
                    <div className="p-4 bg-red-100 rounded-xl text-red-700 mb-3 md:mb-0"><AlertTriangle size={32} /></div>
                    <div>
                        <p className="text-base text-gray-600 font-bold mb-1">Expiring Soon</p>
                        <h3 className="text-3xl font-extrabold text-red-600">{stats.expiring}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-gray-100 flex flex-col md:flex-row items-center md:items-start md:gap-4 text-center md:text-left">
                    <div className="p-4 bg-gray-100 rounded-xl text-gray-700 mb-3 md:mb-0"><AlertTriangle size={32} /></div>
                    <div>
                        <p className="text-base text-gray-600 font-bold mb-1">Expired</p>
                        <h3 className="text-3xl font-extrabold text-gray-800">{stats.expired}</h3>
                    </div>
                </div>
                <Link href="/donations" className="bg-white p-6 rounded-2xl shadow-sm border-2 border-transparent hover:border-pink-100 flex flex-col md:flex-row items-center md:items-start md:gap-4 transition cursor-pointer text-center md:text-left">
                    <div className="p-4 bg-pink-100 rounded-xl text-pink-700 mb-3 md:mb-0"><Heart size={32} /></div>
                    <div>
                        <p className="text-base text-gray-600 font-bold mb-1">Donated</p>
                        <h3 className="text-3xl font-extrabold text-pink-600">{stats.donated}</h3>
                    </div>
                </Link>
            </div>

            {/* Recent Alerts / Inventory Preview */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <h3 className="text-xl font-bold text-gray-900">Critical Alerts & Inventory</h3>
                    <Link href="/inventory" className="text-teal-700 text-lg font-bold hover:underline px-4 py-2 hover:bg-teal-50 rounded-lg transition">View All</Link>
                </div>

                {medicines.length === 0 ? (
                    <div className="p-12 text-center text-gray-600">
                        <Package size={64} className="mx-auto mb-4 text-gray-300" />
                        <p className="text-xl font-medium">No medicines found. Start by adding one!</p>
                    </div>
                ) : (
                    <>
                        {/* Mobile Cards View */}
                        <div className="md:hidden divide-y divide-gray-100">
                            {medicines.slice(0, 5).map((med) => (
                                <div key={med._id} className="p-6 bg-white hover:bg-gray-50 flex flex-col gap-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="text-xl font-bold text-gray-900">{med.name}</h4>
                                            <p className="text-gray-600 text-base">{med.familyMember}</p>
                                        </div>
                                        <div>
                                            {med.status === 'safe' && <span className="px-3 py-1 text-sm font-bold rounded-full bg-green-100 text-green-800 border border-green-200">Safe</span>}
                                            {med.status === 'expiring' && <span className="px-3 py-1 text-sm font-bold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">Expiring</span>}
                                            {med.status === 'expired' && <span className="px-3 py-1 text-sm font-bold rounded-full bg-red-100 text-red-800 border border-red-200">Expired</span>}
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-between items-center mt-2 border-t border-gray-100 pt-3">
                                        <div>
                                            <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Expiry Date</p>
                                            <p className="text-lg font-bold text-gray-800">{new Date(med.expiryDate).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            {med.status === 'expiring' && (
                                                <Link href="/inventory" className="inline-flex items-center justify-center px-6 py-3 bg-pink-100 text-pink-700 font-bold rounded-xl hover:bg-pink-200 w-full text-center">
                                                    Donate Now
                                                </Link>
                                            )}
                                            {med.status === 'expired' && (
                                                <button 
                                                    onClick={() => setDisposalModal({ isOpen: true, medicineId: med._id, medicineName: med.name })}
                                                    className="inline-flex items-center justify-center px-6 py-3 bg-red-100 text-red-700 font-bold rounded-xl hover:bg-red-200 w-full text-center"
                                                >
                                                    Dispose Safely
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop Table View */}
                        <div className="hidden md:block">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-extrabold text-gray-700 uppercase tracking-wider">Medicine Name</th>
                                        <th className="px-6 py-4 text-left text-sm font-extrabold text-gray-700 uppercase tracking-wider">Family Member</th>
                                        <th className="px-6 py-4 text-left text-sm font-extrabold text-gray-700 uppercase tracking-wider">Expiry Date</th>
                                        <th className="px-6 py-4 text-left text-sm font-extrabold text-gray-700 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-left text-sm font-extrabold text-gray-700 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {medicines.slice(0, 5).map((med) => (
                                        <tr key={med._id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-5 whitespace-nowrap text-lg font-bold text-gray-900">{med.name}</td>
                                            <td className="px-6 py-5 whitespace-nowrap text-lg text-gray-700 font-medium">{med.familyMember}</td>
                                            <td className="px-6 py-5 whitespace-nowrap text-lg text-gray-700 font-medium">{new Date(med.expiryDate).toLocaleDateString()}</td>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                {med.status === 'safe' && <span className="px-4 py-1.5 inline-flex text-sm font-bold rounded-full bg-green-100 text-green-800 border border-green-200">Safe</span>}
                                                {med.status === 'expiring' && <span className="px-4 py-1.5 inline-flex text-sm font-bold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">Expiring Soon</span>}
                                                {med.status === 'expired' && <span className="px-4 py-1.5 inline-flex text-sm font-bold rounded-full bg-red-100 text-red-800 border border-red-200">Expired</span>}
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap text-lg font-bold">
                                                {med.status === 'expiring' && (
                                                    <Link href="/inventory" className="text-pink-600 hover:text-pink-800 bg-pink-50 px-4 py-2 rounded-lg hover:bg-pink-100 transition">
                                                        Donate
                                                    </Link>
                                                )}
                                                {med.status === 'expired' && (
                                                    <button 
                                                        onClick={() => setDisposalModal({ isOpen: true, medicineId: med._id, medicineName: med.name })}
                                                        className="text-red-600 hover:text-red-800 bg-red-50 px-4 py-2 rounded-lg hover:bg-red-100 transition"
                                                    >
                                                        Dispose Safely
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
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
