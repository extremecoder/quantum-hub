'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import UserProfile from '../../components/auth/UserProfile';

/**
 * Dashboard profile page that displays the user profile component
 */
export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse flex flex-col space-y-4">
          <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-2/3"></div>
        </div>
      </div>
    );
  }

  // Show profile if authenticated
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Your Profile</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <UserProfile />
        </div>
        <div>
          <div className="p-4 bg-white rounded-lg shadow dark:bg-gray-800">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Account Settings</h2>
            <ul className="space-y-2">
              <li>
                <a 
                  href="/dashboard/security" 
                  className="block p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-gray-700 dark:text-gray-300"
                >
                  Security Settings
                </a>
              </li>
              <li>
                <a 
                  href="/dashboard/api-keys" 
                  className="block p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-gray-700 dark:text-gray-300"
                >
                  API Keys
                </a>
              </li>
              <li>
                <a 
                  href="/dashboard/notifications" 
                  className="block p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-gray-700 dark:text-gray-300"
                >
                  Notification Preferences
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
