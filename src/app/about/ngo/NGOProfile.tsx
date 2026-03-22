import React from 'react';
import { Building2, MapPin, Phone, Mail, Clock } from 'lucide-react';

export const NGOProfile = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
            <Building2 className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">NeuraMed Foundation</h2>
            <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-md">Verified NGO</span>
          </div>
        </div>
        <button className="text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors">Edit</button>
      </div>

      <div className="space-y-4">
        <div className="flex items-start gap-3 text-sm text-gray-600">
          <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
          <span>12, Sunrise Avenue, Bandra West, Mumbai, 400050</span>
        </div>
        
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <Phone className="w-4 h-4 text-gray-400 shrink-0" />
          <span>+91 98765 43210</span>
        </div>

        <div className="flex items-center gap-3 text-sm text-gray-600">
          <Mail className="w-4 h-4 text-gray-400 shrink-0" />
          <span>contact@neuramed.ngo</span>
        </div>

        <div className="flex items-center gap-3 text-sm text-gray-600 pt-2 border-t border-gray-100">
          <Clock className="w-4 h-4 text-gray-400 shrink-0" />
          <span><strong className="text-gray-800">Operating Hours:</strong> 09:00 AM - 06:00 PM</span>
        </div>
      </div>
    </div>
  );
};
