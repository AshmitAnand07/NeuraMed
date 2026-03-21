"use client";
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, Calendar, MapPin, Phone, Trash2, XCircle } from 'lucide-react';

export default function DonationHistory() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [donationToCancel, setDonationToCancel] = useState<any>(null);
    const [isCancelling, setIsCancelling] = useState(false);

    const confirmCancel = async () => {
        if (!donationToCancel) return;
        setIsCancelling(true);
        try {
            const res = await fetch(`/api/donations?id=${donationToCancel._id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setDonations(prev => prev.filter((d: any) => d._id !== donationToCancel._id));
                setCancelModalOpen(false);
                setDonationToCancel(null);
            } else {
                alert("Failed to cancel donation.");
            }
        } catch (e) {
            alert("Error cancelling donation.");
        } finally {
            setIsCancelling(false);
        }
    };

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }

        if (user) {
            fetch('/api/donations')
                .then(res => res.json())
                .then(data => {
                    setDonations(data);
                    setLoading(false);
                })
                .catch(err => setLoading(false));
        }
    }, [authLoading, user, router]);

    if (authLoading || (loading && user)) return <div className="p-8 text-center text-teal-600">Loading Donation History...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6">
                    <Link href="/dashboard" className="flex items-center text-teal-600 font-medium mb-4 hover:underline">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Your Donation History 🎁</h1>
                    <p className="text-gray-600 mt-1">Track all your contributions and their status.</p>
                </div>

                {donations.length === 0 ? (
                    <div className="bg-white p-12 text-center rounded-xl shadow-sm">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-gray-900">No donations yet</h3>
                        <p className="text-gray-500 mt-2">Start donating your unused medicines to save lives!</p>
                        <Link href="/dashboard" className="mt-6 inline-block bg-teal-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-teal-700 transition">
                            Go to Dashboard
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">Medicine</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">Donated To (NGO)</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">Scheduled Date</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {donations.map((donation: any) => (
                                        <tr key={donation._id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-lg text-gray-900">{donation.medicineId?.name || "Unknown Medicine"}</div>
                                                <div className="text-sm font-medium text-gray-500">
                                                    Qty: {typeof donation.quantityStrips === 'number' ? donation.quantityStrips : (donation.medicineId?.quantityStrips || 0)} Strips, {typeof donation.quantityTablets === 'number' ? donation.quantityTablets : (donation.medicineId?.quantityTablets || 0)} Tabs
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center text-lg">
                                                    <MapPin className="w-5 h-5 text-teal-500 mr-2" />
                                                    <span className="font-bold text-gray-800">{donation.ngoName || "Pending Match"}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 text-lg">
                                                {donation.pickupDate ? (
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-gray-900">{new Date(donation.pickupDate).toLocaleDateString()}</span>
                                                        <span className="text-sm font-medium text-gray-500">Req: {new Date(donation.requestedAt).toLocaleDateString()}</span>
                                                    </div>
                                                ) : (
                                                    <span className="font-bold">{new Date(donation.requestedAt).toLocaleDateString()}</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-4 py-2 rounded-full text-sm font-extrabold uppercase tracking-wide border ${donation.status === 'collected' ? 'bg-green-100 text-green-800 border-green-200' :
                                                        donation.status === 'accepted' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                                            'bg-yellow-100 text-yellow-800 border-yellow-200'
                                                        }`}>
                                                    {donation.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {donation.status === 'pending' && (
                                                    <button 
                                                        onClick={() => { setDonationToCancel(donation); setCancelModalOpen(true); }}
                                                        className="text-red-500 hover:text-red-700 transition bg-red-50 p-2 rounded-lg border border-red-100"
                                                        title="Cancel Schedule"
                                                    >
                                                        <XCircle className="w-6 h-6" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden divide-y divide-gray-100">
                            {donations.map((donation: any) => (
                                <div key={donation._id} className="p-5 space-y-4 hover:bg-gray-50 transition">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-extrabold text-xl text-gray-900">{donation.medicineId?.name || "Unknown Medicine"}</h3>
                                            <p className="text-gray-600 font-medium text-base">
                                                Qty: {typeof donation.quantityStrips === 'number' ? donation.quantityStrips : (donation.medicineId?.quantityStrips || 0)} Strips, {typeof donation.quantityTablets === 'number' ? donation.quantityTablets : (donation.medicineId?.quantityTablets || 0)} Tabs
                                            </p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${donation.status === 'collected' ? 'bg-green-100 text-green-800 border-green-200' :
                                                donation.status === 'accepted' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                                    'bg-yellow-100 text-yellow-800 border-yellow-200'
                                                }`}>
                                            {donation.status}
                                        </span>
                                    </div>
                                    <div className="flex bg-gray-50 p-3 rounded-xl border border-gray-100 items-center justify-between">
                                        <div className="flex items-center text-gray-700 font-bold text-lg">
                                            <MapPin className="w-6 h-6 text-teal-600 mr-2" />
                                            {donation.ngoName || "Pending Match"}
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center text-lg mt-2 pt-2 border-t border-gray-100">
                                        <div className="flex items-center text-gray-700">
                                            <Calendar className="w-6 h-6 text-gray-400 mr-2" />
                                            {donation.pickupDate ? (
                                                <span className="font-bold text-gray-900">{new Date(donation.pickupDate).toLocaleDateString()}</span>
                                            ) : (
                                                <span className="font-bold">{new Date(donation.requestedAt).toLocaleDateString()}</span>
                                            )}
                                        </div>
                                        {donation.status === 'pending' && (
                                            <button 
                                                onClick={() => { setDonationToCancel(donation); setCancelModalOpen(true); }}
                                                className="text-red-600 hover:text-red-700 transition flex items-center font-bold text-base bg-red-50 px-4 py-2 rounded-xl border border-red-100"
                                            >
                                                <XCircle className="w-5 h-5 mr-1.5" /> Cancel
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Cancel Confirmation Modal */}
            {cancelModalOpen && donationToCancel && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-w-sm w-full p-6 sm:p-8 text-center animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
                        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 sm:hidden"></div>
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5 scale-animation hidden-on-mount border border-red-100">
                            <Trash2 className="w-10 h-10 text-red-600 animate-pulse" />
                        </div>
                        <h3 className="text-2xl font-extrabold text-gray-900 mb-3">Cancel Donation?</h3>
                        <p className="text-gray-600 text-lg mb-8 line-clamp-2">
                            Are you sure you want to cancel the donation for <span className="font-bold text-gray-900">{donationToCancel.medicineId?.name}</span>?
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 mb-2">
                            <button 
                                onClick={() => setCancelModalOpen(false)} 
                                disabled={isCancelling}
                                className="flex-1 bg-gray-100 text-gray-800 font-extrabold text-lg py-4 sm:py-3 rounded-xl hover:bg-gray-200 transition order-2 sm:order-1"
                            >
                                No, Keep It
                            </button>
                            <button 
                                onClick={confirmCancel} 
                                disabled={isCancelling}
                                className="flex-1 bg-red-600 text-white font-extrabold text-lg py-4 sm:py-3 rounded-xl hover:bg-red-700 transition flex justify-center items-center shadow-lg transform hover:-translate-y-0.5 order-1 sm:order-2 disabled:opacity-50"
                            >
                                {isCancelling ? 'Processing...' : 'Yes, Cancel'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
