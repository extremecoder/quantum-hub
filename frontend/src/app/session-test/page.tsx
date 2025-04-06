"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function SessionTestPage() {
  const { data: session, status, update } = useSession();
  const [lastRefresh, setLastRefresh] = useState<string>('');
  
  // Force session refresh - using useEffect to avoid hydration mismatch
  useEffect(() => {
    // Set initial refresh time on client only
    setLastRefresh(new Date().toISOString());
    
    // Force refresh session
    const refreshSession = async () => {
      await update();
      setLastRefresh(new Date().toISOString());
    };
    
    refreshSession();
    
    const interval = setInterval(() => {
      refreshSession();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [update]);

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Session Test Page</h1>
      
      <div className="mb-6">
        <button 
          onClick={async () => {
            await update();
            setLastRefresh(new Date().toISOString());
          }} 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Refresh Session
        </button>
        {lastRefresh && (
          <span className="ml-4 text-sm text-gray-500">
            Last refreshed: {lastRefresh}
          </span>
        )}
      </div>
      
      <div className="border rounded-lg p-6 mb-6 bg-gray-50 dark:bg-gray-800">
        <h2 className="text-xl font-bold mb-4">Session Status: 
          <span className={
            status === 'authenticated' ? 'text-green-500 ml-2' : 
            status === 'loading' ? 'text-yellow-500 ml-2' : 
            'text-red-500 ml-2'
          }>
            {status}
          </span>
        </h2>
        
        <div className="mb-4">
          {status === 'loading' && <p>Loading session...</p>}
          {status === 'unauthenticated' && <p>You are not authenticated.</p>}
          {status === 'authenticated' && session && (
            <div>
              <p className="text-green-600 font-bold">You are authenticated!</p>
              <div className="mt-4 overflow-x-auto">
                <h3 className="text-lg font-semibold mb-2">Session Data:</h3>
                <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded overflow-auto max-h-80">
                  {JSON.stringify(session, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex gap-4 mt-8">
        <Link 
          href="/auth/signin"
          className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
        >
          Go to Sign In
        </Link>
        <Link 
          href="/"
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
}
