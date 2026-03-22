'use client';

import React, { useState } from 'react';
import { Clock, MapPin, User, AlertCircle, Package, CheckCircle2, XCircle } from 'lucide-react';
import { useData, DonationRequest } from './DataContext';

export const DonationRequests = () => {
  const { 
    pendingRequests, setPendingRequests, 
    approvedRequests, setApprovedRequests, 
    rejectedRequests, setRejectedRequests,
    addAlert, showToast
  } = useData();
  
  const [activeTab, setActiveTab] = useState<'Pending' | 'Approved' | 'Rejected'>('Pending');

  const handleAccept = (req: DonationRequest) => {
    setPendingRequests(prev => prev.filter(r => r.id !== req.id));
    setApprovedRequests(prev => [{...req, status: 'Approved', pickupStatus: 'Scheduled'}, ...prev]);
    addAlert('reminder', `Pickup scheduled at ${req.location} for ${req.medicine}.`);
    showToast(`Request for ${req.medicine} approved!`, 'success');
  };

  const handleReject = (req: DonationRequest) => {
    setPendingRequests(prev => prev.filter(r => r.id !== req.id));
    setRejectedRequests(prev => [{...req, status: 'Rejected'}, ...prev]);
    showToast(`Request for ${req.medicine} declined.`, 'info');
  };

  const currentList = 
    activeTab === 'Pending' ? pendingRequests :
    activeTab === 'Approved' ? approvedRequests :
    rejectedRequests;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 overflow-hidden flex flex-col h-full min-h-[500px]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Donation Requests</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-100 pb-2">
        {(['Pending', 'Approved', 'Rejected'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === tab 
                ? 'bg-emerald-50 text-emerald-700' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
            }`}
          >
            {tab}
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              activeTab === tab ? 'bg-emerald-200/50 text-emerald-800' : 'bg-gray-100 text-gray-600'
            }`}>
              {tab === 'Pending' ? pendingRequests.length : tab === 'Approved' ? approvedRequests.length : rejectedRequests.length}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto pr-2 scrollbar-hide">
        {currentList.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 py-12">
            <Package className="w-12 h-12 mb-3 opacity-20" />
            <p>No {activeTab.toLowerCase()} requests found.</p>
          </div>
        ) : currentList.map((req) => (
          <div key={req.id} className="p-5 rounded-2xl border border-gray-100 hover:border-emerald-100 hover:bg-emerald-50/50 transition-colors animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className={`font-bold text-lg ${req.urgent ? 'text-red-700' : 'text-gray-800'}`}>
                    {req.medicine}
                  </h3>
                  {req.urgent && (
                    <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-md">
                      <AlertCircle className="w-3 h-3" /> Urgent (Near Expiry)
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1.5"><Package className="w-4 h-4 text-gray-400" /> Qty: {req.quantity}</div>
                  <div className="flex items-center gap-1.5"><User className="w-4 h-4 text-gray-400" /> {req.donor}</div>
                  <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-gray-400" /> {req.location}</div>
                  <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-gray-400" /> Exp: {req.expiry}</div>
                </div>
              </div>

              {req.status === 'Pending' ? (
                <div className="flex gap-2 w-full md:w-auto">
                  <button 
                    onClick={() => handleAccept(req)}
                    className="flex-1 md:flex-none px-4 py-2 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve
                  </button>
                  <button 
                    onClick={() => handleReject(req)}
                    className="flex-1 md:flex-none px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" /> Decline
                  </button>
                </div>
              ) : (
                <span className={`px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-1.5 ${
                  req.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                }`}>
                  {req.status === 'Approved' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  {req.status}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
