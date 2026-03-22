import React from 'react';
import { Package, CheckCircle, Truck, Gift, Pill } from 'lucide-react';
import { useData } from './DataContext';

export const OverviewCards = () => {
  const { pendingRequests, approvedRequests } = useData();

  const activePickups = approvedRequests.filter(req => req.pickupStatus !== 'Completed').length;
  const completedPickups = approvedRequests.filter(req => req.pickupStatus === 'Completed').length;

  const stats = [
    { label: 'Pending Requests', value: pendingRequests.length.toString(), icon: <Package className="w-6 h-6 text-amber-500" />, border: 'border-amber-100', bg: 'bg-amber-50' },
    { label: 'Accepted Requests', value: approvedRequests.length.toString(), icon: <CheckCircle className="w-6 h-6 text-emerald-500" />, border: 'border-emerald-100', bg: 'bg-emerald-50' },
    { label: 'Scheduled Pickups', value: activePickups.toString(), icon: <Truck className="w-6 h-6 text-blue-500" />, border: 'border-blue-100', bg: 'bg-blue-50' },
    { label: 'Completed Donations', value: (320 + completedPickups).toString(), icon: <Gift className="w-6 h-6 text-purple-500" />, border: 'border-purple-100', bg: 'bg-purple-50' },
    { label: 'Available Medicines', value: (1450 + completedPickups).toString(), icon: <Pill className="w-6 h-6 text-indigo-500" />, border: 'border-indigo-100', bg: 'bg-indigo-50' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {stats.map((stat, idx) => (
        <div key={idx} className={`rounded-2xl border ${stat.border} ${stat.bg} p-6 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow`}>
          <div className="mb-3 bg-white p-3 rounded-xl shadow-sm">
            {stat.icon}
          </div>
          <h3 className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</h3>
          <p className="text-sm font-medium text-gray-500">{stat.label}</p>
        </div>
      ))}
    </div>
  );
};
