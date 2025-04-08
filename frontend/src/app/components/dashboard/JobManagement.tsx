'use client';

import { useState, useEffect } from 'react';
import { 
  ClockIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon, 
  PauseIcon,
  ViewListIcon,
  DownloadIcon,
  RefreshIcon,
  XCircleIcon,
  ChartBarIcon
} from '@heroicons/react/outline';

// Job status types
type JobStatus = 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

// Job interface
interface Job {
  id: string;
  name: string;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  platform: string;
  device: string;
  shots: number;
  qubits: number;
  estimatedCost: number;
  actualCost?: number;
  progress: number;
  user: {
    id: string;
    username: string;
  };
  subscription: {
    id: string;
    name: string;
  };
  result?: {
    counts: Record<string, number>;
    executionTime: number;
    success: boolean;
  };
}

// Mock job data (in a real app, this would come from API)
const MOCK_JOBS: Job[] = [
  {
    id: 'job-1',
    name: 'Bell State Simulation',
    status: 'COMPLETED',
    createdAt: '2023-06-15T10:30:00Z',
    updatedAt: '2023-06-15T10:32:00Z',
    completedAt: '2023-06-15T10:32:00Z',
    platform: 'IBM Quantum',
    device: 'ibmq_qasm_simulator',
    shots: 1024,
    qubits: 2,
    estimatedCost: 0.25,
    actualCost: 0.22,
    progress: 100,
    user: {
      id: 'user-1',
      username: 'quantum_dev'
    },
    subscription: {
      id: 'sub-1',
      name: 'IBM Quantum Basic'
    },
    result: {
      counts: { '00': 490, '11': 534 },
      executionTime: 1.5,
      success: true
    }
  },
  {
    id: 'job-2',
    name: 'Quantum Fourier Transform',
    status: 'RUNNING',
    createdAt: '2023-06-15T11:15:00Z',
    updatedAt: '2023-06-15T11:15:00Z',
    platform: 'AWS Braket',
    device: 'SV1',
    shots: 1000,
    qubits: 8,
    estimatedCost: 1.50,
    progress: 65,
    user: {
      id: 'user-1',
      username: 'quantum_dev'
    },
    subscription: {
      id: 'sub-2',
      name: 'AWS Braket Standard'
    }
  },
  {
    id: 'job-3',
    name: 'QAOA Optimization',
    status: 'QUEUED',
    createdAt: '2023-06-15T11:30:00Z',
    updatedAt: '2023-06-15T11:30:00Z',
    platform: 'Google Quantum',
    device: 'Sycamore',
    shots: 500,
    qubits: 12,
    estimatedCost: 3.75,
    progress: 0,
    user: {
      id: 'user-1',
      username: 'quantum_dev'
    },
    subscription: {
      id: 'sub-3',
      name: 'Google Quantum Research'
    }
  },
  {
    id: 'job-4',
    name: 'Grover Search Algorithm',
    status: 'FAILED',
    createdAt: '2023-06-14T09:45:00Z',
    updatedAt: '2023-06-14T09:47:00Z',
    completedAt: '2023-06-14T09:47:00Z',
    platform: 'IBM Quantum',
    device: 'ibmq_montreal',
    shots: 2048,
    qubits: 7,
    estimatedCost: 2.25,
    actualCost: 0.45,
    progress: 100,
    user: {
      id: 'user-1',
      username: 'quantum_dev'
    },
    subscription: {
      id: 'sub-1',
      name: 'IBM Quantum Basic'
    },
    result: {
      counts: {},
      executionTime: 0,
      success: false
    }
  },
  {
    id: 'job-5',
    name: 'VQE Simulation',
    status: 'CANCELLED',
    createdAt: '2023-06-13T15:20:00Z',
    updatedAt: '2023-06-13T15:25:00Z',
    platform: 'AWS Braket',
    device: 'DM1',
    shots: 100,
    qubits: 10,
    estimatedCost: 1.75,
    actualCost: 0.15,
    progress: 25,
    user: {
      id: 'user-1',
      username: 'quantum_dev'
    },
    subscription: {
      id: 'sub-2',
      name: 'AWS Braket Standard'
    }
  }
];

// Format date for display
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

// Status icon component
const StatusIcon = ({ status }: { status: JobStatus }) => {
  switch (status) {
    case 'COMPLETED':
      return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    case 'RUNNING':
      return <ClockIcon className="h-5 w-5 text-blue-500 animate-pulse" />;
    case 'QUEUED':
      return <ClockIcon className="h-5 w-5 text-yellow-500" />;
    case 'FAILED':
      return <ExclamationCircleIcon className="h-5 w-5 text-red-500" />;
    case 'CANCELLED':
      return <XCircleIcon className="h-5 w-5 text-gray-500" />;
    default:
      return null;
  }
};

// Progress bar component
const ProgressBar = ({ value }: { value: number }) => {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
      <div 
        className="bg-blue-600 h-2.5 rounded-full" 
        style={{ width: `${value}%` }}
      ></div>
    </div>
  );
};

// Job details modal component
interface JobDetailsProps {
  job: Job;
  onClose: () => void;
}

const JobDetails = ({ job, onClose }: JobDetailsProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Job Details: {job.name}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Job Information</h4>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">ID</p>
                    <p className="font-mono text-sm text-gray-900 dark:text-white">{job.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                    <p className="text-sm text-gray-900 dark:text-white flex items-center">
                      <StatusIcon status={job.status} />
                      <span className="ml-2">{job.status}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Created</p>
                    <p className="text-sm text-gray-900 dark:text-white">{formatDate(job.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Updated</p>
                    <p className="text-sm text-gray-900 dark:text-white">{formatDate(job.updatedAt)}</p>
                  </div>
                  {job.completedAt && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
                      <p className="text-sm text-gray-900 dark:text-white">{formatDate(job.completedAt)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Execution Details</h4>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Platform</p>
                    <p className="text-sm text-gray-900 dark:text-white">{job.platform}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Device</p>
                    <p className="text-sm text-gray-900 dark:text-white">{job.device}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Shots</p>
                    <p className="text-sm text-gray-900 dark:text-white">{job.shots.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Qubits</p>
                    <p className="text-sm text-gray-900 dark:text-white">{job.qubits}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Estimated Cost</p>
                    <p className="text-sm text-gray-900 dark:text-white">${job.estimatedCost.toFixed(2)}</p>
                  </div>
                  {job.actualCost !== undefined && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Actual Cost</p>
                      <p className="text-sm text-gray-900 dark:text-white">${job.actualCost.toFixed(2)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Results section (only for completed jobs) */}
          {job.status === 'COMPLETED' && job.result && (
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Results</h4>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div className="mb-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Execution Time</p>
                  <p className="text-sm text-gray-900 dark:text-white">{job.result.executionTime} seconds</p>
                </div>
                
                <div className="mb-6">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Measurement Counts</p>
                  <div className="h-48 flex items-end justify-center space-x-6">
                    {Object.entries(job.result.counts).map(([state, count]) => (
                      <div key={state} className="flex flex-col items-center">
                        <div 
                          className="w-16 bg-blue-500 rounded-t"
                          style={{ height: `${(count / job.shots) * 100}%` }}
                        ></div>
                        <div className="mt-2 text-xs text-gray-900 dark:text-white">
                          <span className="font-mono">{state}:</span> {count}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="text-center mt-4">
                  <button className="btn-secondary text-sm inline-flex items-center">
                    <DownloadIcon className="h-4 w-4 mr-2" />
                    Download Full Results
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Error details (for failed jobs) */}
          {job.status === 'FAILED' && (
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Error Details</h4>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div className="bg-red-50 dark:bg-red-900 dark:bg-opacity-20 text-red-700 dark:text-red-400 p-3 rounded-md border border-red-200 dark:border-red-800 font-mono text-sm whitespace-pre-wrap">
                  Error: Quantum hardware timeout after 120 seconds. The device might be experiencing high load or connectivity issues.
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-6 flex justify-end space-x-4">
            {job.status === 'COMPLETED' && (
              <button className="btn-secondary text-sm inline-flex items-center">
                <ChartBarIcon className="h-4 w-4 mr-2" />
                Visualize Results
              </button>
            )}
            
            {(job.status === 'QUEUED' || job.status === 'RUNNING') && (
              <button className="btn-secondary text-sm inline-flex items-center text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400">
                <XCircleIcon className="h-4 w-4 mr-2" />
                Cancel Job
              </button>
            )}
            
            <button 
              onClick={onClose}
              className="btn-primary text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main job management component
export default function JobManagement() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<JobStatus | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  // Fetch jobs (in a real app, this would be an API call)
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setJobs(MOCK_JOBS);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filter and sort jobs
  const filteredJobs = jobs
    .filter(job => filterStatus === 'ALL' || job.status === filterStatus)
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

  const refreshJobs = () => {
    setIsLoading(true);
    // In a real app, this would make an API call to refresh the job list
    setTimeout(() => {
      setJobs(MOCK_JOBS);
      setIsLoading(false);
    }, 1000);
  };

  const viewJobDetails = (job: Job) => {
    setSelectedJob(job);
  };

  const closeJobDetails = () => {
    setSelectedJob(null);
  };

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-0">
          Quantum Jobs
        </h1>
        <div className="flex flex-wrap gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as JobStatus | 'ALL')}
            className="form-select rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
          >
            <option value="ALL">All Status</option>
            <option value="QUEUED">Queued</option>
            <option value="RUNNING">Running</option>
            <option value="COMPLETED">Completed</option>
            <option value="FAILED">Failed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
            className="form-select rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
          
          <button 
            onClick={refreshJobs}
            className="btn-secondary text-sm inline-flex items-center"
            disabled={isLoading}
          >
            <RefreshIcon className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="py-12 flex justify-center">
          <div className="animate-pulse text-blue-500 dark:text-blue-400 flex flex-col items-center">
            <svg className="w-12 h-12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <p className="mt-2">Loading jobs...</p>
          </div>
        </div>
      ) : (
        <>
          {filteredJobs.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
              <ViewListIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No jobs found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {filterStatus === 'ALL' 
                  ? "You haven't submitted any quantum jobs yet."
                  : `No jobs with status "${filterStatus}" found.`}
              </p>
              <button 
                onClick={() => setFilterStatus('ALL')}
                className="btn-primary"
              >
                View All Jobs
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                        Job Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                        Platform/Device
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                        Progress
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                        Cost
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                    {filteredJobs.map((job) => (
                      <tr 
                        key={job.id} 
                        className="hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer"
                        onClick={() => viewJobDetails(job)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{job.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">{job.id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{job.platform}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{job.device}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(job.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <StatusIcon status={job.status} />
                            <span className="ml-2 text-sm text-gray-900 dark:text-white">{job.status}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-32">
                            <ProgressBar value={job.progress} />
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{job.progress}%</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          ${job.actualCost !== undefined ? job.actualCost.toFixed(2) : job.estimatedCost.toFixed(2)}
                          {job.actualCost === undefined && (
                            <span className="text-xs text-gray-500 dark:text-gray-400"> (est.)</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              viewJobDetails(job);
                            }}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 inline-flex items-center"
                          >
                            <span className="hidden sm:inline mr-1">View</span>
                            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
      
      {selectedJob && (
        <JobDetails job={selectedJob} onClose={closeJobDetails} />
      )}
    </div>
  );
}
