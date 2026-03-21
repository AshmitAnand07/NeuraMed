'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, CheckCircle2, XCircle, AlertTriangle, Loader2 } from 'lucide-react';

interface Medicine {
  _id: string;
  name: string;
  dosage: string;
  time: string;
  frequency: string;
  familyMember?: string;
}

interface ReminderNotificationProps {
  medicine: Medicine;
  onConfirm: (medicineId: string) => void;
  onDismiss: (medicineId: string) => void;
}

const ReminderNotification: React.FC<ReminderNotificationProps> = ({ medicine, onConfirm, onDismiss }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [responseCount, setResponseCount] = useState(0);
  const [isAlertingCaretaker, setIsAlertingCaretaker] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isWaiting, setIsWaiting] = useState(false);

  // Web Speech API function
  const speak = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "hi-IN";
      utterance.rate = 1;
      utterance.pitch = 1;

      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  };

  const playVoiceReminder = () => {
    const familyText = medicine.familyMember ? `${medicine.familyMember} ke liye ` : '';
    speak(`${familyText}Dawa kha lo. Please take ${medicine.name} now.`);
  };

  // Auto-play on mount
  useEffect(() => {
    if (isVisible) {
      playVoiceReminder();
    }
  }, [isVisible, medicine]);

  const handleYes = () => {
    onConfirm(medicine._id);
  };

  const handleNo = () => {
    const newCount = responseCount + 1;
    setResponseCount(newCount);

    if (newCount === 1) {
      // First strike: snooze for 20 minutes
      setIsVisible(false);
      setIsWaiting(true);
      const TWENTY_MINUTES = 20 * 60 * 1000;
      
      setTimeout(() => {
        setIsVisible(true);
        setIsWaiting(false);
      }, TWENTY_MINUTES);
    }

    if (newCount >= 2) {
      // Second strike: notify caretaker and close
      notifyCaretaker();
    }
  };

  const notifyCaretaker = async () => {
    setIsAlertingCaretaker(true);
    try {
      await fetch('/api/prescriptions/alert-caretaker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicineId: medicine._id,
          message: `Alert: The patient has not taken their medicine (${medicine.name}) after reminders.`,
        }),
      });
    } catch (error) {
      console.error('Failed to notify caretaker', error);
    } finally {
      setIsAlertingCaretaker(false);
      onDismiss(medicine._id);
    }
  };

  if (isWaiting || !isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        
        <div className="bg-teal-500 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <AlertTriangle className="w-16 h-16 text-white mx-auto mb-4 animate-pulse" />
          <h2 className="text-3xl font-black text-white leading-tight">Time for Medicine!</h2>
          <p className="text-teal-100 mt-2 font-bold text-xl uppercase tracking-widest">
            {medicine.familyMember ? `For: ${medicine.familyMember}` : 'Please take your dose'}
          </p>
        </div>

        <div className="p-8">
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 mb-8 text-center shadow-inner">
            <h3 className="text-4xl font-extrabold text-gray-900 mb-2">{medicine.name}</h3>
            {medicine.dosage && (
              <p className="inline-block bg-teal-100 text-teal-800 px-4 py-1.5 rounded-full text-lg font-bold">
                {medicine.dosage}
              </p>
            )}
            <p className="text-gray-500 font-medium mt-4 text-lg">Schedule: <span className="text-gray-700 font-bold">{medicine.time}</span></p>
          </div>

          <div className="flex justify-center mb-8">
            <button
              onClick={playVoiceReminder}
              disabled={isPlaying}
              className={`flex items-center gap-3 px-8 py-4 rounded-full font-bold text-lg transition-all shadow-md
                ${isPlaying 
                  ? 'bg-teal-100 text-teal-700 cursor-not-allowed' 
                  : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 active:scale-95'}`}
            >
              <Volume2 className={`w-6 h-6 ${isPlaying ? 'animate-pulse' : ''}`} />
              <span>{isPlaying ? 'Speaking...' : 'Replay Voice Message'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleNo}
              disabled={isAlertingCaretaker}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 border-red-100 bg-red-50 text-red-600 hover:bg-red-100 transition-colors active:scale-95"
            >
              {isAlertingCaretaker ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : (
                <XCircle className="w-10 h-10" />
              )}
              <span className="font-bold text-lg leading-tight text-center">NO, Later</span>
            </button>
            <button
              onClick={handleYes}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 border-emerald-100 bg-emerald-500 text-white shadow-lg hover:bg-emerald-600 shadow-emerald-500/30 transition-all active:scale-95"
            >
              <CheckCircle2 className="w-10 h-10" />
              <span className="font-bold text-lg leading-tight text-center">YES, Taken</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReminderNotification;
