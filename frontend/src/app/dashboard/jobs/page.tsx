'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ChartBarIcon, 
  ViewGridIcon,
  ArrowLeftIcon
} from '@heroicons/react/outline';
import JobManagement from '../../components/dashboard/JobManagement';

export default function JobsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link 
          href="/dashboard"
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>
        
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Jobs</h1>
          
          <div className="flex space-x-4">
            <Link 
              href="/dashboard/analytics"
              className="btn-secondary inline-flex items-center text-sm"
            >
              <ChartBarIcon className="h-5 w-5 mr-2" />
              View Analytics
            </Link>
            <Link 
              href="/develop"
              className="btn-primary inline-flex items-center text-sm"
            >
              <ViewGridIcon className="h-5 w-5 mr-2" />
              New Job
            </Link>
          </div>
        </div>
      </div>
      
      {/* Job Management Component */}
      <JobManagement />
    </div>
  );
}
