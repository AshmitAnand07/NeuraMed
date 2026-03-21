"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, authHeaders } from '@/context/AuthContext';
import MedicineScanner from '@/components/MedicineScanner';
import { parseMedicineOCR } from '@/lib/parseOCR';
import PrescriptionUploader from '@/components/PrescriptionUploader';
import { Users, User as UserIcon, Calendar, ClipboardList } from 'lucide-react';

export default function AddMedicinePage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [familyMembers, setFamilyMembers] = useState<{_id: string, name: string}[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        expiryDate: '',
        manufacturingDate: '',
        mrp: '',
        category: 'General',
        familyMember: 'Self',
        familyMemberId: '',
        quantityStrips: '',
        quantityTablets: '',
        dosage: '',
        time: 'Morning',
        frequency: 'Once daily'
    });
    const [error, setError] = useState('');
    const [warning, setWarning] = useState<any>(null); // For duplicates
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchFamilyMembers();
    }, []);

    const fetchFamilyMembers = async () => {
        try {
            const res = await fetch('/api/family-members', { headers: authHeaders() });
            if (res.ok) {
                const data = await res.json();
                setFamilyMembers(data);
            }
        } catch (error) {
            console.error("Failed to fetch family members");
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'familyMember') {
            if (value === 'Self') {
                setFormData(prev => ({ ...prev, familyMember: 'Self', familyMemberId: '' }));
            } else {
                const selected = familyMembers.find(fm => fm._id === value);
                setFormData(prev => ({ ...prev, familyMember: selected?.name || '', familyMemberId: value }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setWarning(null);
        setLoading(true);

        try {
            const res = await fetch('/api/medicines', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...authHeaders()
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (data.status === 'duplicate_warning') {
                setWarning(data);
                setLoading(false);
                return;
            }

            if (!res.ok) {
                throw new Error(data.message || data.error || 'Failed to add medicine');
            }

            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-[100dvh] flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-bold animate-pulse">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null; // AuthContext handles redirect
    }

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
                {/* Header Section */}
                <div className="bg-teal-600 p-8 sm:p-12 text-white relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-8 opacity-10">
                       <PlusCircle size={150} className="rotate-12" />
                   </div>
                   <div className="relative z-10">
                        <h1 className="text-4xl font-black mb-3">Add Medicine</h1>
                        <p className="text-teal-100 font-bold text-lg opacity-90 max-w-md">Register new medication for yourself or your family members to track health effectively.</p>
                   </div>
                </div>

                <div className="p-8 sm:p-12 bg-gray-50/50">
                    {/* Prescription Uploader Component */}
                    <div className="mb-10">
                         <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4 ml-1">AI Smart Upload</h3>
                         <PrescriptionUploader onUploadSuccess={() => {
                            setTimeout(() => router.push('/dashboard'), 2000);
                        }} />
                    </div>

                    <div className="relative flex items-center py-8">
                        <div className="flex-grow border-t border-gray-200"></div>
                        <span className="flex-shrink-0 mx-6 text-gray-300 font-black tracking-widest text-xs">OR MANUAL ENTRY</span>
                        <div className="flex-grow border-t border-gray-200"></div>
                    </div>

                    {/* Manual Form */}
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {error && (
                            <div className="bg-red-50 border-2 border-red-100 text-red-600 px-6 py-4 rounded-2xl font-bold flex items-center gap-3">
                                <div className="bg-red-600 text-white p-1 rounded-lg"><AlertTriangle size={16} /></div>
                                {error}
                            </div>
                        )}

                        {warning && (
                            <div className="bg-amber-50 border-2 border-amber-100 p-6 rounded-2xl">
                                <p className="text-amber-800 font-black mb-4 flex items-center gap-2">
                                    <AlertTriangle size={20} /> Duplicate Found
                                </p>
                                <p className="text-amber-700 font-bold mb-6 text-sm">{warning.message}</p>
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => { setWarning(null); setLoading(false); }}
                                        className="bg-amber-600 text-white px-6 py-2.5 rounded-xl font-black text-sm hover:bg-amber-700 transition"
                                    >
                                        Edit Entry
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="space-y-8">
                            {/* Medicine Name & Member Selection */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Medicine Name</label>
                                    <div className="relative">
                                        <input
                                            name="name"
                                            type="text"
                                            required
                                            className="w-full px-6 py-4 border-2 border-gray-50 rounded-2xl focus:border-teal-500 focus:ring-0 outline-none transition text-lg bg-white font-bold placeholder:text-gray-300 shadow-sm"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="e.g. Paracetamol"
                                        />
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none">
                                            <ClipboardList size={22} />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Family Member</label>
                                    <div className="relative">
                                        <select
                                            name="familyMember"
                                            className="w-full px-6 py-4 border-2 border-gray-50 rounded-2xl focus:border-teal-500 focus:ring-0 outline-none transition text-lg bg-white font-bold appearance-none cursor-pointer shadow-sm"
                                            value={formData.familyMemberId || 'Self'}
                                            onChange={handleChange}
                                        >
                                            <option value="Self">Me (Self)</option>
                                            {familyMembers.map(fm => (
                                                <option key={fm._id} value={fm._id}>{fm.name}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none">
                                            <Users size={22} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Dates Selection */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Expiry Date</label>
                                    <div className="relative">
                                        <input
                                            name="expiryDate"
                                            type="date"
                                            required
                                            className="w-full px-6 py-4 border-2 border-gray-50 rounded-2xl focus:border-teal-500 focus:ring-0 outline-none transition text-lg bg-white font-bold shadow-sm"
                                            value={formData.expiryDate}
                                            onChange={handleChange}
                                        />
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none">
                                            <Calendar size={22} />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Dosage</label>
                                    <input
                                        name="dosage"
                                        type="text"
                                        className="w-full px-6 py-4 border-2 border-gray-50 rounded-2xl focus:border-teal-500 focus:ring-0 outline-none transition text-lg bg-white font-bold shadow-sm placeholder:text-gray-300"
                                        value={formData.dosage}
                                        onChange={handleChange}
                                        placeholder="e.g. 1 Tablet"
                                    />
                                </div>
                            </div>

                            {/* Timing & Frequency */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Preferred Time</label>
                                    <select
                                        name="time"
                                        className="w-full px-6 py-4 border-2 border-gray-50 rounded-2xl focus:border-teal-500 focus:ring-0 outline-none transition text-lg bg-white font-bold shadow-sm appearance-none cursor-pointer"
                                        value={formData.time}
                                        onChange={handleChange}
                                    >
                                        <option>Morning</option>
                                        <option>Afternoon</option>
                                        <option>Evening</option>
                                        <option>Night</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Frequency</label>
                                    <select
                                        name="frequency"
                                        className="w-full px-6 py-4 border-2 border-gray-50 rounded-2xl focus:border-teal-500 focus:ring-0 outline-none transition text-lg bg-white font-bold shadow-sm appearance-none cursor-pointer"
                                        value={formData.frequency}
                                        onChange={handleChange}
                                    >
                                        <option>Once daily</option>
                                        <option>Twice daily</option>
                                        <option>Thrice daily</option>
                                        <option>Every 4 hours</option>
                                        <option>Empty stomach</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 flex flex-col items-center">
                            <button
                                type="submit"
                                disabled={loading || !!warning}
                                className="w-full max-w-sm bg-teal-600 text-white py-6 rounded-2xl font-black text-xl hover:bg-teal-700 transition transform active:scale-[0.98] shadow-2xl shadow-teal-100 flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={24} />
                                        <span>Saving Medicine...</span>
                                    </>
                                ) : (
                                    <>
                                        <PlusCircle size={24} />
                                        <span>Register Medication</span>
                                    </>
                                )}
                            </button>
                            <p className="mt-6 text-gray-400 font-bold text-sm">You can edit or delete this entries later from history.</p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

// Support Icons
const PlusCircle = ({size, className}: {size: number, className?: string}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className || ''}>
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
);

const AlertTriangle = ({size}: {size: number}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
);

const Loader2 = ({size, className}: {size: number, className?: string}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className || ''}>
        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
);
