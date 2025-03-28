'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ChartBarIcon, 
  ClockIcon, 
  CogIcon, 
  CollectionIcon, 
  ServerIcon, 
  BadgeCheckIcon,
  ExclamationCircleIcon, 
  PauseIcon,
  DocumentAddIcon,
  KeyIcon,
  ChipIcon,
  CodeIcon
} from '@heroicons/react/outline';

// Mock data for user's quantum applications
const userApps = [
  {
    id: 'app-1',
    name: 'Quantum Search Algorithm',
    description: 'Implementation of Grover\'s search algorithm for database search',
    lastRun: '2023-06-15T10:30:00Z',
    status: 'completed',
    results: [
      { date: '2023-06-15T10:30:00Z', success: true, runtime: 124, qubits: 7 },
      { date: '2023-06-14T14:20:00Z', success: true, runtime: 132, qubits: 7 },
      { date: '2023-06-10T09:15:00Z', success: false, runtime: 0, qubits: 7 },
    ]
  },
  {
    id: 'app-2',
    name: 'VQE Molecular Simulation',
    description: 'Variational Quantum Eigensolver for H2O molecule energy levels',
    lastRun: '2023-06-14T08:45:00Z',
    status: 'running',
    results: [
      { date: '2023-06-14T08:45:00Z', success: null, runtime: 0, qubits: 10 },
      { date: '2023-06-12T11:30:00Z', success: true, runtime: 345, qubits: 10 },
      { date: '2023-06-08T16:20:00Z', success: true, runtime: 352, qubits: 10 },
    ]
  },
  {
    id: 'app-3',
    name: 'Quantum Fourier Transform',
    description: 'QFT implementation for signal processing',
    lastRun: '2023-06-10T15:20:00Z',
    status: 'failed',
    results: [
      { date: '2023-06-10T15:20:00Z', success: false, runtime: 0, qubits: 8 },
      { date: '2023-06-09T12:10:00Z', success: true, runtime: 178, qubits: 8 },
      { date: '2023-06-07T09:30:00Z', success: true, runtime: 185, qubits: 8 },
    ]
  },
  {
    id: 'app-4',
    name: 'QAOA Optimization',
    description: 'Quantum Approximate Optimization Algorithm for MaxCut problem',
    lastRun: '2023-06-08T10:15:00Z',
    status: 'paused',
    results: [
      { date: '2023-06-08T10:15:00Z', success: true, runtime: 267, qubits: 12 },
      { date: '2023-06-05T14:30:00Z', success: true, runtime: 272, qubits: 12 },
      { date: '2023-06-03T09:45:00Z', success: true, runtime: 270, qubits: 12 },
    ]
  },
];

// Mock hardware usage data
const hardwareUsage = [
  { name: 'IBM Quantum', usage: 78, limit: 100, unit: 'hours' },
  { name: 'Azure Quantum', usage: 45, limit: 80, unit: 'hours' },
  { name: 'AWS Braket', usage: 62, limit: 100, unit: 'hours' },
];

// Status icons mapping
const statusIcons = {
  completed: <BadgeCheckIcon className="h-5 w-5 text-green-500" />,
  running: <ClockIcon className="h-5 w-5 text-blue-500 animate-pulse" />,
  failed: <ExclamationCircleIcon className="h-5 w-5 text-red-500" />,
  paused: <PauseIcon className="h-5 w-5 text-yellow-500" />,
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Tabs enum for dashboard
enum DashboardTab {
  MyApplications = 'My Applications',
  HardwareUsage = 'Hardware Usage',
  Analytics = 'Analytics',
  APIKeys = 'API Keys',
  Settings = 'Settings',
  MyPublishedCircuits = 'My Published Circuits',
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<DashboardTab>(DashboardTab.MyApplications);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your quantum applications and monitor resource usage
          </p>
        </div>
        <div className="flex space-x-4">
          <Link 
            href="/develop"
            className="btn-secondary inline-flex items-center text-sm"
          >
            <CodeIcon className="h-5 w-5 mr-2" />
            Develop
          </Link>
          <Link 
            href="/dashboard/publish-circuit"
            className="btn-secondary inline-flex items-center text-sm"
          >
            <CollectionIcon className="h-5 w-5 mr-2" />
            Publish to Registry
          </Link>
          <Link 
            href="/dashboard/publish-api"
            className="btn-primary inline-flex items-center text-sm"
          >
            <DocumentAddIcon className="h-5 w-5 mr-2" />
            Publish API
          </Link>
        </div>
      </div>
      
      {/* Dashboard tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex overflow-x-auto">
          <button
            className={`py-4 px-6 -mb-px border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === DashboardTab.MyApplications
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab(DashboardTab.MyApplications)}
          >
            <CollectionIcon className="h-5 w-5 mr-2 inline" />
            My Applications
          </button>
          <button
            className={`py-4 px-6 -mb-px border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === DashboardTab.MyPublishedCircuits
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab(DashboardTab.MyPublishedCircuits)}
          >
            <ChipIcon className="h-5 w-5 mr-2 inline" />
            My Published Circuits
          </button>
          <button
            className={`py-4 px-6 -mb-px border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === DashboardTab.HardwareUsage
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab(DashboardTab.HardwareUsage)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
            Hardware Usage
          </button>
          <button
            className={`py-4 px-6 -mb-px border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === DashboardTab.Analytics
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab(DashboardTab.Analytics)}
          >
            <ChartBarIcon className="h-5 w-5 mr-2 inline" />
            Analytics
          </button>
          <button
            className={`py-4 px-6 -mb-px border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === DashboardTab.APIKeys
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab(DashboardTab.APIKeys)}
          >
            <KeyIcon className="h-5 w-5 mr-2 inline" />
            API Keys
          </button>
          <button
            className={`py-4 px-6 -mb-px border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === DashboardTab.Settings
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab(DashboardTab.Settings)}
          >
            <CogIcon className="h-5 w-5 mr-2 inline" />
            Settings
          </button>
        </div>
      </div>
      
      {/* Applications Section */}
      {activeTab === DashboardTab.MyApplications && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-green-100 rounded-lg dark:bg-green-900">
                  <CollectionIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  +12% this month
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">12</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Applications</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-100 rounded-lg dark:bg-blue-900">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  +41% this month
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">1,523</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">API Requests Today</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-purple-100 rounded-lg dark:bg-purple-900">
                  <ChipIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  +5% this month
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">28</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Average Qubits Used</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-yellow-100 rounded-lg dark:bg-yellow-900">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  +25% this month
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">$840.32</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Revenue</p>
            </div>
          </div>
          
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Recent Results</h2>
          
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 mb-8">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Application</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Runtime</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Qubits</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">Quantum Search Algorithm</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Jun 15, 2023, 04:00 PM</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Successful
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      124 ms
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      7
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href="/dashboard/result/1" className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">View</Link>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">VQE Molecular Simulation</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Jun 14, 2023, 02:15 PM</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        Running
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      -
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      10
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href="/dashboard/result/2" className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">View</Link>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">Quantum Fourier Transform</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Jun 10, 2023, 08:50 PM</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                        Failed
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      -
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      8
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href="/dashboard/result/3" className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">View</Link>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">QAOA Optimization</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Jun 8, 2023, 03:45 PM</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Successful
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      267 ms
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      12
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href="/dashboard/result/4" className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">View</Link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      {/* My Published Circuits Section */}
      {activeTab === DashboardTab.MyPublishedCircuits && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Published Circuits</h2>
            <Link 
              href="/dashboard/publish-circuit"
              className="btn-primary inline-flex items-center text-sm"
            >
              <DocumentAddIcon className="h-5 w-5 mr-2" />
              Publish New Circuit
            </Link>
          </div>
          
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 mb-8">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Circuit Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Version</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Published Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Downloads</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">Advanced Quantum Fourier Transform</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">v1.2.0</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Jan 15, 2023</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      1,245
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Published
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href="/dashboard/circuits/1" className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4">View</Link>
                      <Link href="/dashboard/circuits/1/edit" className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4">Update</Link>
                      <Link href="/dashboard/circuits/1/publish-api" className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">Publish as API</Link>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">Optimized Grover's Algorithm</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">v2.1.3</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Feb 22, 2023</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      987
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Published
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href="/dashboard/circuits/2" className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4">View</Link>
                      <Link href="/dashboard/circuits/2/edit" className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4">Update</Link>
                      <Link href="/dashboard/circuits/2/publish-api" className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">Publish as API</Link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      {/* API Keys Section */}
      {activeTab === DashboardTab.APIKeys && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">API Keys</h2>
            <button className="btn-primary inline-flex items-center text-sm">
              <KeyIcon className="h-5 w-5 mr-2" />
              Generate New Key
            </button>
          </div>
          
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 mb-8">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Key Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Key</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Expires</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">Production Key</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded">qh_pk_*************cRtG</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Jan 15, 2023</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      Never
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3">Copy</button>
                      <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Revoke</button>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">Development Key</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded">qh_dk_*************tHj5</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Feb 22, 2023</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      Feb 22, 2024
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3">Copy</button>
                      <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Revoke</button>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">Trial Key</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded">qh_tk_*************zP4s</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Mar 10, 2023</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      Apr 10, 2023
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                        Expired
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3">Copy</button>
                      <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Revoke</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">API Usage Limits</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Requests (25,421/50,000)</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">50.8%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div className="bg-indigo-600 h-2.5 rounded-full dark:bg-indigo-500" style={{ width: '50.8%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Compute Time (28.5/100 hours)</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">28.5%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div className="bg-indigo-600 h-2.5 rounded-full dark:bg-indigo-500" style={{ width: '28.5%' }}></div>
                </div>
              </div>
              
              <div className="text-right">
                <Link href="/billing" className="text-indigo-600 hover:text-indigo-900 text-sm font-medium dark:text-indigo-400 dark:hover:text-indigo-300">
                  Upgrade Plan →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 