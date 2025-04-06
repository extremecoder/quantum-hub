'use client';

import { SessionProvider } from 'next-auth/react';
import React from 'react';

/**
 * Authentication provider component that wraps the application with NextAuth's SessionProvider
 * Configured with more frequent refresh intervals to ensure session state is accurate
 * @param {object} props - Component props
 * @param {React.ReactNode} props.children - Child components to wrap with the auth provider
 */
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider 
      // Refresh session every 5 minutes
      refetchInterval={5 * 60} 
      // Refresh when window focuses
      refetchOnWindowFocus={true}
      // Refresh when network reconnects
      refetchWhenOffline={false}
    >
      {children}
    </SessionProvider>
  );
}
