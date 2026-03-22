import React from 'react';
import { Activity, CheckCircle, PackagePlus, Truck } from 'lucide-react';

export const RecentActivity = () => {
  const activities = [
    {
      id: 1,
      action: 'Request accepted',
      details: 'Paracetamol 500mg (Rahul Sharma)',
      time: '10 mins ago',
      icon: <CheckCircle className="w-4 h-4 text-emerald-600" />,
      bg: 'bg-emerald-100'
    },
    {
      id: 2,
      action: 'Pickup completed',
      details: 'Navi Mumbai Hub - 5 boxes',
      time: '2 hours ago',
      icon: <Truck className="w-4 h-4 text-blue-600" />,
      bg: 'bg-blue-100'
    },
    {
      id: 3,
      action: 'Medicine added to inventory',
      details: 'Insulin Vials (10 units)',
      time: '5 hours ago',
      icon: <PackagePlus className="w-4 h-4 text-purple-600" />,
      bg: 'bg-purple-100'
    }
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="w-6 h-6 text-gray-800" />
        <h2 className="text-xl font-bold text-gray-800">Recent Activity</h2>
      </div>

      <div className="relative pl-3 space-y-6">
        {activities.map((activity, idx) => (
          <div key={activity.id} className="relative">
            {/* Timeline line */}
            {idx !== activities.length - 1 && (
              <div className="absolute top-6 left-1.5 w-0.5 h-full bg-gray-100"></div>
            )}
            
            <div className="flex gap-4 items-start">
              <div className={`shrink-0 w-8 h-8 rounded-full ${activity.bg} flex items-center justify-center ring-4 ring-white relative z-10 -ml-2.5`}>
                {activity.icon}
              </div>
              <div className="pt-1">
                <p className="text-sm font-semibold text-gray-800">{activity.action}</p>
                <p className="text-sm text-gray-500 mt-0.5">{activity.details}</p>
                <span className="text-xs font-medium text-gray-400 mt-1.5 block">{activity.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
