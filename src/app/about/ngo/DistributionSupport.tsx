import React from 'react';
import { HeartHandshake, MapPin } from 'lucide-react';

export const DistributionSupport = () => {
  const supports = [
    {
      id: 1,
      beneficiary: 'Smile Foundation Shelter',
      medicine: 'Paracetamol, Vitamin C',
      quantity: '200 Strips total',
      location: 'Dharavi, Mumbai',
      status: 'Pending',
    },
    {
      id: 2,
      beneficiary: 'Rural Health Clinic',
      medicine: 'Amoxicillin, Bandages',
      quantity: '5 Boxes',
      location: 'Palghar',
      status: 'Distributed',
    }
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <HeartHandshake className="w-6 h-6 text-teal-600" />
          <h2 className="text-xl font-bold text-gray-800">Distribution Support</h2>
        </div>
      </div>

      <div className="space-y-4">
        {supports.map((item) => (
          <div key={item.id} className="p-4 rounded-xl border border-gray-100 hover:border-teal-100 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-gray-800">{item.beneficiary}</h3>
              <span className={`text-xs px-2.5 py-1 rounded-md font-semibold ${item.status === 'Distributed' ? 'bg-teal-50 text-teal-700' : 'bg-amber-50 text-amber-700'}`}>
                {item.status}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-700 mb-1">{item.medicine} <span className="text-gray-400 font-normal">({item.quantity})</span></p>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <MapPin className="w-3.5 h-3.5" /> {item.location}
            </div>
            
            {item.status === 'Pending' && (
              <button className="w-full mt-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-700 font-medium rounded-lg text-sm transition-colors">
                Mark as Distributed
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
