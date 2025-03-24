'use client';

import { useState } from 'react';
import { 
  ArrowLeftIcon, 
  TagIcon,
  DocumentTextIcon,
  CodeIcon,
  LockClosedIcon,
  CheckCircleIcon,
  CloudUploadIcon
} from '@heroicons/react/outline';
import Link from 'next/link';

export default function PublishProject() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: 'My Quantum Circuit',
    description: 'A simple Bell state preparation circuit',
    tags: 'entanglement, bell-state, educational',
    language: 'qiskit',
    license: 'apache-2.0',
    version: '1.0.0',
    readme: '# Bell State Preparation\n\nThis circuit creates a simple Bell state, demonstrating quantum entanglement.',
    target: 'registry' // or 'marketplace'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(prev => prev + 1);
    } else {
      // Submit the form
      console.log('Publishing:', formData);
      setStep(4); // Move to success page
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/develop" className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 inline-flex items-center">
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Development
        </Link>
      </div>
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Publish Your Project</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Share your quantum project with the community or marketplace
        </p>
        
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${step >= 1 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}>
              <div className={`flex items-center justify-center h-8 w-8 rounded-full ${step >= 1 ? 'bg-indigo-100 dark:bg-indigo-900' : 'bg-gray-200 dark:bg-gray-700'}`}>
                1
              </div>
              <span className="ml-2 text-sm font-medium">Project Info</span>
            </div>
            <div className={`flex-1 h-1 mx-4 ${step >= 2 ? 'bg-indigo-600 dark:bg-indigo-400' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
            <div className={`flex items-center ${step >= 2 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}>
              <div className={`flex items-center justify-center h-8 w-8 rounded-full ${step >= 2 ? 'bg-indigo-100 dark:bg-indigo-900' : 'bg-gray-200 dark:bg-gray-700'}`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium">Publication Details</span>
            </div>
            <div className={`flex-1 h-1 mx-4 ${step >= 3 ? 'bg-indigo-600 dark:bg-indigo-400' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
            <div className={`flex items-center ${step >= 3 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}>
              <div className={`flex items-center justify-center h-8 w-8 rounded-full ${step >= 3 ? 'bg-indigo-100 dark:bg-indigo-900' : 'bg-gray-200 dark:bg-gray-700'}`}>
                3
              </div>
              <span className="ml-2 text-sm font-medium">Review & Publish</span>
            </div>
            <div className={`flex-1 h-1 mx-4 ${step >= 4 ? 'bg-indigo-600 dark:bg-indigo-400' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
            <div className={`flex items-center ${step >= 4 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}>
              <div className={`flex items-center justify-center h-8 w-8 rounded-full ${step >= 4 ? 'bg-indigo-100 dark:bg-indigo-900' : 'bg-gray-200 dark:bg-gray-700'}`}>
                4
              </div>
              <span className="ml-2 text-sm font-medium">Complete</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          {/* Step 1: Project Info */}
          {step === 1 && (
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Project Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tags (comma-separated)
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <TagIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="tags"
                      name="tags"
                      value={formData.tags}
                      onChange={handleChange}
                      className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="entanglement, simulation, algorithm"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    Next: Publication Details
                  </button>
                </div>
              </div>
            </form>
          )}
          
          {/* Step 2: Publication Details */}
          {step === 2 && (
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Programming Language/Framework
                    </label>
                    <select
                      id="language"
                      name="language"
                      value={formData.language}
                      onChange={handleChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    >
                      <option value="qiskit">Qiskit</option>
                      <option value="cirq">Cirq</option>
                      <option value="pennylane">PennyLane</option>
                      <option value="q#">Q#</option>
                      <option value="pyquil">PyQuil</option>
                      <option value="qasm">QASM</option>
                      <option value="silq">Silq</option>
                      <option value="quipper">Quipper</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="license" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      License
                    </label>
                    <select
                      id="license"
                      name="license"
                      value={formData.license}
                      onChange={handleChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    >
                      <option value="mit">MIT</option>
                      <option value="apache-2.0">Apache 2.0</option>
                      <option value="gpl-3.0">GPL 3.0</option>
                      <option value="bsd-3-clause">BSD 3-Clause</option>
                      <option value="cc0-1.0">CC0 1.0</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="version" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Version
                  </label>
                  <input
                    type="text"
                    id="version"
                    name="version"
                    value={formData.version}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="1.0.0"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="readme" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    README (Markdown)
                  </label>
                  <textarea
                    id="readme"
                    name="readme"
                    rows={8}
                    value={formData.readme}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm"
                  />
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Provide documentation to help others understand and use your project.
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Publication Target
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        formData.target === 'registry'
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-400'
                          : 'border-gray-200 hover:border-indigo-300 dark:border-gray-700 dark:hover:border-indigo-600'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, target: 'registry' }))}
                    >
                      <div className="flex items-center mb-2">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mr-3">
                          <CodeIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Registry</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Open-source publication</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Share your code freely with the quantum community. No monetization.
                      </p>
                    </div>
                    
                    <div
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        formData.target === 'marketplace'
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-400'
                          : 'border-gray-200 hover:border-indigo-300 dark:border-gray-700 dark:hover:border-indigo-600'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, target: 'marketplace' }))}
                    >
                      <div className="flex items-center mb-2">
                        <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mr-3">
                          <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Marketplace</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Commercial API publication</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Monetize your code by offering it as a commercial API. Additional steps required.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="btn-secondary"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    Next: Review
                  </button>
                </div>
              </div>
            </form>
          )}
          
          {/* Step 3: Review & Publish */}
          {step === 3 && (
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Review Publication</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Project Name</h3>
                      <p className="mt-1 text-lg font-medium text-gray-900 dark:text-white">{formData.name}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</h3>
                      <p className="mt-1 text-gray-900 dark:text-white">{formData.description}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Tags</h3>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {formData.tags.split(',').map((tag, i) => (
                          <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Language/Framework</h3>
                      <div className="mt-1 flex items-center">
                        <CodeIcon className="h-5 w-5 mr-1 text-gray-400" />
                        <p className="text-gray-900 dark:text-white">{formData.language}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">License</h3>
                      <div className="mt-1 flex items-center">
                        <LockClosedIcon className="h-5 w-5 mr-1 text-gray-400" />
                        <p className="text-gray-900 dark:text-white">{formData.license}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Version</h3>
                      <p className="mt-1 text-gray-900 dark:text-white">{formData.version}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Publication Target</h3>
                      <p className="mt-1 text-gray-900 dark:text-white">
                        {formData.target === 'registry' ? 'Registry (Open Source)' : 'Marketplace (Commercial)'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">README Preview</h3>
                  <div className="bg-white dark:bg-gray-800 rounded-md p-4 border border-gray-200 dark:border-gray-700 font-mono text-sm text-gray-800 dark:text-gray-300 whitespace-pre-wrap overflow-auto max-h-64">
                    {formData.readme}
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="btn-secondary"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="btn-primary inline-flex items-center"
                  >
                    <CloudUploadIcon className="h-5 w-5 mr-2" />
                    Publish Now
                  </button>
                </div>
              </div>
            </form>
          )}
          
          {/* Step 4: Success */}
          {step === 4 && (
            <div className="text-center py-8">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
                  <CheckCircleIcon className="h-12 w-12 text-green-600 dark:text-green-400" />
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Successfully Published!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                Your project "{formData.name}" has been published to the {formData.target === 'registry' ? 'Registry' : 'Marketplace'} and is now available for the community to use.
              </p>
              
              <div className="flex flex-col space-y-4 items-center">
                <Link 
                  href={formData.target === 'registry' ? '/registry' : '/marketplace'} 
                  className="btn-primary"
                >
                  View in {formData.target === 'registry' ? 'Registry' : 'Marketplace'}
                </Link>
                <Link href="/develop" className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
                  Back to Development
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 