'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { authHeaders } from '@/context/AuthContext';

interface OCRScannerProps {
  onScanSuccess?: (text: string) => void;
}

export default function OCRScanner({ onScanSuccess }: OCRScannerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setExtractedText('');
      setError(null);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      setError('Please select an image first.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', file);

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
        throw new Error(data.error || 'Failed to extract text');
      }

      setExtractedText(data.text);
      if (onScanSuccess) {
        onScanSuccess(data.text);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during OCR extraction.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full mb-8 bg-teal-50 p-6 sm:p-8 rounded-2xl border border-teal-200 border-dashed border-2 shadow-sm">
      <h3 className="text-xl sm:text-2xl font-bold mb-6 text-teal-800 flex items-center justify-center gap-3">
        📸 Scan Medicine Strip
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        <div className="border-2 border-dashed border-teal-300 rounded-xl p-8 sm:p-10 flex flex-col items-center justify-center bg-white hover:bg-teal-50 active:bg-teal-100 transition-colors cursor-pointer relative shadow-sm">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          {preview ? (
            <div className="flex flex-col items-center">
              <img src={preview} alt="Preview" className="max-h-64 object-contain mb-4 rounded-lg shadow-sm" />
              <p className="text-base text-gray-600 font-medium bg-white/80 px-4 py-2 rounded-full shadow-sm">Click to replace image</p>
            </div>
          ) : (
            <div className="flex flex-col items-center py-8">
              <svg className="w-16 h-16 text-teal-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <p className="text-xl text-gray-800 font-bold mb-2 text-center">Tap to upload medicine image</p>
              <p className="text-base text-gray-500">PNG, JPG up to 5MB</p>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={!file || isLoading}
          className={`w-full py-4 px-6 flex justify-center items-center rounded-xl text-lg font-bold text-white transition-all shadow-md active:scale-[0.98]
            ${!file || isLoading ? 'bg-indigo-300 cursor-not-allowed opacity-70' : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-indigo-200 hover:shadow-lg'}`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Extracting Text...
            </>
          ) : (
            'Extract Text'
          )}
        </button>
      </form>

      {error && (
        <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 flex items-start">
          <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
          </svg>
          <p>{error}</p>
        </div>
      )}


    </div>
  );
}
