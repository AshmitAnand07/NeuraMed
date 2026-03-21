"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Camera, Calendar, MapPin, Package, CheckCircle, ChevronDown, Search } from 'lucide-react';

const ngos = [
    { id: 1, name: "Seva Kutir Foundation" },
    { id: 2, name: "Aarogya Life Mission" },
    { id: 3, name: "NeuraMed Plus NGO" },
    { id: 4, name: "Hope for All" }
];

export default function CompareDonatePage() {
    const params = useParams();
    const router = useRouter();
    const id = Number(params?.id);
    const ngo = ngos.find(n => n.id === id);

    const [medicines, setMedicines] = useState<any[]>([]);
    const [filteredMedicines, setFilteredMedicines] = useState<any[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedMedicineId, setSelectedMedicineId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        medicineName: '',
        quantity: '',
        expiryDate: '',
        pickupDate: '',
        address: '',
        phone: ''
    });

    const [isSubmitted, setIsSubmitted] = useState(false);

    // Fetch user's medicines
    useEffect(() => {
        const fetchMedicines = async () => {
            try {
                const res = await fetch('/api/medicines');
                if (res.ok) {
                    const data = await res.json();
                    setMedicines(data);
                }
            } catch (error) {
                console.error("Failed to fetch medicines", error);
            }
        };
        fetchMedicines();
    }, []);

    // Filter logic
    useEffect(() => {
        if (formData.medicineName && showDropdown) {
            const filtered = medicines.filter(m =>
                m.name.toLowerCase().includes(formData.medicineName.toLowerCase())
            );
            setFilteredMedicines(filtered);
        } else {
            setFilteredMedicines([]);
        }
    }, [formData.medicineName, medicines, showDropdown]);

    const handleSelectMedicine = (medicine: any) => {
        setFormData({
            ...formData,
            medicineName: medicine.name,
            expiryDate: medicine.expiryDate.split('T')[0], // Format date
            // Optional: Auto-fill quantity if useful, or leave blank for user to decide donation amount
        });
        setSelectedMedicineId(medicine._id);
        setShowDropdown(false);
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, medicineName: e.target.value });
        setSelectedMedicineId(null);
        setShowDropdown(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedMedicineId) {
            alert("Please select a valid medicine from your inventory list");
            return;
        }

        try {
            const res = await fetch('/api/donations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    medicineId: selectedMedicineId,
                    ngoName: ngo?.name,
                    pickupAddress: formData.address,
                    pickupDate: formData.pickupDate,
                    phone: formData.phone,
                    donateStrips: parseInt(formData.quantity) || 0
                })
            });

            if (res.ok) {
                setIsSubmitted(true);
            } else {
                const data = await res.json();
                alert(data.error || "Failed to submit donation");
            }
        } catch (error) {
            console.error("Donation failed", error);
            alert("An error occurred. Please try again.");
        }
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-teal-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Donation Scheduled!</h2>
                    <p className="text-gray-600 mb-8">
                        Thank you for your generosity. <br />
                        <span className="font-semibold text-teal-700">{ngo?.name}</span> has been notified.<br />
                        You have scheduled a donation for <span className="font-bold">{parseInt(formData.quantity) || 0} strips</span> of {formData.medicineName}.
                        We will contact you shortly for pickup.
                    </p>
                    <Link href={`/about/ngo/${id}`}>
                        <button className="w-full bg-teal-600 text-white font-bold py-3 rounded-lg hover:bg-teal-700 transition">
                            Back to NGO Details
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link href={`/about/ngo/${id}`} className="flex items-center text-gray-500 hover:text-teal-600 transition text-sm font-medium w-fit mb-4">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Cancel Donation
                    </Link>
                    <h1 className="text-3xl font-extrabold text-gray-900">Donate Medicine</h1>
                    <p className="mt-2 text-lg text-gray-600">
                        To <span className="font-bold text-teal-700">{ngo?.name || 'NGO'}</span>
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="bg-teal-600 p-4 text-white text-center text-sm font-medium">
                        Confirming donation details for pickup
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6" onClick={() => setShowDropdown(false)}>
                        {/* Section 1: Medicine Info */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                <Package className="w-5 h-5 mr-2 text-teal-500" /> Medicine Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="relative" onClick={e => e.stopPropagation()}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Name</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                                            placeholder="Start typing to search..."
                                            value={formData.medicineName}
                                            onChange={handleNameChange}
                                            onFocus={() => setShowDropdown(true)}
                                            autoComplete="off"
                                        />
                                        <div className="absolute right-3 top-2.5 text-gray-400 pointer-events-none">
                                            {showDropdown ? <ChevronDown className="w-5 h-5" /> : <Search className="w-5 h-5" />}
                                        </div>
                                    </div>

                                    {/* Dropdown */}
                                    {showDropdown && filteredMedicines.length > 0 && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                            {filteredMedicines.map((med) => (
                                                <div
                                                    key={med._id}
                                                    className="px-4 py-3 hover:bg-teal-50 cursor-pointer border-b border-gray-100 last:border-0"
                                                    onClick={() => handleSelectMedicine(med)}
                                                >
                                                    <div className="font-medium text-gray-800">{med.name}</div>
                                                    <div className="text-xs text-gray-500 flex justify-between">
                                                        <span>Expires: {new Date(med.expiryDate).toLocaleDateString()}</span>
                                                        <span>Remaining: {(med.quantityStrips || 0) - (med.donatedStrips || 0)} Strips</span>
                                                        <span className={med.status === 'safe' ? 'text-green-600' : 'text-orange-500'}>
                                                            {med.status.toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {showDropdown && formData.medicineName && filteredMedicines.length === 0 && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm text-gray-500 text-center">
                                            No matches found in your inventory.
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (Strips)</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                                        placeholder="e.g. 2"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                                            value={formData.expiryDate}
                                            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                                        />
                                        <Calendar className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Upload Photo (Optional)</label>
                                    <div className="w-full px-4 py-2 border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-50 cursor-pointer transition">
                                        <Camera className="w-5 h-5 mr-2" />
                                        <span>Click to scan</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <hr className="border-gray-100" />

                        {/* Section 2: Pickup Info */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                <MapPin className="w-5 h-5 mr-2 text-teal-500" /> Pickup Details
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Address</label>
                                    <textarea
                                        required
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                                        placeholder="Enter your full address..."
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    ></textarea>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                                        <input
                                            type="tel"
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                                            placeholder="+91 99999 88888"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date</label>
                                        <input
                                            type="date"
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                                            value={formData.pickupDate}
                                            onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="pt-4">
                            <button type="submit" className="w-full bg-teal-800 text-white font-bold py-4 rounded-xl hover:bg-teal-900 transition shadow-lg transform hover:-translate-y-1">
                                Confirm Donation Schedule
                            </button>
                            <p className="text-center text-xs text-gray-500 mt-4">
                                By clicking Confirm, you agree to our donation terms. Medicines must not be expired or damaged.
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
