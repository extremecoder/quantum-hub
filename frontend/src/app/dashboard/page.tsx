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
  PauseIcon
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

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('apps');

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-10 flex flex-col items-start justify-between md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Dashboard</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Manage your quantum applications and monitor resource usage
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <button className="btn-primary">
            New Application
          </button>
        </div>
      </div>

      {/* Dashboard Tabs */}
      <div className="mb-8 border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            className={`flex items-center whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
              activeTab === 'apps'
                ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400'
            }`}
            onClick={() => setActiveTab('apps')}
          >
            <CollectionIcon className="mr-2 h-5 w-5" />
            My Applications
          </button>
          <button
            className={`flex items-center whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
              activeTab === 'hardware'
                ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400'
            }`}
            onClick={() => setActiveTab('hardware')}
          >
            <ServerIcon className="mr-2 h-5 w-5" />
            Hardware Usage
          </button>
          <button
            className={`flex items-center whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
              activeTab === 'analytics'
                ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400'
            }`}
            onClick={() => setActiveTab('analytics')}
          >
            <ChartBarIcon className="mr-2 h-5 w-5" />
            Analytics
          </button>
          <button
            className={`flex items-center whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
              activeTab === 'settings'
                ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400'
            }`}
            onClick={() => setActiveTab('settings')}
          >
            <CogIcon className="mr-2 h-5 w-5" />
            Settings
          </button>
        </nav>
      </div>

      {/* Applications Tab Content */}
      {activeTab === 'apps' && (
        <div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
            {userApps.map((app) => (
              <div key={app.id} className="card">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold dark:text-white">{app.name}</h3>
                  <div>{statusIcons[app.status as keyof typeof statusIcons]}</div>
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  {app.description}
                </p>
                <div className="mt-4 flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <ClockIcon className="mr-1 h-4 w-4" />
                  Last run: {formatDate(app.lastRun)}
                </div>
                <div className="mt-4 flex justify-between">
                  <Link
                    href={`/app/${app.id}`}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                  >
                    View Details
                  </Link>
                  <button className="rounded bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-800 hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-200">
                    Run
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-10">
            <h2 className="mb-6 text-xl font-semibold dark:text-white">Recent Results</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Application
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Runtime
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Qubits
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                  {userApps.flatMap((app) => 
                    app.results.slice(0, 1).map((result, index) => (
                      <tr key={`${app.id}-${index}`}>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center">
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {app.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(result.date)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                          {result.success === null ? (
                            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              Running
                            </span>
                          ) : result.success ? (
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                              Successful
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
                              Failed
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {result.runtime > 0 ? `${result.runtime} ms` : '-'}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {result.qubits}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                          <Link href={`/results/${app.id}/${index}`} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Hardware Usage Tab Content */}
      {activeTab === 'hardware' && (
        <div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {hardwareUsage.map((hw, index) => (
              <div key={index} className="card">
                <h3 className="mb-4 text-lg font-semibold dark:text-white">{hw.name}</h3>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">Usage</span>
                  <span className="font-medium dark:text-white">
                    {hw.usage}/{hw.limit} {hw.unit}
                  </span>
                </div>
                <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div 
                    className="h-4 rounded-full bg-indigo-600" 
                    style={{ width: `${(hw.usage / hw.limit) * 100}%` }}
                  ></div>
                </div>
                <div className="mt-4 text-right">
                  <button className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-10">
            <h2 className="mb-6 text-xl font-semibold dark:text-white">Available Quantum Hardware</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="card">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold dark:text-white">IBM Quantum System One</h3>
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                    Available
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  127-qubit quantum processor with low error rates
                </p>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
                  <div>
                    <p className="font-medium">Qubits</p>
                    <p>127</p>
                  </div>
                  <div>
                    <p className="font-medium">Quantum Volume</p>
                    <p>128</p>
                  </div>
                  <div>
                    <p className="font-medium">Gate Error</p>
                    <p>0.1%</p>
                  </div>
                  <div>
                    <p className="font-medium">Readout Error</p>
                    <p>1.5%</p>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button className="btn-primary">
                    Reserve Time
                  </button>
                </div>
              </div>
              
              <div className="card">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold dark:text-white">Azure Quantum IonQ</h3>
                  <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    Limited
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  32-qubit trapped-ion quantum computer with high fidelity
                </p>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
                  <div>
                    <p className="font-medium">Qubits</p>
                    <p>32</p>
                  </div>
                  <div>
                    <p className="font-medium">Quantum Volume</p>
                    <p>4,000,000</p>
                  </div>
                  <div>
                    <p className="font-medium">Gate Error</p>
                    <p>0.05%</p>
                  </div>
                  <div>
                    <p className="font-medium">Readout Error</p>
                    <p>0.5%</p>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button className="btn-primary">
                    Reserve Time
                  </button>
                </div>
              </div>
              
              <div className="card">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold dark:text-white">AWS Braket Rigetti</h3>
                  <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
                    Scheduled Maintenance
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  80-qubit superconducting quantum processor
                </p>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
                  <div>
                    <p className="font-medium">Qubits</p>
                    <p>80</p>
                  </div>
                  <div>
                    <p className="font-medium">Quantum Volume</p>
                    <p>64</p>
                  </div>
                  <div>
                    <p className="font-medium">Gate Error</p>
                    <p>0.15%</p>
                  </div>
                  <div>
                    <p className="font-medium">Readout Error</p>
                    <p>2.5%</p>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button className="btn-primary" disabled>
                    Available June 23
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab Content (Placeholder) */}
      {activeTab === 'analytics' && (
        <div className="rounded-xl bg-white p-6 shadow-md dark:bg-gray-800">
          <h3 className="mb-4 text-xl font-semibold dark:text-white">
            Quantum Application Analytics
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Analytics dashboard is under development. Check back soon for detailed insights into your quantum applications' performance.
          </p>
        </div>
      )}

      {/* Settings Tab Content (Placeholder) */}
      {activeTab === 'settings' && (
        <div className="rounded-xl bg-white p-6 shadow-md dark:bg-gray-800">
          <h3 className="mb-4 text-xl font-semibold dark:text-white">
            Account Settings
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Settings panel is under development. Future versions will allow you to configure your quantum computing resources, API keys, and notification preferences.
          </p>
        </div>
      )}
    </div>
  );
} 