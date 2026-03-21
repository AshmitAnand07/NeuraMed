'use client';

import React, { useState, useRef, ChangeEvent } from 'react';
import { Camera, Upload, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { authHeaders } from '@/context/AuthContext';

interface MedicineScannerProps {
  onScanSuccess?: (text: string) => void;
}

const MedicineScanner: React.FC<MedicineScannerProps> = ({ onScanSuccess }) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleExtractText = async () => {
    if (!selectedImage) return;

    setIsExtracting(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', selectedImage);

    try {
      const headers = new Headers(authHeaders());
      headers.delete('Content-Type');

      const response = await fetch('/api/ocr', {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to extract text from image');
      }

      if (onScanSuccess) {
        onScanSuccess(data.text);
      }
      
      // Reset after success if needed, or keep preview
    } catch (err: any) {
      setError(err.message || 'An error occurred during text extraction.');
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-teal-50 mb-10 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-8 sm:p-10">
        <div className="flex items-start gap-5 mb-8">
          <div className="bg-teal-50 p-4 rounded-2xl shadow-inner flex-shrink-0">
            <Camera className="w-8 h-8 text-teal-600" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-teal-900 tracking-tight">Scan Medicine Strip</h3>
            <p className="text-base text-teal-800/60 font-medium">Capture or upload to auto-fill details</p>
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          accept="image/*"
          capture="environment"
          className="hidden"
        />

        {/* Upload/Preview Area */}
        <div 
          onClick={triggerFileInput}
          className={`relative group cursor-pointer border-[3px] border-dashed rounded-[2.5rem] transition-all duration-300 overflow-hidden flex flex-col items-center justify-center
            ${previewUrl ? 'border-teal-500 bg-teal-50/20' : 'border-teal-200 bg-white hover:border-teal-400 hover:bg-teal-50/50 shadow-sm'}
            min-h-[220px] active:scale-[0.98]`}
        >
          {previewUrl ? (
            <div className="relative w-full h-full min-h-[200px] flex items-center justify-center p-6 bg-teal-50/50">
              <img 
                src={previewUrl} 
                alt="Medicine Preview" 
                className="max-h-[160px] w-auto rounded-3xl shadow-xl object-contain ring-4 ring-white"
              />
              <div className="absolute inset-0 bg-teal-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                <div className="bg-white px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg scale-90 group-hover:scale-100 transition-transform">
                  <Upload className="w-5 h-5 text-teal-600" />
                  <span className="text-sm font-black text-teal-900 uppercase">Replace</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center px-6 text-center relative w-full">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white px-4">
                 <div className="bg-teal-50/50 p-3 rounded-2xl border border-teal-100">
                    <Upload className="w-8 h-8 text-teal-500" />
                 </div>
              </div>
              <p className="text-2xl font-black text-teal-950 mb-2 mt-2 leading-tight">Tap to upload <br/> medicine image</p>
              <p className="text-base text-teal-600/80 font-bold bg-teal-50/50 px-4 py-1.5 rounded-full mt-2">Camera opens automatically</p>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-10">
          <button
            onClick={handleExtractText}
            disabled={!selectedImage || isExtracting}
            className={`w-full py-6 rounded-[2rem] font-black text-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.97] shadow-xl
              ${!selectedImage || isExtracting 
                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed shadow-none' 
                : 'bg-gradient-to-br from-teal-500 to-teal-700 text-white hover:shadow-teal-900/20 hover:scale-[1.01]'}`}
          >
            {isExtracting ? (
              <>
                <Loader2 className="w-8 h-8 animate-spin text-white" />
                <span>Extracting...</span>
              </>
            ) : (
              <span>Extract Text</span>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-8 flex gap-3 p-5 bg-red-50 border border-red-100 rounded-[2rem] animate-in slide-in-from-top-2">
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
            <p className="text-base text-red-800 font-black">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicineScanner;
