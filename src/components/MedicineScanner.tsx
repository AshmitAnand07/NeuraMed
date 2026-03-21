'use client';

import React, { useState, useRef, ChangeEvent } from 'react';
import { Camera, Upload, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import Image from 'next/image';

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
      const response = await fetch('/api/ocr', {
        method: 'POST',
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
    <div className="w-full max-w-xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-teal-100 mb-8 mt-2">
      <div className="p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-teal-100 p-2 rounded-lg">
            <Camera className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Scan Medicine Strip</h3>
            <p className="text-sm text-gray-500 font-medium">Capture or upload to auto-fill details</p>
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
          className={`relative group cursor-pointer border-2 border-dashed rounded-[2rem] transition-all duration-300 overflow-hidden flex flex-col items-center justify-center
            ${previewUrl ? 'border-teal-500 bg-teal-50/30' : 'border-gray-300 bg-gray-50 hover:border-teal-400 hover:bg-teal-50/50'}
            aspect-video sm:aspect-auto sm:min-h-[220px]`}
        >
          {previewUrl ? (
            <div className="relative w-full h-full min-h-[200px] flex items-center justify-center p-4">
              <img 
                src={previewUrl} 
                alt="Medicine Preview" 
                className="max-h-[180px] w-auto rounded-2xl shadow-lg object-contain"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="bg-white/90 px-4 py-2 rounded-full flex items-center gap-2">
                  <Upload className="w-4 h-4 text-teal-600" />
                  <span className="text-sm font-bold text-gray-900">Change Image</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-10 flex flex-col items-center px-4 text-center">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-teal-500" />
              </div>
              <p className="text-lg font-bold text-gray-900 mb-1">Tap to upload medicine image</p>
              <p className="text-sm text-gray-500 font-medium">Camera opens automatically on mobile</p>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-8">
          <button
            onClick={handleExtractText}
            disabled={!selectedImage || isExtracting}
            className={`w-full py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg
              ${!selectedImage || isExtracting 
                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed shadow-none' 
                : 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:from-teal-700 hover:to-emerald-700 shadow-teal-900/10'}`}
          >
            {isExtracting ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin text-white" />
                <span>Extracting Text...</span>
              </>
            ) : selectedImage ? (
              <>
                <CheckCircle2 className="w-6 h-6" />
                <span>Extract Text</span>
              </>
            ) : (
              <span>Extract Text</span>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-6 flex gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700 font-bold">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicineScanner;
