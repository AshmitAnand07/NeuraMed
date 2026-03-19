"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import OCRScanner from '@/components/OCRScanner';
import { parseMedicineOCR } from '@/lib/parseOCR';

export default function AddMedicinePage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        expiryDate: '',
        manufacturingDate: '',
        mrp: '',
        category: 'General',
        familyMember: 'Self',
    });
    const [error, setError] = useState('');
    const [warning, setWarning] = useState<any>(null); // For duplicates
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setWarning(null);
        setLoading(true);

        try {
            const res = await fetch('/api/medicines', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (data.status === 'duplicate_warning') {
                setWarning(data);
                setLoading(false);
                return;
            }

            if (data.status === 'merged') {
                alert(data.message);
                router.push('/dashboard');
                return;
            }

            if (data.status === 'replaced') {
                alert(data.message);
                router.push('/dashboard');
                return;
            }

            if (!res.ok) {
                throw new Error(data.error || 'Failed to add medicine');
            }

            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Medicine</h1>

                {/* OCR Scanner Component */}
                <OCRScanner onScanSuccess={(text) => {
                    const parsedData = parseMedicineOCR(text);
                    setFormData(prev => ({ 
                         ...prev, 
                         name: parsedData.medicineName || prev.name,
                         expiryDate: parsedData.expiryDate || prev.expiryDate,
                         manufacturingDate: parsedData.manufacturingDate || prev.manufacturingDate,
                         mrp: parsedData.mrp || prev.mrp
                    }));
                }} />

                <form onSubmit={(e) => handleSubmit(e)} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {warning && (
                        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                            <p className="text-yellow-800 font-medium mb-2">⚠️ {warning.message}</p>
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => { setWarning(null); setLoading(false); }}
                                    className="bg-yellow-600 text-white px-3 py-1.5 rounded text-sm hover:bg-yellow-700"
                                >
                                    Got it
                                </button>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Medicine Name</label>
                        <input
                            name="name"
                            type="text"
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 text-gray-900"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g. Dolo 650"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Manufacturing Date</label>
                            <input
                                name="manufacturingDate"
                                type="date"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                value={formData.manufacturingDate}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                            <input
                                name="expiryDate"
                                type="date"
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                value={formData.expiryDate}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Category</label>
                            <select
                                name="category"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                value={formData.category}
                                onChange={handleChange}
                            >
                                <option>General</option>
                                <option>Antibiotic</option>
                                <option>Painkiller</option>
                                <option>Vitamin</option>
                                <option>Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Quantity (Strips)</label>
                            <input
                                name="quantityStrips"
                                type="number"
                                placeholder="0"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                value={(formData as any).quantityStrips || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Quantity (Tablets)</label>
                            <input
                                name="quantityTablets"
                                type="number"
                                placeholder="0"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                value={(formData as any).quantityTablets || ''}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Family Member</label>
                            <select
                                name="familyMember"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                value={formData.familyMember}
                                onChange={handleChange}
                            >
                                <option>Self</option>
                                <option>Father</option>
                                <option>Mother</option>
                                <option>Child</option>
                                <option>Grandparent</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">MRP (Optional)</label>
                            <input
                                name="mrp"
                                type="number"
                                placeholder="₹"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                value={formData.mrp}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading || !!warning}
                            className="w-full bg-teal-600 text-white py-3 px-4 rounded-md font-medium hover:bg-teal-700 transition shadow-sm disabled:opacity-50"
                        >
                            {loading ? 'Adding...' : 'Add Medicine'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
