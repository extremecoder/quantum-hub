"use client";

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

/**
 * SessionManager component that handles session persistence
 * This component should be included in the layout to ensure session state is properly maintained
 */
export default function SessionManager() {
  const { data: session, status, update } = useSession();
  
  // Debug session status
  useEffect(() => {
    console.log("SessionManager - Initial Status:", status);
    console.log("SessionManager - Initial Session:", session);

    // Immediately check session on mount
    const checkSession = async () => {
      try {
        console.log("SessionManager - Force updating session");
        await update();
        console.log("SessionManager - Session updated");
      } catch (error) {
        console.error("SessionManager - Error updating session:", error);
      }
    };
    
    checkSession();
    
    // Recheck session state periodically
    const intervalId = setInterval(checkSession, 2000);
    
    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, [update]);
  
  // No UI output - this is just for session management
  return null;
}
