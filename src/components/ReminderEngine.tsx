'use client';

import React, { useState, useEffect } from 'react';
import { useAuth, authHeaders } from '@/context/AuthContext';
import ReminderNotification from './ReminderNotification';

export default function ReminderEngine() {
   const { user } = useAuth();
   const [medicines, setMedicines] = useState<any[]>([]);
   const [activeReminder, setActiveReminder] = useState<any | null>(null);

  useEffect(() => {
    if (user) {
      fetchMedicines();
    }
    // Poll every minute
    const interval = setInterval(() => {
      if (user) fetchMedicines();
    }, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchMedicines = async () => {
    try {
      const res = await fetch('/api/medicines', { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setMedicines(data);
        checkReminders(data);
      }
    } catch (err) {
      console.error('Failed to fetch medicines for reminder engine', err);
    }
  };

  const checkReminders = (meds: any[]) => {
    if (activeReminder) return; // Don't trigger if one is already active

    const currentHour = new Date().getHours();
    let currentTimeSlot = '';

    if (currentHour >= 6 && currentHour < 12) currentTimeSlot = 'Morning';
    else if (currentHour >= 12 && currentHour < 17) currentTimeSlot = 'Afternoon';
    else if (currentHour >= 17 && currentHour < 21) currentTimeSlot = 'Evening';
    else currentTimeSlot = 'Night';

    const todayDateStr = new Date().toDateString();

    for (const med of meds) {
      // Check if medicine matches time slot
      if (med.time && med.time.toLowerCase().includes(currentTimeSlot.toLowerCase())) {
        // Check if already taken today
        const lastTakenStr = med.lastTakenDate ? new Date(med.lastTakenDate).toDateString() : '';
        if (lastTakenStr !== todayDateStr) {
          setActiveReminder(med);
          break; // Show one reminder at a time
        }
      }
    }
  };

  const handleConfirm = async (medicineId: string) => {
    try {
      // Update lastTakenDate
      const res = await fetch(`/api/medicines/${medicineId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          ...authHeaders()
        },
        body: JSON.stringify({
          lastTakenDate: new Date().toISOString()
        })
      });
      if (res.ok) {
        setActiveReminder(null);
        fetchMedicines(); // Refresh so we don't trigger again today
      }
    } catch (error) {
      console.error('Failed to confirm medicine', error);
    }
  };

  const handleDismiss = async (medicineId: string) => {
    // Caretaker alert is handled inside ReminderNotification onDismiss!
    // We just need to close the modal here and perhaps set a 20-min snooze in a real app.
    // MVP: Just close it. It will pop up again next poll if within the time window, or we can mark it "snoozed" locally.
    setActiveReminder(null);
  };

  if (!user || !activeReminder) return null;

  return (
    <ReminderNotification 
       medicine={activeReminder} 
       onConfirm={handleConfirm}
       onDismiss={handleDismiss}
    />
  );
}
