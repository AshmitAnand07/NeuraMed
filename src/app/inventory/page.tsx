"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Search, Filter, Plus, Trash2, Heart, Check, Package, Calendar, MapPin, PartyPopper } from 'lucide-react';

export default function InventoryPage() {
    const { user, loading } = useAuth();
    const [medicines, setMedicines] = useState<any[]>([]);
    const [filteredMedicines, setFilteredMedicines] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [familyFilter, setFamilyFilter] = useState('All');

    const ngos = [
        { id: 1, name: "Seva Kutir Foundation" },
        { id: 2, name: "Aarogya Life Mission" },
        { id: 3, name: "NeuraMed Plus NGO" },
        { id: 4, name: "Hope for All" }
    ];

    const [donateModalOpen, setDonateModalOpen] = useState(false);
    const [selectedMedForDonation, setSelectedMedForDonation] = useState<any>(null);
    const [donationForm, setDonationForm] = useState({
        strips: '',
        tablets: '',
        address: '',
        pincode: '',
        phone: '',
        pickupDate: '',
        ngoName: ''
    });
    
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    useEffect(() => {
        fetchMedicines();
    }, [user]);

    const fetchMedicines = async () => {
        if (user) {
            const res = await fetch('/api/medicines');
            const data = await res.json();
            setMedicines(data);
            setFilteredMedicines(data);
        }
    };

    useEffect(() => {
        let res = medicines;
        if (search) {
            res = res.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));
        }
        if (familyFilter !== 'All') {
            res = res.filter(m => m.familyMember === familyFilter);
        }
        // ONLY SHOW MEDICINES WITH REMAINING QUANTITY > 0
        res = res.filter(m => {
            const remStrips = (m.quantityStrips || 0) - (m.donatedStrips || 0);
            const remTablets = (m.quantityTablets || 0) - (m.donatedTablets || 0);
            return remStrips > 0 || remTablets > 0;
        });
        setFilteredMedicines(res);
    }, [search, familyFilter, medicines]);

    const handleRemove = async (id: string) => {
        if (!confirm("Are you sure you want to remove this medicine?")) return;
        try {
            const res = await fetch(`/api/medicines?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setMedicines(prev => prev.filter(m => m._id !== id));
                setFilteredMedicines(prev => prev.filter(m => m._id !== id));
            } else {
                alert("Failed to delete medicine.");
            }
        } catch (e) {
            alert("Error deleting medicine.");
        }
    };

    const submitDonationForm = async () => {
        if (!selectedMedForDonation) return;
        const med = selectedMedForDonation;
        const remainingStrips = (med.quantityStrips || 0) - (med.donatedStrips || 0);
        const remainingTablets = (med.quantityTablets || 0) - (med.donatedTablets || 0);

        const donateStrips = parseInt(donationForm.strips) || 0;
        const donateTablets = parseInt(donationForm.tablets) || 0;

        if (donateStrips === 0 && donateTablets === 0) {
            alert("Please specify a quantity to donate.");
            return;
        }
        if (donateStrips > remainingStrips || donateTablets > remainingTablets) {
            alert("Cannot donate more than remaining quantity.");
            return;
        }

        if (donationForm.pincode.length !== 6) {
            alert("Please enter a valid 6-digit PIN Code.");
            return;
        }

        if (donationForm.phone.length !== 10) {
            alert("Please enter a valid 10-digit Phone Number.");
            return;
        }

        try {
            const res = await fetch('/api/donations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    medicineId: med._id, 
                    donateStrips, 
                    donateTablets,
                    pickupAddress: `${donationForm.address}, PIN: ${donationForm.pincode}`,
                    phone: `+91 ${donationForm.phone}`,
                    pickupDate: donationForm.pickupDate,
                    ngoName: donationForm.ngoName || undefined
                }),
            });

            if (res.ok) {
                setDonateModalOpen(false);
                setDonationForm({ strips: '', tablets: '', address: '', pincode: '', phone: '', pickupDate: '', ngoName: '' });
                setShowSuccessModal(true);
                fetchMedicines(); // Refresh to update status
            } else {
                const d = await res.json();
                alert(d.error || "Failed to donate");
            }
        } catch (e) {
            alert("Error processing donation");
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Medicine Inventory</h1>
                <div className="flex gap-3">
                    <Link href="/donations" className="bg-pink-50 text-pink-700 px-4 py-2 rounded-lg font-bold hover:bg-pink-100 transition flex items-center gap-2 shadow-sm border border-pink-100">
                        <Heart size={20} /> Donation Stats
                    </Link>
                    <Link href="/add-medicine" className="bg-teal-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-teal-700 transition flex items-center gap-2 shadow-sm border border-teal-700">
                        <Plus size={20} /> Add Medicine
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search medicines..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 outline-none"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter size={20} className="text-gray-500" />
                    <select
                        className="border border-gray-300 rounded-lg py-2 px-3 focus:ring-teal-500 focus:border-teal-500 outline-none"
                        value={familyFilter}
                        onChange={e => setFamilyFilter(e.target.value)}
                    >
                        <option value="All">All Members</option>
                        <option value="Self">Self</option>
                        <option value="Father">Father</option>
                        <option value="Mother">Mother</option>
                        <option value="Child">Child</option>
                        <option value="Grandparent">Grandparent</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMedicines.map((med) => (
                    <div key={med._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">{med.name}</h3>
                                <p className="text-sm text-gray-500">{med.category} • {med.familyMember}</p>
                            </div>
                            <div className={`px-2 py-1 rounded-full text-xs font-semibold
                  ${med.status === 'safe' ? 'bg-green-100 text-green-800' :
                    med.status === 'expiring' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                {med.status.toUpperCase()}
                            </div>
                        </div>

                        <div className="space-y-2 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Expiring:</span>
                                <span className="font-medium text-gray-900">{new Date(med.expiryDate).toLocaleDateString()}</span>
                            </div>
                            {med.mrp && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">MRP:</span>
                                    <span className="font-medium text-gray-900">₹{med.mrp}</span>
                                </div>
                            )}
                            {(() => {
                                const remStrips = (med.quantityStrips || 0) - (med.donatedStrips || 0);
                                const remTabs = (med.quantityTablets || 0) - (med.donatedTablets || 0);
                                if (remStrips > 0 || remTabs > 0) {
                                    return (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Remaining:</span>
                                            <span className="font-medium text-teal-700">
                                                {remStrips > 0 ? `${remStrips} Strips ` : ''}
                                                {remTabs > 0 ? `${remTabs} Tablets` : ''}
                                            </span>
                                        </div>
                                    );
                                }
                                return null;
                            })()}
                        </div>

                        <div className="flex gap-2">
                            {med.status !== 'expired' && ((med.quantityStrips || 0) - (med.donatedStrips || 0) > 0 || (med.quantityTablets || 0) - (med.donatedTablets || 0) > 0) && (
                                <button
                                    onClick={() => {
                                        setSelectedMedForDonation(med);
                                        setDonationForm({ strips: '', tablets: '', address: '', pincode: '', phone: '', pickupDate: '', ngoName: '' });
                                        setDonateModalOpen(true);
                                    }}
                                    className="flex-1 bg-pink-50 text-pink-700 py-2 rounded-lg font-medium hover:bg-pink-100 transition flex justify-center items-center gap-2"
                                >
                                    <Heart size={18} /> Donate
                                </button>
                            )}
                            <button
                                onClick={() => handleRemove(med._id)}
                                className="flex-1 bg-gray-50 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-100 transition flex justify-center items-center gap-2">
                                <Trash2 size={18} /> Remove
                            </button>
                        </div>
                    </div>
                ))}
                {filteredMedicines.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-500">
                        No medicines found matching your criteria.
                    </div>
                )}
            </div>

            {/* Donation Modal */}
            {donateModalOpen && selectedMedForDonation && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-teal-600 p-4 text-white text-center font-medium">
                            Confirming donation details for pickup
                        </div>
                        <div className="p-8 space-y-6 max-h-[85vh] overflow-y-auto w-full text-left">
                            {/* Section 1 */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                    <Package className="w-5 h-5 mr-2 text-teal-500" /> Medicine Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Name</label>
                                        <input type="text" readOnly value={selectedMedForDonation.name} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (Strips)</label>
                                        <input type="number" min="0" max={(selectedMedForDonation.quantityStrips || 0) - (selectedMedForDonation.donatedStrips || 0)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder={`Max ${(selectedMedForDonation.quantityStrips || 0) - (selectedMedForDonation.donatedStrips || 0)}`} value={donationForm.strips} onChange={e => {
                                            const val = parseInt(e.target.value) || 0;
                                            const max = (selectedMedForDonation.quantityStrips || 0) - (selectedMedForDonation.donatedStrips || 0);
                                            if (val <= max && val >= 0) setDonationForm({...donationForm, strips: e.target.value});
                                        }} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (Tablets)</label>
                                        <input type="number" min="0" max={(selectedMedForDonation.quantityTablets || 0) - (selectedMedForDonation.donatedTablets || 0)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder={`Max ${(selectedMedForDonation.quantityTablets || 0) - (selectedMedForDonation.donatedTablets || 0)}`} value={donationForm.tablets} onChange={e => {
                                            const val = parseInt(e.target.value) || 0;
                                            const max = (selectedMedForDonation.quantityTablets || 0) - (selectedMedForDonation.donatedTablets || 0);
                                            if (val <= max && val >= 0) setDonationForm({...donationForm, tablets: e.target.value});
                                        }} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Donate To NGO (Optional)</label>
                                        <select
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                                            value={donationForm.ngoName}
                                            onChange={e => setDonationForm({...donationForm, ngoName: e.target.value})}
                                        >
                                            <option value="">Any Nearby NGO</option>
                                            {ngos.map(n => <option key={n.id} value={n.name}>{n.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                                        <div className="relative">
                                            <input type="text" readOnly value={new Date(selectedMedForDonation.expiryDate).toLocaleDateString()} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 outline-none" />
                                            <Calendar className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <hr className="border-gray-100" />
                            {/* Section 2 */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                    <MapPin className="w-5 h-5 mr-2 text-teal-500" /> Pickup Details
                                </h3>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Address</label>
                                            <input type="text" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Enter street/area details..." value={donationForm.address} onChange={e => setDonationForm({...donationForm, address: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code</label>
                                            <input type="text" required pattern="\d{6}" maxLength={6} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="e.g. 110001" value={donationForm.pincode} onChange={e => {
                                                const val = e.target.value.replace(/\D/g, '');
                                                if (val.length <= 6) setDonationForm({...donationForm, pincode: val});
                                            }} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                                            <div className="flex">
                                                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm font-medium">
                                                    +91
                                                </span>
                                                <input type="text" required pattern="\d{10}" maxLength={10} className="flex-1 w-full px-3 py-2 rounded-none rounded-r-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 outline-none" placeholder="9999988888" value={donationForm.phone} onChange={e => {
                                                    const val = e.target.value.replace(/\D/g, '');
                                                    if (val.length <= 10) setDonationForm({...donationForm, phone: val});
                                                }} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date</label>
                                            <input type="date" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white" value={donationForm.pickupDate} onChange={e => setDonationForm({...donationForm, pickupDate: e.target.value})} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Buttons */}
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setDonateModalOpen(false)} className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition">Cancel</button>
                                <button type="button" onClick={submitDonationForm} className="flex-1 bg-teal-800 text-white font-bold py-3 rounded-xl hover:bg-teal-900 shadow-lg transform hover:-translate-y-0.5 transition">Confirm Donation Schedule</button>
                            </div>
                            <p className="text-center text-xs text-gray-500">
                                By clicking Confirm, you agree to our donation terms. Medicines must not be expired or damaged.
                            </p>
                        </div>
                    </div>
                </div>
            )}
            {/* Success Celebration Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center relative overflow-hidden animate-in zoom-in duration-500 delay-150">
                        {/* Decorative background circle */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-teal-50 rounded-full mix-blend-multiply opacity-50 pointer-events-none"></div>

                        <div className="relative mx-auto w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center mb-6 shadow-inner ring-8 ring-white">
                            <PartyPopper className="w-12 h-12 text-teal-600 animate-bounce" />
                        </div>
                        
                        <h2 className="text-3xl font-extrabold text-gray-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-emerald-600">
                            Awesome!
                        </h2>
                        
                        <p className="text-gray-600 mb-8 leading-relaxed">
                            Your donation request has been created successfully. <br/>
                            <span className="font-semibold text-gray-800">Thank you for your generosity!</span>
                        </p>
                        
                        <button 
                            onClick={() => setShowSuccessModal(false)}
                            className="w-full bg-gradient-to-r from-teal-600 to-teal-500 text-white font-bold py-4 rounded-xl hover:from-teal-700 hover:to-teal-600 shadow-md transform hover:-translate-y-0.5 transition-all duration-200"
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
