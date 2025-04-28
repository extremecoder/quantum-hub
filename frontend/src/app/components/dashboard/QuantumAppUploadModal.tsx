/**
 * Quantum App Upload Modal Component
 */
'use client';

import { useState, useRef, useEffect } from 'react';
import { UploadIcon, XIcon, DocumentTextIcon, ExclamationIcon } from '@heroicons/react/outline';
import { uploadQuantumAppPackage, checkServiceAvailability } from '../../services/quantumAppService';

interface QuantumAppUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

export default function QuantumAppUploadModal({
  isOpen,
  onClose,
  onUploadSuccess
}: QuantumAppUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isServiceAvailable, setIsServiceAvailable] = useState<boolean | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if the quantum app service is available when the modal opens
  useEffect(() => {
    if (isOpen) {
      const checkService = async () => {
        const available = await checkServiceAvailability();
        setIsServiceAvailable(available);
        if (!available) {
          setError('Quantum App Service is not available. Please try again later.');
        }
      };

      checkService();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/zip' || droppedFile.name.endsWith('.zip')) {
        setFile(droppedFile);
        setError(null);
      } else {
        setError('Please upload a zip file');
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    // Check service availability again before uploading
    const available = await checkServiceAvailability();
    if (!available) {
      setError('Quantum App Service is not available. Please try again later.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      await uploadQuantumAppPackage(file);
      onUploadSuccess();
      onClose();
    } catch (err: any) {
      console.error('Upload error:', err);

      // Use the detailed error message from our enhanced service
      setError(err.message || 'Failed to upload quantum app package');

      // Log additional details to console for debugging
      if (err.originalError) {
        console.error('Original error:', err.originalError);

        if (err.originalError.response) {
          console.error('Status:', err.originalError.response.status);
          console.error('Headers:', err.originalError.response.headers);
          console.error('Data:', err.originalError.response.data);

          // Handle specific status codes
          if (err.originalError.response.status === 401 || err.originalError.response.status === 403) {
            setError('Authentication error. Please log in again and try once more.');
          } else if (err.originalError.response.status === 413) {
            setError('File is too large. Please upload a smaller file.');
          } else if (err.originalError.response.status === 415) {
            setError('Unsupported file format. Please upload a valid zip file.');
          } else if (err.originalError.response.status === 422) {
            setError('Invalid package format. Please ensure your zip file contains a valid quantum_manifest.json and .qasm files.');
          }
        }
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-white dark:bg-gray-800 rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <span className="sr-only">Close</span>
              <XIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                    Upload Quantum App Package
                  </h3>
                  {isServiceAvailable !== null && (
                    <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      isServiceAvailable
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      <span className={`h-2 w-2 rounded-full mr-1.5 ${
                        isServiceAvailable ? 'bg-green-500' : 'bg-red-500'
                      }`}></span>
                      {isServiceAvailable ? 'Service Online' : 'Service Offline'}
                    </div>
                  )}
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Upload a zip file containing your quantum app package with a quantum_manifest.json file and .qasm files.
                  </p>
                </div>

                <div className="mt-4">
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center ${isDragging ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-300 dark:border-gray-600'}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    {file ? (
                      <div className="space-y-2">
                        <DocumentTextIcon className="h-10 w-10 mx-auto text-indigo-600 dark:text-indigo-400" />
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {(file.size / 1024).toFixed(2)} KB
                        </p>
                        <button
                          type="button"
                          onClick={() => setFile(null)}
                          className="text-xs text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <UploadIcon className="h-10 w-10 mx-auto text-gray-400" />
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Drag and drop your file here, or <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                          >
                            browse
                          </button>
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Supported format: .zip
                        </p>
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          accept=".zip,application/zip"
                          onChange={handleFileChange}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {error && (
                  <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Upload Error</h3>
                        <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                          <p>{error}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleUpload}
              disabled={!file || isUploading || isServiceAvailable === false}
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:ml-3 sm:w-auto sm:text-sm ${
                !file || isUploading || isServiceAvailable === false
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              }`}
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
