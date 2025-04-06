"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

/**
 * Settings page component for user preferences and account management
 */
export default function Settings() {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Get username from localStorage on client-side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUsername = localStorage.getItem('username');
      if (storedUsername) {
        setUsername(storedUsername);
      }
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center pt-16 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Account Settings</h1>
        
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Profile Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
              <div className="mt-1 p-2 bg-gray-50 dark:bg-gray-700 rounded-md text-gray-900 dark:text-white">
                {username}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Account Preferences</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-700 dark:text-gray-300">Dark Mode</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Enable dark mode for the interface</p>
              </div>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <span className="text-xs text-gray-400">Coming soon</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-700 dark:text-gray-300">Email Notifications</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Receive email updates about your account</p>
              </div>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <span className="text-xs text-gray-400">Coming soon</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-4">
          <Link 
            href="/dashboard" 
            className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
