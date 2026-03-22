'use client';

import React from 'react';
import { MapPin, Calendar, Clock, Truck, Package } from 'lucide-react';
import { useData } from './DataContext';

export const PickupScheduling = () => {
  const { approvedRequests, updatePickupStatus, showToast } = useData();

  const pickups = approvedRequests
    .filter(req => req.pickupStatus !== 'Completed')
    .map((req, idx) => ({
      id: `#PU-${2100 + req.id}`,
      originalId: req.id,
      donor: req.donor,
      items: `${req.quantity} ${req.medicine}`,
      address: req.location,
      date: 'Tomorrow',
      time: '10:00 AM - 12:00 PM',
      status: req.pickupStatus || 'Scheduled',
    }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'bg-blue-100 text-blue-700';
      case 'In Progress': return 'bg-amber-100 text-amber-700';
      case 'Completed': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleStatusUpdate = (id: number, status: 'Scheduled' | 'In Progress' | 'Completed') => {
    updatePickupStatus(id, status);
    if (status === 'In Progress') {
      showToast('Pickup started!', 'info');
    } else if (status === 'Completed') {
      showToast('Pickup completed and moved to inventory!', 'success');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <Truck className="w-6 h-6 text-indigo-600" />
        <h2 className="text-xl font-bold text-gray-800">Pickup Scheduling & Tracking</h2>
      </div>

      <div className="space-y-4">
        {pickups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <Package className="w-12 h-12 mb-3 opacity-20" />
            <p className="font-medium text-slate-500">No scheduled pickups.</p>
            <p className="text-sm">Approve donation requests to schedule pickups.</p>
          </div>
        ) : (
          pickups.map((pickup) => (
            <div key={pickup.id} className="relative pl-6 border-l-2 border-indigo-100 pb-4 last:pb-0 last:border-transparent animate-in fade-in slide-in-from-left-4 duration-500">
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:border-indigo-100 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-xs font-bold text-indigo-600 mb-1 block">{pickup.id}</span>
                    <h3 className="font-bold text-gray-800">{pickup.donor}</h3>
                    <p className="text-sm text-gray-500">{pickup.items}</p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold ${getStatusColor(pickup.status)}`}>
                    {pickup.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-200/60">
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                    <span className="leading-snug">{pickup.address}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-400" /> {pickup.date}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4 text-gray-400" /> {pickup.time}
                    </div>
                  </div>
                </div>

                {/* Interactive Status Buttons */}
                <div className="mt-4 flex justify-end">
                   {pickup.status === 'Scheduled' && (
                     <button 
                       onClick={() => handleStatusUpdate(pickup.originalId, 'In Progress')}
                       className="text-sm px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg font-semibold transition-colors">
                       Start Pickup
                     </button>
                   )}
                   {pickup.status === 'In Progress' && (
                     <button 
                       onClick={() => handleStatusUpdate(pickup.originalId, 'Completed')}
                       className="text-sm px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg font-semibold transition-colors">
                       Mark Completed
                     </button>
                   )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
