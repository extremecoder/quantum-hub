'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function VSCodeEditorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get project parameters from URL
  const projectId = searchParams.get('id');
  const projectName = searchParams.get('name');
  const githubRepo = searchParams.get('repo');
  const projectType = (searchParams.get('type') || 'circuit') as 'circuit' | 'algorithm' | 'quantum-model' | 'agent';
  const isNewProject = searchParams.get('new') === 'true';
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vscodeUrl, setVscodeUrl] = useState('http://localhost:8080');
  const [urlCopied, setUrlCopied] = useState(false);
  
  // Function to handle navigation back to develop page
  const handleClose = () => {
    router.push('/develop');
  };

  // Function to copy URL to clipboard
  const copyUrl = () => {
    try {
      // Create a temporary textarea element to copy text
      const textArea = document.createElement('textarea');
      textArea.value = vscodeUrl + (projectId ? `/?folder=/workspace/${projectId}` : '');
      
      // Set styles to make it invisible
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      
      // Select and copy the text
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      
      // Clean up
      document.body.removeChild(textArea);
      
      // Update UI state
      setUrlCopied(true);
      setTimeout(() => setUrlCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
      alert('Could not copy URL. Please select and copy it manually.');
    }
  };
  
  // Simulate loading to give time for VS Code to start
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // If we don't have minimum required parameters, show an error
  if (!isNewProject && !projectId) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Missing Project Information</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Project ID is required to open a project in VS Code.
          </p>
          <div className="flex justify-end">
            <button
              onClick={() => router.push('/develop')}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
            >
              Back to Projects
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center z-10">
        <Link 
          href="/develop"
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mr-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </Link>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white flex-1">
          Project: {projectName || 'New Project'}
        </h1>
        <div className="flex items-center space-x-2">
          <span className="px-2 py-1 text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300 rounded-md">
            {projectType}
          </span>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-grow">
        {loading ? (
          <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
              <p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">
                {isNewProject ? 'Preparing VS Code...' : 'Loading VS Code...'}
              </p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Setting up your development environment
              </p>
            </div>
          </div>
        ) : (
          <div className="h-full p-6 bg-gray-100 dark:bg-gray-900 overflow-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 max-w-4xl mx-auto">
              <div className="flex items-center mb-4">
                <svg className="h-8 w-8 text-indigo-600 mr-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.15 2.587L18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 0 0-1.276.057L.327 7.261A1 1 0 0 0 .326 8.74L3.899 12 .326 15.26a1 1 0 0 0 .001 1.479L1.65 17.94a.999.999 0 0 0 1.276.057l4.12-3.128 9.46 8.63a1.492 1.492 0 0 0 1.704.29l4.942-2.377A1.5 1.5 0 0 0 24 20.06V3.939a1.5 1.5 0 0 0-.85-1.352zm-5.146 14.861L10.826 12l7.178-5.448v10.896z" />
                </svg>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  VS Code for {projectName || 'New Project'}
                </h2>
              </div>
              
              <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300 flex items-center">
                  <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Technical Note
                </h3>
                <p className="mt-2 text-yellow-700 dark:text-yellow-400">
                  Due to browser security restrictions, the VS Code editor works best when opened in a dedicated browser tab.
                  We've provided a direct link below to access your project in VS Code.
                </p>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Your project <strong>{projectName || (projectId ? `ID: ${projectId}` : 'New Project')}</strong> is ready for development in VS Code.
                Using VS Code gives you access to syntax highlighting, code completion, debugging tools, and more.
              </p>
              
              {/* Mock VS Code Editor */}
              <div className="relative mb-6 border rounded-lg overflow-hidden">
                <div className="w-full h-64 bg-gray-800 flex flex-col">
                  <div className="h-9 bg-gray-900 flex items-center px-4 border-b border-gray-700">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="ml-4 text-sm text-gray-400 flex-1 text-center">Visual Studio Code</div>
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.15 2.587L18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 0 0-1.276.057L.327 7.261A1 1 0 0 0 .326 8.74L3.899 12 .326 15.26a1 1 0 0 0 .001 1.479L1.65 17.94a.999.999 0 0 0 1.276.057l4.12-3.128 9.46 8.63a1.492 1.492 0 0 0 1.704.29l4.942-2.377A1.5 1.5 0 0 0 24 20.06V3.939a1.5 1.5 0 0 0-.85-1.352zm-5.146 14.861L10.826 12l7.178-5.448v10.896z" />
                      </svg>
                      <p className="mt-4 text-gray-400">Click the button below to open VS Code in a new tab</p>
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black bg-opacity-50 rounded-lg px-6 py-4">
                    <a 
                      href={vscodeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Open in VS Code
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Direct Access to VS Code
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  For the best experience, open VS Code in a full browser window using the URL below:
                </p>
                <div className="flex items-center p-2 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
                  <code className="flex-1 font-mono text-sm text-indigo-600 dark:text-indigo-400 overflow-auto">{vscodeUrl}{projectId ? `/?folder=/workspace/${projectId}` : ''}</code>
                  <button 
                    onClick={copyUrl}
                    className="ml-2 p-2 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 focus:outline-none"
                    aria-label="Copy URL"
                  >
                    {urlCopied ? (
                      <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                        <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                <a 
                  href={vscodeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 border border-transparent rounded-md font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Open VS Code in New Tab
                </a>
                
                <button 
                  onClick={handleClose}
                  className="inline-flex items-center justify-center px-6 py-3 bg-white border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Back to Projects
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
