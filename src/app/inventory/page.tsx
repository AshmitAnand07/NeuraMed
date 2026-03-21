"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth, authHeaders } from '@/context/AuthContext';
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
            try {
                const res = await fetch('/api/medicines', { headers: authHeaders() });
                if (res.ok) {
                    const data = await res.json();
                    setMedicines(Array.isArray(data) ? data : []);
                    setFilteredMedicines(Array.isArray(data) ? data : []);
                }
            } catch (err) {
                console.error("Failed to fetch medicines", err);
            }
        }
    };

    useEffect(() => {
        let res = medicines;
        if (search) {
            res = res.filter(m => m.name?.toLowerCase().includes(search.toLowerCase()));
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
            const res = await fetch(`/api/medicines?id=${id}`, { 
                method: 'DELETE',
                headers: authHeaders()
            });
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 mt-4 md:mt-0">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">Medicine Inventory</h1>
                <div className="flex md:flex-row gap-3">
                    <Link href="/donations" className="flex-1 justify-center bg-pink-50 text-pink-700 px-6 py-3 md:py-2 rounded-xl font-bold hover:bg-pink-100 transition flex items-center gap-2 shadow-sm border border-pink-100 text-lg">
                        <Heart size={24} /> Donations
                    </Link>
                    <Link href="/add-medicine" className="flex-1 justify-center bg-teal-600 text-white px-6 py-3 md:py-2 rounded-xl font-bold hover:bg-teal-700 transition flex items-center gap-2 shadow-sm border border-teal-700 text-lg">
                        <Plus size={24} /> Add New
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 mb-8 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-4 text-gray-500" size={24} />
                    <input
                        type="text"
                        placeholder="Search medicines..."
                        className="w-full pl-12 pr-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-teal-100 focus:border-teal-500 outline-none transition"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3">
                    <Filter size={24} className="text-gray-500 hidden md:block" />
                    <select
                        className="w-full md:w-auto border-2 border-gray-200 rounded-xl py-3 px-4 text-lg focus:ring-4 focus:ring-teal-100 focus:border-teal-500 outline-none transition font-medium"
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
                    <div key={med._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 hover:shadow-md transition">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="font-extrabold text-2xl text-gray-900 mb-1">{med.name}</h3>
                                <p className="text-lg text-gray-600 font-medium bg-gray-50 inline-block px-3 py-1 rounded-lg">{med.category} • {med.familyMember}</p>
                            </div>
                            <div className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider border
                  ${med.status === 'safe' ? 'bg-green-100 text-green-800 border-green-200' :
                    med.status === 'expiring' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-red-100 text-red-800 border-red-200'}`}>
                                {med.status}
                            </div>
                        </div>

                        <div className="space-y-4 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div className="flex justify-between text-lg items-center">
                                <span className="text-gray-600 font-medium">Expiring Date:</span>
                                <span className="font-bold text-gray-900">{new Date(med.expiryDate).toLocaleDateString()}</span>
                            </div>
                            {med.mrp && (
                                <div className="flex justify-between text-lg items-center">
                                    <span className="text-gray-600 font-medium">MRP:</span>
                                    <span className="font-bold text-gray-900">₹{med.mrp}</span>
                                </div>
                            )}
                            {(() => {
                                const remStrips = (med.quantityStrips || 0) - (med.donatedStrips || 0);
                                const remTabs = (med.quantityTablets || 0) - (med.donatedTablets || 0);
                                if (remStrips > 0 || remTabs > 0) {
                                    return (
                                        <div className="flex justify-between text-lg items-center pt-2 border-t border-gray-200 mt-2">
                                            <span className="text-gray-600 font-bold">Remaining:</span>
                                            <span className="font-extrabold text-teal-700 bg-teal-50 px-3 py-1 rounded-lg">
                                                {remStrips > 0 ? `${remStrips} Strips ` : ''}
                                                {remTabs > 0 ? `${remTabs} Tabs` : ''}
                                            </span>
                                        </div>
                                    );
                                }
                                return null;
                            })()}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            {med.status !== 'expired' && ((med.quantityStrips || 0) - (med.donatedStrips || 0) > 0 || (med.quantityTablets || 0) - (med.donatedTablets || 0) > 0) && (
                                <button
                                    onClick={() => {
                                        setSelectedMedForDonation(med);
                                        setDonationForm({ strips: '', tablets: '', address: '', pincode: '', phone: '', pickupDate: '', ngoName: '' });
                                        setDonateModalOpen(true);
                                    }}
                                    className="flex-1 bg-pink-100 text-pink-700 py-3 md:py-4 rounded-xl font-bold text-lg hover:bg-pink-200 transition flex justify-center items-center gap-2"
                                >
                                    <Heart size={24} /> Donate To Need
                                </button>
                            )}
                            <button
                                onClick={() => handleRemove(med._id)}
                                className="flex-1 bg-gray-100 text-gray-700 py-3 md:py-4 rounded-xl font-bold text-lg hover:bg-gray-200 transition flex justify-center items-center gap-2">
                                <Trash2 size={24} /> Remove Item
                            </button>
                        </div>
                    </div>
                ))}
                {filteredMedicines.length === 0 && (
                    <div className="col-span-full py-16 text-center text-gray-500 bg-white rounded-2xl border border-gray-200">
                        <p className="text-2xl font-bold">No medicines found matching your criteria.</p>
                        <p className="text-lg mt-2">Try adjusting your filters or use the Add New button.</p>
                    </div>
                )}
            </div>

            {/* Donation Modal Slide-up on mobile */}
            {donateModalOpen && selectedMedForDonation && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4">
                    <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] sm:max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
                        <div className="bg-teal-700 p-5 sm:p-4 text-white text-center font-bold text-lg sm:text-left flex justify-between items-center relative">
                            {/* Drag handle for mobile */}
                            <div className="w-12 h-1.5 bg-white/30 rounded-full absolute top-2 left-1/2 -translate-x-1/2 sm:hidden"></div>
                            Confirming Donation for Pickup
                        </div>
                        <div className="p-6 sm:p-8 space-y-8 overflow-y-auto w-full text-left flex-1 pb-32 sm:pb-8">
                            {/* Section 1 */}
                            <div>
                                <h3 className="text-xl font-extrabold text-gray-900 mb-5 flex items-center">
                                    <Package className="w-6 h-6 mr-3 text-teal-600" /> Medicine Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm sm:text-base font-bold text-gray-700 mb-2">Medicine Name</label>
                                        <input type="text" readOnly value={selectedMedForDonation.name} className="w-full px-4 sm:px-5 py-3 sm:py-4 text-lg border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-600 font-medium outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm sm:text-base font-bold text-gray-700 mb-2">Quantity (Strips)</label>
                                        <input type="number" min="0" max={(selectedMedForDonation.quantityStrips || 0) - (selectedMedForDonation.donatedStrips || 0)} className="w-full px-4 sm:px-5 py-3 sm:py-4 text-lg font-bold border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-teal-100 focus:border-teal-500 outline-none" placeholder={`Max ${(selectedMedForDonation.quantityStrips || 0) - (selectedMedForDonation.donatedStrips || 0)}`} value={donationForm.strips} onChange={e => {
                                            const val = parseInt(e.target.value) || 0;
                                            const max = (selectedMedForDonation.quantityStrips || 0) - (selectedMedForDonation.donatedStrips || 0);
                                            if (val <= max && val >= 0) setDonationForm({...donationForm, strips: e.target.value});
                                        }} />
                                    </div>
                                    <div>
                                        <label className="block text-sm sm:text-base font-bold text-gray-700 mb-2">Quantity (Tablets)</label>
                                        <input type="number" min="0" max={(selectedMedForDonation.quantityTablets || 0) - (selectedMedForDonation.donatedTablets || 0)} className="w-full px-4 sm:px-5 py-3 sm:py-4 text-lg font-bold border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-teal-100 focus:border-teal-500 outline-none" placeholder={`Max ${(selectedMedForDonation.quantityTablets || 0) - (selectedMedForDonation.donatedTablets || 0)}`} value={donationForm.tablets} onChange={e => {
                                            const val = parseInt(e.target.value) || 0;
                                            const max = (selectedMedForDonation.quantityTablets || 0) - (selectedMedForDonation.donatedTablets || 0);
                                            if (val <= max && val >= 0) setDonationForm({...donationForm, tablets: e.target.value});
                                        }} />
                                    </div>
                                    <div>
                                        <label className="block text-sm sm:text-base font-bold text-gray-700 mb-2">Donate To NGO (Optional)</label>
                                        <select
                                            className="w-full px-4 sm:px-5 py-3 sm:py-4 text-lg font-medium border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-teal-100 focus:border-teal-500 outline-none bg-white"
                                            value={donationForm.ngoName}
                                            onChange={e => setDonationForm({...donationForm, ngoName: e.target.value})}
                                        >
                                            <option value="">Any Nearby NGO</option>
                                            {ngos.map(n => <option key={n.id} value={n.name}>{n.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm sm:text-base font-bold text-gray-700 mb-2">Expiry Date</label>
                                        <div className="relative">
                                            <input type="text" readOnly value={new Date(selectedMedForDonation.expiryDate).toLocaleDateString()} className="w-full px-4 sm:px-5 py-3 sm:py-4 text-lg font-bold border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-600 outline-none" />
                                            <Calendar className="absolute right-4 top-3.5 w-6 h-6 text-gray-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <hr className="border-2 border-gray-100" />
                            {/* Section 2 */}
                            <div>
                                <h3 className="text-xl font-extrabold text-gray-900 mb-5 flex items-center">
                                    <MapPin className="w-6 h-6 mr-3 text-teal-600" /> Pickup Details
                                </h3>
                                <div className="space-y-5 sm:space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm sm:text-base font-bold text-gray-700 mb-2">Pickup Address</label>
                                            <input type="text" required className="w-full px-4 sm:px-5 py-3 sm:py-4 text-lg font-medium border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-teal-100 focus:border-teal-500 outline-none" placeholder="Enter street/area details..." value={donationForm.address} onChange={e => setDonationForm({...donationForm, address: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className="block text-sm sm:text-base font-bold text-gray-700 mb-2">PIN Code</label>
                                            <input type="tel" required pattern="\d{6}" maxLength={6} className="w-full px-4 sm:px-5 py-3 sm:py-4 text-lg font-medium border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-teal-100 focus:border-teal-500 outline-none" placeholder="e.g. 110001" value={donationForm.pincode} onChange={e => {
                                                const val = e.target.value.replace(/\D/g, '');
                                                if (val.length <= 6) setDonationForm({...donationForm, pincode: val});
                                            }} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                                        <div>
                                            <label className="block text-sm sm:text-base font-bold text-gray-700 mb-2">Contact Phone</label>
                                            <div className="flex">
                                                <span className="inline-flex items-center px-4 rounded-l-xl border-2 border-r-0 border-gray-300 bg-gray-50 text-gray-600 text-lg font-bold">
                                                    +91
                                                </span>
                                                <input type="tel" required pattern="\d{10}" maxLength={10} className="flex-1 w-full px-4 sm:px-5 py-3 sm:py-4 text-lg font-medium rounded-none rounded-r-xl border-2 border-gray-300 focus:ring-4 focus:ring-teal-100 focus:border-teal-500 outline-none" placeholder="9999988888" value={donationForm.phone} onChange={e => {
                                                    const val = e.target.value.replace(/\D/g, '');
                                                    if (val.length <= 10) setDonationForm({...donationForm, phone: val});
                                                }} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm sm:text-base font-bold text-gray-700 mb-2">Preferred Date</label>
                                            <input type="date" required className="w-full px-4 sm:px-5 py-3 sm:py-4 text-lg font-medium border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-teal-100 focus:border-teal-500 outline-none bg-white" value={donationForm.pickupDate} onChange={e => setDonationForm({...donationForm, pickupDate: e.target.value})} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Sticky Buttons on Mobile */}
                        <div className="p-4 sm:p-6 border-t border-gray-100 bg-white sm:relative absolute bottom-0 left-0 w-full flex flex-col sm:flex-row gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] sm:shadow-none">
                            <button type="button" onClick={() => setDonateModalOpen(false)} className="flex-1 bg-gray-100 text-gray-700 font-extrabold text-lg py-4 sm:py-3 rounded-xl hover:bg-gray-200 transition order-2 sm:order-1">Cancel</button>
                            <button type="button" onClick={submitDonationForm} className="flex-1 bg-teal-700 text-white font-extrabold text-lg py-4 sm:py-3 rounded-xl hover:bg-teal-800 shadow-lg transform hover:-translate-y-0.5 transition order-1 sm:order-2">Confirm Schedule</button>
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
