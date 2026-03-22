"use client";

import React, { useState, useEffect } from 'react';
import { X, User, Settings, Users, LogOut, Mail, Phone, Calendar, Shield, Plus, Loader2 } from 'lucide-react';
import { useAuth, authHeaders } from '@/context/AuthContext';
import FamilyMemberCard from './FamilyMemberCard';
import AddFamilyMemberModal from './AddFamilyMemberModal';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function ProfilePanel({ isOpen, onClose }: Props) {
    const { user, logout } = useAuth();
    const [familyMembers, setFamilyMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingMember, setEditingMember] = useState<any>(null);

    useEffect(() => {
        if (isOpen && user) {
            fetchFamilyMembers();
        }
    }, [isOpen, user]);

    const fetchFamilyMembers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/family-members', {
                headers: authHeaders()
            });
            const data = await res.json();
            
            if (res.ok) {
                // Ensure data is array before setting
                setFamilyMembers(Array.isArray(data) ? data : []);
            } else {
                console.error(`Family fetch failed: ${res.status}`, data);
                setFamilyMembers([]);
            }
        } catch (error) {
            console.error("Failed to fetch family members:", error);
            setFamilyMembers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddMember = async (formData: any) => {
        try {
            const res = await fetch('/api/family-members', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...authHeaders()
                },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                fetchFamilyMembers();
            }
        } catch (error) {
            console.error("Failed to add family member");
        }
    };

    const handleUpdateMember = async (id: string, formData: any) => {
        try {
            const res = await fetch(`/api/family-members/${id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    ...authHeaders()
                },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                fetchFamilyMembers();
            }
        } catch (error) {
            console.error("Failed to update family member");
        }
    };

    const handleDeleteMember = async (id: string) => {
        if (!window.confirm("Are you sure you want to remove this family member? This will also remove them as a caretaker for others.")) {
            return;
        }

        try {
            const res = await fetch(`/api/family-members/${id}`, {
                method: 'DELETE',
                headers: authHeaders()
            });
            if (res.ok) {
                fetchFamilyMembers();
            }
        } catch (error) {
            console.error("Failed to delete family member");
        }
    };

    const handleOpenAddModal = () => {
        setEditingMember(null);
        setShowAddModal(true);
    };

    const handleOpenEditModal = (member: any) => {
        setEditingMember(member);
        setShowAddModal(true);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div 
                className="bg-white w-full max-w-3xl h-full shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-500 border-l border-teal-50"
            >
                {/* Header */}
                <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 py-6 flex items-center justify-between z-20">
                    <div className="flex items-center gap-4">
                        <div className="bg-teal-600 p-3 rounded-2xl text-white shadow-lg shadow-teal-100">
                            <User size={24} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Family Profile</h2>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-3 hover:bg-gray-100 rounded-2xl transition text-gray-400 hover:text-gray-900 group"
                    >
                        <X size={28} className="group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                </div>

                <div className="p-8 space-y-12 pb-24">
                    {/* User Info Section */}
                    <section>
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] ml-2 font-mono">My Account</h3>
                            <button className="bg-gray-50 text-gray-600 p-2 rounded-xl hover:bg-gray-100 transition border border-gray-100 shadow-sm">
                                <Settings size={20} />
                            </button>
                        </div>
                        
                        <div className="bg-gradient-to-br from-gray-50 to-white rounded-[2.5rem] p-8 border border-gray-100 flex flex-col md:flex-row gap-8 items-center md:items-start shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Shield size={120} />
                            </div>
                            <div className="h-28 w-28 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 text-4xl font-black shadow-inner border-[6px] border-white relative z-10">
                                {user?.name.charAt(0)}
                            </div>
                            <div className="flex-1 space-y-6 relative z-10 text-center md:text-left">
                                <div>
                                    <h4 className="text-4xl font-black text-gray-900 leading-none mb-2">{user?.name}</h4>
                                    <span className="bg-teal-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                                        {user?.role}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                                    <div className="flex items-center justify-center md:justify-start gap-3 text-gray-600 font-bold group/item">
                                        <div className="bg-white p-2 rounded-lg shadow-sm group-hover/item:text-teal-600 transition">
                                            <Mail size={16} />
                                        </div>
                                        <span className="text-sm">{user?.email}</span>
                                    </div>
                                    <div className="flex items-center justify-center md:justify-start gap-3 text-gray-600 font-bold group/item">
                                        <div className="bg-white p-2 rounded-lg shadow-sm group-hover/item:text-teal-600 transition">
                                            <Phone size={16} />
                                        </div>
                                        <span className="text-sm">{user?.phone || 'Add Phone'}</span>
                                    </div>
                                    <div className="flex items-center justify-center md:justify-start gap-3 text-gray-600 font-bold group/item">
                                        <div className="bg-white p-2 rounded-lg shadow-sm group-hover/item:text-teal-600 transition">
                                            <Calendar size={16} />
                                        </div>
                                        <span className="text-sm">Partner since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Family Members Section */}
                    <section>
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] ml-2 font-mono">Family Members</h3>
                                <div className="flex h-6 w-6 bg-teal-100 text-teal-700 items-center justify-center rounded-lg text-xs font-black shadow-sm">
                                    {familyMembers.length}
                                </div>
                            </div>
                            <button 
                                onClick={handleOpenAddModal}
                                className="bg-teal-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-teal-700 transition flex items-center gap-3 shadow-xl shadow-teal-100 active:scale-95 transform"
                            >
                                <Plus size={24} /> New Member
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-24 text-teal-600">
                                <Loader2 className="animate-spin mb-6 opacity-40" size={64} />
                                <p className="font-black text-xl tracking-tight opacity-60">Refreshing Family Circle...</p>
                            </div>
                        ) : familyMembers.length === 0 ? (
                            <div className="text-center py-24 bg-gray-50 rounded-[3rem] border-4 border-dashed border-gray-100 shadow-inner">
                                <div className="bg-white w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
                                    <Users className="text-gray-200" size={48} />
                                </div>
                                <h4 className="text-2xl font-black text-gray-900 mb-3">Your Circle is Empty</h4>
                                <p className="text-gray-500 font-bold max-w-sm mx-auto text-lg leading-relaxed">
                                    Start by adding your family members to monitor their health together.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {familyMembers.map((member: any) => (
                                    <FamilyMemberCard 
                                        key={member._id} 
                                        member={member} 
                                        onEdit={handleOpenEditModal}
                                        onDelete={handleDeleteMember}
                                    />
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                {/* Bottom Logout (now Sticky) */}
                <div className="sticky bottom-0 bg-white/80 backdrop-blur-md border-t border-gray-100 p-8 mt-auto z-20">
                    <button 
                        onClick={logout}
                        className="w-full bg-red-50 text-red-600 font-black py-6 rounded-3xl hover:bg-red-100 transition flex items-center justify-center gap-4 text-2xl group active:scale-[0.98] shadow-lg shadow-red-50/50"
                    >
                        <LogOut size={28} className="group-hover:translate-x-1 transition-transform" />
                        Log Out Account
                    </button>
                </div>
            </div>

            <AddFamilyMemberModal 
                isOpen={showAddModal} 
                onClose={() => setShowAddModal(false)} 
                onAdd={handleAddMember}
                onUpdate={handleUpdateMember}
                editingMember={editingMember}
                otherFamilyMembers={familyMembers}
            />
        </div>
    );
}
