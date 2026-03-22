'use client';

import React, { useState, useRef, ChangeEvent } from 'react';
import { Camera, Upload, Loader2, AlertCircle, FileText, CheckCircle } from 'lucide-react';
import { authHeaders } from '@/context/AuthContext';

interface PrescriptionUploaderProps {
  onUploadSuccess?: (medicines: any[]) => void;
}

const PrescriptionUploader: React.FC<PrescriptionUploaderProps> = ({ onUploadSuccess }) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
      setSuccessMsg(null);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleProcessPrescription = async () => {
    if (!selectedImage) return;

    setIsProcessing(true);
    setError(null);
    setSuccessMsg(null);

    const formData = new FormData();
    formData.append('image', selectedImage);

    try {
      const headers = new Headers(authHeaders());
      headers.delete('Content-Type');

      const response = await fetch('/api/prescriptions/process', {
        method: 'POST',
        headers,
        body: formData,
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error(`Server Error: ${response.status} ${response.statusText}`);
      }

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to process prescription');
      }

      setSuccessMsg(`Successfully extracted ${data.data.length} medicines and added to your schedule!`);
      
      if (onUploadSuccess) {
        onUploadSuccess(data.data);
      }
      
    } catch (err: any) {
      setError(err.message || 'An error occurred during AI processing.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-gradient-to-br from-indigo-50 to-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-indigo-100 mb-10 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-8 sm:p-10">
        <div className="flex items-start gap-5 mb-8">
          <div className="bg-indigo-100 p-4 rounded-2xl shadow-inner flex-shrink-0">
            <FileText className="w-8 h-8 text-indigo-700" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-indigo-950 tracking-tight">Smart Prescription</h3>
            <p className="text-base text-indigo-800/70 font-medium">Upload prescription & let AI schedule it</p>
          </div>
        </div>

        {/* Upload/Preview Area */}
        <div 
          className={`relative group border-[3px] border-dashed rounded-[2.5rem] transition-all duration-300 overflow-hidden flex flex-col items-center justify-center
            ${previewUrl ? 'border-indigo-500 bg-indigo-50/20' : 'border-indigo-200 bg-white hover:border-indigo-400 hover:bg-indigo-50/50 shadow-sm'}
            min-h-[220px] active:scale-[0.98]`}
        >
          <input
            type="file"
            onChange={handleImageChange}
            accept="image/*"
            capture="environment"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          {previewUrl ? (
            <div className="relative w-full h-full min-h-[200px] flex items-center justify-center p-6 bg-indigo-50/50">
              <img 
                src={previewUrl} 
                alt="Prescription Preview" 
                className="max-h-[160px] w-auto rounded-3xl shadow-xl object-contain ring-4 ring-white"
              />
              <div className="absolute inset-0 bg-indigo-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                <div className="bg-white px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg scale-90 group-hover:scale-100 transition-transform">
                  <Camera className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm font-black text-indigo-900 uppercase">Retake</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center px-6 text-center relative w-full">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white px-4">
                 <div className="bg-indigo-100/50 p-3 rounded-2xl border border-indigo-200">
                    <Camera className="w-8 h-8 text-indigo-600" />
                 </div>
              </div>
              <p className="text-2xl font-black text-indigo-950 mb-2 mt-2 leading-tight">Tap to capture <br/> full prescription</p>
              <p className="text-base text-indigo-700/80 font-bold bg-indigo-50 px-4 py-1.5 rounded-full mt-2">AI extracts medicines & times</p>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-10">
          <button
            onClick={handleProcessPrescription}
            disabled={!selectedImage || isProcessing}
            className={`w-full py-6 rounded-[2rem] font-black text-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.97] shadow-xl
              ${!selectedImage || isProcessing 
                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed shadow-none' 
                : 'bg-gradient-to-br from-indigo-600 to-indigo-800 text-white hover:shadow-indigo-900/20 hover:scale-[1.01]'}`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-8 h-8 animate-spin text-white" />
                <span>AI is Extracting...</span>
              </>
            ) : (
              <span>Process Prescription</span>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-8 flex gap-3 p-5 bg-red-50 border border-red-100 rounded-[2rem] animate-in slide-in-from-top-2">
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
            <p className="text-base text-red-800 font-black">{error}</p>
          </div>
        )}

        {successMsg && (
          <div className="mt-8 flex gap-3 p-5 bg-emerald-50 border border-emerald-100 rounded-[2rem] animate-in slide-in-from-top-2">
            <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" />
            <p className="text-base text-emerald-800 font-black">{successMsg}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrescriptionUploader;
