'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function VSCodeDemoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [vscodeUrl, setVscodeUrl] = useState('http://localhost:8080');
  const [urlCopied, setUrlCopied] = useState(false);
  
  // Simulate loading state for demo purposes
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Function to copy URL to clipboard
  const copyUrl = () => {
    navigator.clipboard.writeText(vscodeUrl);
    setUrlCopied(true);
    setTimeout(() => setUrlCopied(false), 2000);
  };
  
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
          Quantum Project Demo
        </h1>
        <div className="flex items-center space-x-2">
          <span className="px-2 py-1 text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300 rounded-md">
            circuit
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
                Loading VS Code Demo...
              </p>
            </div>
          </div>
        ) : (
          <div className="h-full p-6 bg-gray-100 dark:bg-gray-900 overflow-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                VS Code Integration Demo
              </h2>
              
              <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300 flex items-center">
                  <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Important Note
                </h3>
                <p className="mt-2 text-yellow-700 dark:text-yellow-400">
                  Due to WebSocket connectivity limitations in proxy environments, VS Code is best accessed directly in a full browser window.
                  Please use the link below to open VS Code in a new browser tab.
                </p>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                The Quantum Hub platform includes embedded VS Code capabilities, allowing you to write, edit, and run quantum code directly in your browser. 
                This powerful integration provides a complete development environment within the Quantum Hub platform.
              </p>
              
              <div className="mb-6 relative overflow-hidden border rounded-lg">
                <div className="w-full h-96 bg-gray-800 relative">
                  {/* Mock VS Code UI */}
                  <div className="absolute inset-0 flex flex-col">
                    <div className="h-10 bg-gray-900 flex items-center px-4 border-b border-gray-700">
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                      <div className="ml-4 flex-1 text-center text-sm text-gray-400">quantum-project - VS Code</div>
                    </div>
                    <div className="flex-1 flex">
                      <div className="w-14 bg-gray-900 flex flex-col items-center py-4 border-r border-gray-700">
                        <div className="w-6 h-6 bg-gray-700 mb-4"></div>
                        <div className="w-6 h-6 bg-blue-600 mb-4"></div>
                        <div className="w-6 h-6 bg-gray-700 mb-4"></div>
                        <div className="w-6 h-6 bg-gray-700"></div>
                      </div>
                      <div className="w-64 bg-gray-800 border-r border-gray-700">
                        <div className="p-2 text-gray-400 text-xs uppercase font-semibold">Explorer</div>
                        <div className="p-2">
                          <div className="text-gray-300 py-1 flex items-center">
                            <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                            </svg>
                            quantum-project
                          </div>
                          <div className="ml-4 text-gray-300 py-1">
                            <div className="flex items-center">
                              <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                              </svg>
                              src
                            </div>
                          </div>
                          <div className="ml-8 text-gray-300 py-1">
                            <div className="flex items-center">
                              <svg className="h-4 w-4 mr-1 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                              </svg>
                              main.py
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 bg-gray-900 flex flex-col">
                        <div className="h-9 bg-gray-800 flex">
                          <div className="px-3 h-full flex items-center bg-gray-900 text-white text-sm border-r border-gray-700">main.py</div>
                        </div>
                        <div className="flex-1 p-4 text-gray-300 font-mono text-sm overflow-hidden">
                          <div className="flex">
                            <div className="text-gray-500 mr-4 w-6 text-right">1</div>
                            <div><span className="text-blue-400">"""</span></div>
                          </div>
                          <div className="flex">
                            <div className="text-gray-500 mr-4 w-6 text-right">2</div>
                            <div><span className="text-blue-400">Main module for data processing functions.</span></div>
                          </div>
                          <div className="flex">
                            <div className="text-gray-500 mr-4 w-6 text-right">3</div>
                            <div><span className="text-blue-400">"""</span></div>
                          </div>
                          <div className="flex">
                            <div className="text-gray-500 mr-4 w-6 text-right">4</div>
                            <div></div>
                          </div>
                          <div className="flex">
                            <div className="text-gray-500 mr-4 w-6 text-right">5</div>
                            <div><span className="text-purple-400">import</span> numpy <span className="text-purple-400">as</span> np</div>
                          </div>
                          <div className="flex">
                            <div className="text-gray-500 mr-4 w-6 text-right">6</div>
                            <div><span className="text-purple-400">import</span> pandas <span className="text-purple-400">as</span> pd</div>
                          </div>
                          <div className="flex">
                            <div className="text-gray-500 mr-4 w-6 text-right">7</div>
                            <div><span className="text-purple-400">import</span> matplotlib.pyplot <span className="text-purple-400">as</span> plt</div>
                          </div>
                          <div className="flex">
                            <div className="text-gray-500 mr-4 w-6 text-right">8</div>
                            <div></div>
                          </div>
                          <div className="flex">
                            <div className="text-gray-500 mr-4 w-6 text-right">9</div>
                            <div></div>
                          </div>
                          <div className="flex">
                            <div className="text-gray-500 mr-4 w-6 text-right">10</div>
                            <div><span className="text-purple-400">def</span> <span className="text-yellow-400">analyze_data</span>(data):</div>
                          </div>
                          <div className="flex">
                            <div className="text-gray-500 mr-4 w-6 text-right">11</div>
                            <div>    <span className="text-blue-400">"""Analyze the input data and return basic statistics."""</span></div>
                          </div>
                          <div className="flex">
                            <div className="text-gray-500 mr-4 w-6 text-right">12</div>
                            <div>    <span className="text-purple-400">return</span> {'{'}</div>
                          </div>
                          <div className="flex">
                            <div className="text-gray-500 mr-4 w-6 text-right">13</div>
                            <div>        <span className="text-green-400">"mean"</span>: np.mean(data),</div>
                          </div>
                          <div className="flex">
                            <div className="text-gray-500 mr-4 w-6 text-right">14</div>
                            <div>        <span className="text-green-400">"median"</span>: np.median(data),</div>
                          </div>
                          <div className="flex">
                            <div className="text-gray-500 mr-4 w-6 text-right">15</div>
                            <div>        <span className="text-green-400">"std"</span>: np.std(data)</div>
                          </div>
                          <div className="flex">
                            <div className="text-gray-500 mr-4 w-6 text-right">16</div>
                            <div>    {'}'}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Direct Access to VS Code
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  For the best experience, open VS Code in a full browser window using the URL below:
                </p>
                <div className="flex items-center p-2 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
                  <code className="flex-1 font-mono text-sm text-indigo-600 dark:text-indigo-400">{vscodeUrl}</code>
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
                  onClick={() => router.push('/develop')}
                  className="inline-flex items-center justify-center px-6 py-3 bg-white border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Back to Projects
                </button>
              </div>
            </div>
            
            <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 max-w-4xl mx-auto">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Integration Features
              </h3>
              
              <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                <li>Full VS Code editor with syntax highlighting and IntelliSense</li>
                <li>Integrated terminal for running quantum code</li>
                <li>File explorer for managing project files</li>
                <li>Built-in Git integration for version control</li>
                <li>Extension marketplace for adding quantum development tools</li>
                <li>Automatic saving and project persistence</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
