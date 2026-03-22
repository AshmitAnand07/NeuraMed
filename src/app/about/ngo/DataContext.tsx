'use client';

import React, { createContext, useContext, useState } from 'react';

export interface DonationRequest {
  id: number;
  medicine: string;
  quantity: string;
  donor: string;
  location: string;
  expiry: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  pickupStatus?: 'Scheduled' | 'In Progress' | 'Completed';
  urgent: boolean;
}

const initialPending: DonationRequest[] = [
  {
    id: 1,
    medicine: 'Paracetamol 500mg',
    quantity: '50 Strips',
    donor: 'Rahul Sharma',
    location: 'Andheri West, Mumbai',
    expiry: 'Aug 2024',
    status: 'Pending',
    urgent: true,
  },
  {
    id: 2,
    medicine: 'Insulin Glargine',
    quantity: '10 Vials',
    donor: 'Priya Desai',
    location: 'Borivali East, Mumbai',
    expiry: 'Dec 2025',
    status: 'Pending',
    urgent: false,
  }
];

const initialApproved: DonationRequest[] = [
  {
    id: 3,
    medicine: 'Amoxicillin 250mg',
    quantity: '20 Strips',
    donor: 'Amit Kumar',
    location: 'Thane',
    expiry: 'Oct 2024',
    status: 'Approved',
    urgent: false,
  }
];

export interface Alert {
  id: number | string;
  type: 'request' | 'warning' | 'reminder';
  message: string;
  time: string;
}

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

const initialAlerts: Alert[] = [
  { id: 1, type: 'request', message: 'New donation request from Priya Desai.', time: '10 mins ago' },
  { id: 2, type: 'warning', message: 'Insulin Vials inventory is near expiry (Aug 2024).', time: '2 hours ago' },
];

interface DataContextType {
  pendingRequests: DonationRequest[];
  setPendingRequests: React.Dispatch<React.SetStateAction<DonationRequest[]>>;
  approvedRequests: DonationRequest[];
  setApprovedRequests: React.Dispatch<React.SetStateAction<DonationRequest[]>>;
  rejectedRequests: DonationRequest[];
  setRejectedRequests: React.Dispatch<React.SetStateAction<DonationRequest[]>>;
  updatePickupStatus: (id: number, status: 'Scheduled' | 'In Progress' | 'Completed') => void;
  alerts: Alert[];
  addAlert: (type: 'request' | 'warning' | 'reminder', message: string) => void;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [pendingRequests, setPendingRequests] = useState<DonationRequest[]>(initialPending);
  const [approvedRequests, setApprovedRequests] = useState<DonationRequest[]>(initialApproved);
  const [rejectedRequests, setRejectedRequests] = useState<DonationRequest[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const updatePickupStatus = (id: number, status: 'Scheduled' | 'In Progress' | 'Completed') => {
    setApprovedRequests(prev => prev.map(req => 
      req.id === id ? { ...req, pickupStatus: status } : req
    ));
  };

  const addAlert = (type: 'request' | 'warning' | 'reminder', message: string) => {
    setAlerts(prev => [{ id: Date.now(), type, message, time: 'Just now' }, ...prev]);
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  return (
    <DataContext.Provider value={{
      pendingRequests, setPendingRequests,
      approvedRequests, setApprovedRequests,
      rejectedRequests, setRejectedRequests,
      updatePickupStatus,
      alerts, addAlert,
      toasts, showToast
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
