'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

/**
 * Session debugger component that logs authentication state changes
 * This is a utility component for monitoring auth status
 */
export default function SessionDebugger() {
  const { data: session, status } = useSession();
  const [clientStatus, setClientStatus] = useState<string>('Loading');

  // Track session changes
  useEffect(() => {
    // Initialize client-side state
    setClientStatus(`Client initialized - ${status}`);
    
    // Log initial state
    console.log('AUTH STATUS:', status);
    console.log('SESSION DATA:', session);
    console.log('LOCAL STORAGE:', typeof window !== 'undefined' ? Object.keys(localStorage) : 'N/A');
    
    // Create a monitoring interval
    const interval = setInterval(() => {
      // Check for any session changes
      if (status === 'authenticated' && session) {
        console.log('AUTHENTICATED USER:', session.user);
        document.cookie = 'authenticated=true; path=/';
        localStorage.setItem('quantum_hub_auth_status', 'authenticated');
      } else if (status === 'unauthenticated') {
        console.log('NOT AUTHENTICATED');
        document.cookie = 'authenticated=false; path=/';
        localStorage.setItem('quantum_hub_auth_status', 'unauthenticated');
      }
      
      setClientStatus(`Client updated - ${status} - ${new Date().toISOString()}`);
    }, 2000);
    
    return () => clearInterval(interval);
  }, [session, status]);

  // No visual output - this is just for monitoring
  return null;
}
