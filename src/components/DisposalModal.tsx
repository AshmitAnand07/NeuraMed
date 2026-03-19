"use client";

import { useState, useEffect } from 'react';
import { AlertTriangle, X, Loader2, CheckCircle2 } from 'lucide-react';

interface DisposalModalProps {
    isOpen: boolean;
    onClose: () => void;
    medicineId: string;
    medicineName: string;
    onDisposed: () => void;
}

export default function DisposalModal({ isOpen, onClose, medicineId, medicineName, onDisposed }: DisposalModalProps) {
    const [instructions, setInstructions] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [confirming, setConfirming] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && medicineName) {
            fetchInstructions();
        }
    }, [isOpen, medicineName]);

    const fetchInstructions = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/dispose', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ medicineName })
            });
            if (res.ok) {
                const data = await res.json();
                setInstructions(data.instructions || []);
            } else {
                setError('Failed to load disposal instructions.');
            }
        } catch (err) {
            setError('An error occurred while fetching instructions.');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmDisposal = async () => {
        setConfirming(true);
        try {
            const res = await fetch(`/api/medicines?id=${medicineId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                onDisposed();
                onClose();
            } else {
                setError('Failed to delete medicine.');
            }
        } catch (err) {
            setError('An error occurred while deleting the medicine.');
        } finally {
            setConfirming(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-red-50">
                    <div className="flex items-center gap-2 text-red-600">
                        <AlertTriangle size={20} />
                        <h3 className="font-bold text-lg">Safe Disposal</h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-gray-600 mb-4">
                        Follow these steps to safely dispose of <span className="font-semibold text-gray-900">{medicineName}</span>:
                    </p>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-8 text-teal-600">
                            <Loader2 className="animate-spin mb-2" size={32} />
                            <p className="text-sm font-medium">Generating AI instructions...</p>
                        </div>
                    ) : error ? (
                        <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm mb-4">
                            {error}
                            <button onClick={fetchInstructions} className="block mt-2 font-bold underline">Retry</button>
                        </div>
                    ) : (
                        <ul className="space-y-3 mb-6">
                            {instructions.map((step, i) => (
                                <li key={i} className="flex gap-3 text-sm text-gray-700">
                                    <div className="mt-1 shrink-0"><CheckCircle2 size={16} className="text-teal-500" /></div>
                                    <span>{step}</span>
                                </li>
                            ))}
                        </ul>
                    )}

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirmDisposal}
                            disabled={loading || confirming}
                            className={`flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition flex items-center justify-center gap-2 ${confirming ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {confirming ? <Loader2 className="animate-spin" size={18} /> : null}
                            Confirm Disposal
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
