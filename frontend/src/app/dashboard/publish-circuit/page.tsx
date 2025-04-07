'use client';

import { useState, useRef } from 'react';
import { 
  UploadIcon, 
  DocumentTextIcon, 
  CodeIcon, 
  TagIcon,
  AcademicCapIcon,
  AnnotationIcon,
  LockClosedIcon,
  CheckCircleIcon,
  ArrowLeftIcon
} from '@heroicons/react/outline';
import Link from 'next/link';

export default function PublishCircuit() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    circuitName: '',
    description: '',
    tags: '',
    language: 'qiskit',
    license: 'apache-2.0',
    readme: '',
    version: '0.1.0',
    mainFile: null as File | null,
    additionalFiles: [] as File[]
  });
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const additionalFilesRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData(prev => ({
        ...prev,
        mainFile: e.target.files![0]
      }));
    }
  };

  const handleAdditionalFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData(prev => ({
        ...prev,
        additionalFiles: [...prev.additionalFiles, ...Array.from(e.target.files || [])]
      }));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFormData(prev => ({
        ...prev,
        mainFile: e.dataTransfer.files[0]
      }));
    }
  };

  const removeAdditionalFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      additionalFiles: prev.additionalFiles.filter((_, i) => i !== index)
    }));
  };

  const nextStep = () => {
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here we would handle the actual submission to the backend
    console.log('Publishing circuit:', formData);
    
    // Proceed to success screen
    nextStep();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 inline-flex items-center">
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
      </div>
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Publish Quantum Circuit</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Share your quantum circuits with the community in the open-source registry
        </p>
        
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${step >= 1 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}>
              <div className={`flex items-center justify-center h-8 w-8 rounded-full ${step >= 1 ? 'bg-indigo-100 dark:bg-indigo-900' : 'bg-gray-200 dark:bg-gray-700'}`}>
                1
              </div>
              <span className="ml-2 text-sm font-medium">Circuit Info</span>
            </div>
            <div className={`flex-1 h-1 mx-4 ${step >= 2 ? 'bg-indigo-600 dark:bg-indigo-400' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
            <div className={`flex items-center ${step >= 2 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}>
              <div className={`flex items-center justify-center h-8 w-8 rounded-full ${step >= 2 ? 'bg-indigo-100 dark:bg-indigo-900' : 'bg-gray-200 dark:bg-gray-700'}`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium">Upload Files</span>
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
          {/* Step 1: Circuit Info */}
          {step === 1 && (
            <form>
              <div className="space-y-6">
                <div>
                  <label htmlFor="circuitName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Circuit Name
                  </label>
                  <input
                    type="text"
                    name="circuitName"
                    id="circuitName"
                    value={formData.circuitName}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="e.g., Advanced Quantum Fourier Transform"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Provide a brief description of your quantum circuit's functionality and use cases"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      name="tags"
                      id="tags"
                      value={formData.tags}
                      onChange={handleChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="e.g., qft, fourier, optimization"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="version" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Version
                    </label>
                    <input
                      type="text"
                      name="version"
                      id="version"
                      value={formData.version}
                      onChange={handleChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="e.g., 1.0.0"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Programming Language/Framework
                    </label>
                    <select
                      name="language"
                      id="language"
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
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="license" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      License
                    </label>
                    <select
                      name="license"
                      id="license"
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
                      <option value="mpl-2.0">Mozilla Public License 2.0</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="readme" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    README Content (Markdown supported)
                  </label>
                  <textarea
                    name="readme"
                    id="readme"
                    rows={6}
                    value={formData.readme}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm"
                    placeholder="# Circuit Name&#10;&#10;## Description&#10;&#10;## Usage&#10;&#10;## Example&#10;&#10;## References"
                  />
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Provide documentation in Markdown format to help others understand and use your circuit.
                  </p>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={nextStep}
                    className="btn-primary"
                  >
                    Next: Upload Files
                  </button>
                </div>
              </div>
            </form>
          )}
          
          {/* Step 2: Upload Files */}
          {step === 2 && (
            <div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Upload Main Circuit File</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Upload the primary quantum circuit file. This is the main implementation file that others will use.
                  </p>
                  
                  <div 
                    className={`border-2 border-dashed rounded-lg p-8 text-center ${isDragging ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-300 dark:border-gray-600'}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    {formData.mainFile ? (
                      <div className="space-y-2">
                        <DocumentTextIcon className="h-10 w-10 mx-auto text-indigo-600 dark:text-indigo-400" />
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{formData.mainFile.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {(formData.mainFile.size / 1024).toFixed(2)} KB
                        </p>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, mainFile: null }))}
                          className="text-xs text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <UploadIcon className="h-10 w-10 mx-auto text-gray-400" />
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Drag and drop your file here, or <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                          >
                            browse
                          </button>
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Supported formats: .py, .ipynb, .qs, .qasm, .qsharp, .quil
                        </p>
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          accept=".py,.ipynb,.qs,.qasm,.qsharp,.quil,.jl"
                          onChange={handleFileChange}
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Upload Additional Files (Optional)</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Include any additional files needed for your quantum circuit, such as dependencies, configuration files, or examples.
                  </p>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Additional Files ({formData.additionalFiles.length})
                      </span>
                      <button
                        type="button"
                        onClick={() => additionalFilesRef.current?.click()}
                        className="text-xs inline-flex items-center text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        <UploadIcon className="h-4 w-4 mr-1" />
                        Add Files
                      </button>
                      <input
                        type="file"
                        ref={additionalFilesRef}
                        className="hidden"
                        multiple
                        onChange={handleAdditionalFilesChange}
                      />
                    </div>
                    
                    {formData.additionalFiles.length > 0 ? (
                      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {formData.additionalFiles.map((file, index) => (
                          <li key={index} className="py-3 flex items-center justify-between">
                            <div className="flex items-center">
                              <CodeIcon className="h-5 w-5 text-gray-400 mr-2" />
                              <span className="text-sm font-medium text-gray-900 dark:text-white mr-2">
                                {file.name}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {(file.size / 1024).toFixed(2)} KB
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeAdditionalFile(index)}
                              className="text-xs text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          No additional files uploaded
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="btn-secondary"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="btn-primary"
                    disabled={!formData.mainFile}
                  >
                    Next: Review
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 3: Review & Publish */}
          {step === 3 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Review Your Circuit</h3>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Circuit Name</h4>
                      <p className="text-md font-medium text-gray-900 dark:text-white">{formData.circuitName}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</h4>
                      <p className="text-md text-gray-900 dark:text-white">{formData.description}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Tags</h4>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {formData.tags.split(',').map((tag, index) => (
                          tag.trim() && (
                            <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                              <TagIcon className="h-3 w-3 mr-1" />
                              {tag.trim()}
                            </span>
                          )
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Version</h4>
                        <p className="text-md font-medium text-gray-900 dark:text-white">{formData.version}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Language</h4>
                        <div className="flex items-center mt-1">
                          <CodeIcon className="h-4 w-4 mr-1 text-gray-400" />
                          <p className="text-md font-medium text-gray-900 dark:text-white">{formData.language}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">License</h4>
                        <div className="flex items-center mt-1">
                          <LockClosedIcon className="h-4 w-4 mr-1 text-gray-400" />
                          <p className="text-md font-medium text-gray-900 dark:text-white">{formData.license}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Files</h4>
                      <div className="mt-1 space-y-2">
                        <div className="flex items-center">
                          <DocumentTextIcon className="h-4 w-4 mr-1 text-indigo-600 dark:text-indigo-400" />
                          <p className="text-md font-medium text-gray-900 dark:text-white">{formData.mainFile?.name}</p>
                          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                            (Main)
                          </span>
                        </div>
                        
                        {formData.additionalFiles.map((file, index) => (
                          <div key={index} className="flex items-center">
                            <CodeIcon className="h-4 w-4 mr-1 text-gray-400" />
                            <p className="text-md font-medium text-gray-900 dark:text-white">{file.name}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <AcademicCapIcon className="h-5 w-5 mr-2 text-gray-400" />
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">README Preview</h4>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-md p-4 font-mono text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap border border-gray-200 dark:border-gray-700">
                    {formData.readme || "No README content provided."}
                  </div>
                </div>
                
                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
                  <div className="flex items-start">
                    <AnnotationIcon className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-indigo-900 dark:text-indigo-300">Publishing Notes</h4>
                      <p className="mt-1 text-sm text-indigo-700 dark:text-indigo-300">
                        By publishing this circuit, you're making it freely available to the quantum community. 
                        Ensure your code adheres to the specified license and contains appropriate documentation.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="btn-secondary"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="btn-primary"
                  >
                    Publish Circuit
                  </button>
                </div>
              </div>
            </div>
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
                Circuit Published Successfully!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                Your quantum circuit "{formData.circuitName}" has been published to the Registry and is now available for the community to use.
              </p>
              
              <div className="flex flex-col space-y-4 items-center">
                <Link href="/registry" className="btn-secondary">
                  View in Registry
                </Link>
                <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
                  Back to Dashboard
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 