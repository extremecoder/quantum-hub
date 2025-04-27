"use client";

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Authentication buttons component that displays either sign in/sign up buttons
 * or the user profile dropdown depending on the authentication state
 */
export default function AuthButtons() {
  const { data: session, status } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  // Mark when component is mounted on client to avoid hydration mismatch
  useEffect(() => {
    setIsClient(true);
    router.refresh();
  }, [router]);

  // If we're not yet on the client, render a placeholder to avoid hydration errors
  if (!isClient) {
    return (
      <div className="flex items-center space-x-4">
        <div className="h-8 w-20 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
      </div>
    );
  }

  // Now we're safely on the client side, we can check auth status

  // If the session is loading, show a loading state
  if (status === 'loading') {
    return (
      <div className="flex items-center space-x-4">
        <div className="h-8 w-20 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
      </div>
    );
  }

  const isAuthenticated = session?.user != null;
  console.log('Session status:', status, 'User:', session?.user, 'Authenticated:', isAuthenticated);

  // If user is not authenticated, show sign in/sign up buttons
  if (!isAuthenticated) {
    return (
      <div className="flex items-center space-x-4">
        <Link
          href="/auth/signin"
          className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
        >
          Sign In
        </Link>
        <Link
          href="/auth/signup"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Sign Up
        </Link>
      </div>
    );
  }

  // At this point, we must be authenticated with a valid user
  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center rounded-full bg-gray-100 p-1 text-sm focus:outline-none dark:bg-gray-700"
        aria-expanded={isDropdownOpen}
        aria-haspopup="true"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300">
          {session.user?.name?.[0] || session.user?.email?.[0] || 'U'}
        </span>
        <span className="mx-2 hidden md:block">{session.user?.name || session.user?.email}</span>
        <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-700">
          <Link
            href="/dashboard"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
            onClick={() => setIsDropdownOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            href="/dashboard/profile"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
            onClick={() => setIsDropdownOpen(false)}
          >
            Profile
          </Link>
          <button
            onClick={async () => {
              setIsDropdownOpen(false);

              // Clear localStorage
              if (typeof window !== 'undefined') {
                localStorage.removeItem('isAuthenticated');
                localStorage.removeItem('username');
                localStorage.removeItem('actualUsername');
                localStorage.removeItem('quantum_hub_auth_status');
              }

              // Sign out with NextAuth
              await signOut({ redirect: true, callbackUrl: '/' });

              // Force refresh after sign out
              router.refresh();
            }}
            className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
