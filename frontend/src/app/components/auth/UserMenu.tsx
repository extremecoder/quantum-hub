'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Simple UserMenu component that shows either sign in/up buttons or the user profile
 */
export default function UserMenu() {
  const { data: session } = useSession();
  const [username, setUsername] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();

  // Check authentication on client-side
  useEffect(() => {
    // Direct path check for authentication
    const isPathAuthenticated = pathname?.startsWith('/dashboard') || pathname?.startsWith('/settings');
    
    // Check localStorage
    const localStorageAuth = typeof window !== 'undefined' ? localStorage.getItem('isAuthenticated') === 'true' : false;
    
    // Get username from localStorage
    const storedUsername = typeof window !== 'undefined' ? localStorage.getItem('username') : null;
    
    if (storedUsername) {
      setUsername(storedUsername);
    } else if (session?.user?.name) {
      setUsername(session.user.name);
    }
    
    // Set authentication state
    setIsAuthenticated(isPathAuthenticated || session !== null || localStorageAuth);
  }, [session, pathname]);

  // Toggle dropdown menu
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Sign out function
  const handleSignOut = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('username');
      localStorage.removeItem('actualUsername');
      
      // Direct navigation
      window.location.href = '/';
    }
  };

  // If not authenticated, show sign in/up buttons
  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-3">
        <a
          href="/auth/signin"
          className="text-sm bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          Sign In
        </a>
        <a
          href="/auth/signup"
          className="text-sm bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
        >
          Sign Up
        </a>
      </div>
    );
  }

  // If authenticated, show user profile and dropdown menu
  return (
    <div className="relative">
      {/* User Avatar and Profile Button */}
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
        aria-expanded={dropdownOpen}
        aria-haspopup="true"
      >
        <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-800 flex items-center justify-center">
          <span className="text-indigo-700 dark:text-indigo-300 font-medium">
            {username ? username[0].toUpperCase() : 'U'}
          </span>
        </div>
        <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
          {username || 'User'}
        </span>
        <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">Signed in as</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{username}</p>
          </div>
          
          <a
            href="/dashboard"
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setDropdownOpen(false)}
          >
            Dashboard
          </a>
          
          <a
            href="/settings"
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setDropdownOpen(false)}
          >
            Settings
          </a>
          
          <div className="border-t border-gray-200 dark:border-gray-700"></div>
          
          <button
            onClick={handleSignOut}
            className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
