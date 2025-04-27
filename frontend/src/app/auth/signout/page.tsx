"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";

/**
 * Improved sign out page with better UI and options
 */
export default function SignOut() {
  // Clear local storage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("username");
    }
  }, []);

  const handleSignOut = async () => {
    // Clear localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("username");
      localStorage.removeItem("actualUsername");
      localStorage.removeItem("quantum_hub_auth_status");
    }

    try {
      // Use NextAuth's signOut function with redirect
      await signOut({ callbackUrl: "/" });
    } catch (error) {
      console.error("Error signing out:", error);
      // Fallback to direct navigation
      window.location.href = "/";
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 dark:bg-gray-900">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
        <div className="text-center">
          <h2 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">
            Sign Out
          </h2>
          <p className="mb-8 text-gray-600 dark:text-gray-400">
            Are you sure you want to sign out of your account?
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <button
              onClick={handleSignOut}
              className="w-full rounded-md bg-red-600 px-4 py-3 text-center font-medium text-white shadow hover:bg-red-700 sm:w-auto"
            >
              Yes, Sign Out
            </button>
            <Link
              href="/"
              className="w-full rounded-md bg-gray-200 px-4 py-3 text-center font-medium text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 sm:w-auto"
            >
              Cancel
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
