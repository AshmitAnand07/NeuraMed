import React from 'react';
import { Bell, AlertTriangle, Package, CalendarClock } from 'lucide-react';
import { useData } from './DataContext';

const alertIcons = {
  request: { icon: <Package className="w-5 h-5 text-emerald-600" />, bg: 'bg-emerald-50' },
  warning: { icon: <AlertTriangle className="w-5 h-5 text-red-600" />, bg: 'bg-red-50' },
  reminder: { icon: <CalendarClock className="w-5 h-5 text-blue-600" />, bg: 'bg-blue-50' },
};

export const AlertsNotifications = () => {
  const { alerts } = useData();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <Bell className="w-6 h-6 text-gray-800" />
        <h2 className="text-xl font-bold text-gray-800">Alerts & Reminders</h2>
      </div>

      <div className="flex flex-col gap-3">
        {alerts.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No new alerts</p>
        ) : alerts.map((alert) => {
          const style = alertIcons[alert.type] || alertIcons.reminder;
          return (
            <div key={alert.id} className="flex gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors animate-in fade-in slide-in-from-right-4 duration-300">
              <div className={`mt-0.5 shrink-0 w-10 h-10 rounded-full ${style.bg} flex items-center justify-center`}>
                {style.icon}
              </div>
              <div>
                <p className="text-sm text-gray-800 font-medium leading-snug">{alert.message}</p>
                <span className="text-xs text-gray-400 mt-1 block">{alert.time}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
