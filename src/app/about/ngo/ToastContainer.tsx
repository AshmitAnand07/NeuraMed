import React from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { useData } from './DataContext';

export const ToastContainer = () => {
  const { toasts } = useData();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            pointer-events-auto
            flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl border
            animate-in slide-in-from-right-full duration-500 ease-out
            ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : ''}
            ${toast.type === 'error' ? 'bg-red-50 border-red-100 text-red-800' : ''}
            ${toast.type === 'info' ? 'bg-blue-50 border-blue-100 text-blue-800' : ''}
          `}
        >
          {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-600" />}
          {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600" />}
          {toast.type === 'info' && <Info className="w-5 h-5 text-blue-600" />}
          
          <span className="text-sm font-semibold tracking-tight">{toast.message}</span>
          
          <button className="ml-2 hover:opacity-70 transition-opacity">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
