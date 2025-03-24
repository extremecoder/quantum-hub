'use client';

import { useState } from 'react';
import { 
  ArrowLeftIcon, 
  ServerIcon, 
  CurrencyDollarIcon,
  ClockIcon,
  ShieldCheckIcon,
  CheckCircleIcon
} from '@heroicons/react/outline';
import Link from 'next/link';

export default function PublishAPI() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'optimization',
    pricingModel: 'subscription',
    basePrice: '99',
    freeTrialDays: '14',
    endpoint: '',
    qubits: '16',
    responseTime: '120',
    sla: '99.5',
    selectedCircuit: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
    console.log('Publishing API:', formData);
    nextStep();
  };

  const myCircuits = [
    { id: 'circuit-1', name: 'Advanced Quantum Fourier Transform', version: 'v1.2.0', downloads: 1245 },
    { id: 'circuit-2', name: 'Optimized Grover\'s Algorithm', version: 'v2.1.3', downloads: 987 }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 inline-flex items-center">
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
      </div>
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Publish Quantum API</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Turn your quantum circuit into a commercial API available in the marketplace
        </p>
        
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${step >= 1 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}>
              <div className={`flex items-center justify-center h-8 w-8 rounded-full ${step >= 1 ? 'bg-indigo-100 dark:bg-indigo-900' : 'bg-gray-200 dark:bg-gray-700'}`}>
                1
              </div>
              <span className="ml-2 text-sm font-medium">Select Circuit</span>
            </div>
            <div className={`flex-1 h-1 mx-4 ${step >= 2 ? 'bg-indigo-600 dark:bg-indigo-400' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
            <div className={`flex items-center ${step >= 2 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}>
              <div className={`flex items-center justify-center h-8 w-8 rounded-full ${step >= 2 ? 'bg-indigo-100 dark:bg-indigo-900' : 'bg-gray-200 dark:bg-gray-700'}`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium">API Details</span>
            </div>
            <div className={`flex-1 h-1 mx-4 ${step >= 3 ? 'bg-indigo-600 dark:bg-indigo-400' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
            <div className={`flex items-center ${step >= 3 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}>
              <div className={`flex items-center justify-center h-8 w-8 rounded-full ${step >= 3 ? 'bg-indigo-100 dark:bg-indigo-900' : 'bg-gray-200 dark:bg-gray-700'}`}>
                3
              </div>
              <span className="ml-2 text-sm font-medium">Pricing</span>
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
          {/* Step 1: Select Circuit */}
          {step === 1 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Select Circuit to Publish</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Choose one of your published circuits to convert into an API service for the marketplace.
              </p>
              
              <div className="space-y-4">
                {myCircuits.map(circuit => (
                  <div 
                    key={circuit.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      formData.selectedCircuit === circuit.id 
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-400' 
                        : 'border-gray-200 hover:border-indigo-300 dark:border-gray-700 dark:hover:border-indigo-600'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, selectedCircuit: circuit.id }))}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white">{circuit.name}</h4>
                        <div className="mt-1 flex items-center space-x-4">
                          <span className="text-sm text-gray-500 dark:text-gray-400">{circuit.version}</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">{circuit.downloads} downloads</span>
                        </div>
                      </div>
                      {formData.selectedCircuit === circuit.id && (
                        <div className="h-6 w-6 bg-indigo-600 dark:bg-indigo-500 text-white rounded-full flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  onClick={nextStep}
                  className="btn-primary"
                  disabled={!formData.selectedCircuit}
                >
                  Next: API Details
                </button>
              </div>
            </div>
          )}
          
          {/* Step 2: API Details */}
          {step === 2 && (
            <form>
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    API Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="e.g., Grover's Algorithm API"
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
                    placeholder="Describe what your API does, including use cases and features"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    id="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  >
                    <option value="optimization">Optimization</option>
                    <option value="machine-learning">Machine Learning</option>
                    <option value="cryptography">Cryptography</option>
                    <option value="simulation">Simulation</option>
                    <option value="finance">Finance</option>
                    <option value="chemistry">Chemistry</option>
                    <option value="communication">Communication</option>
                    <option value="database">Database</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="endpoint" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    API Endpoint Name
                  </label>
                  <div className="flex rounded-md shadow-sm">
                    <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400">
                      https://api.quantum-hub.io/v1/
                    </span>
                    <input
                      type="text"
                      name="endpoint"
                      id="endpoint"
                      value={formData.endpoint}
                      onChange={handleChange}
                      className="block w-full flex-1 rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="grover-search"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label htmlFor="qubits" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Maximum Qubits
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        type="number"
                        name="qubits"
                        id="qubits"
                        value={formData.qubits}
                        onChange={handleChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        min="1"
                        max="100"
                        required
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <ServerIcon className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="responseTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Average Response Time
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        type="number"
                        name="responseTime"
                        id="responseTime"
                        value={formData.responseTime}
                        onChange={handleChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        min="1"
                        required
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <span className="text-gray-500 dark:text-gray-400 text-sm">ms</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="sla" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      SLA Uptime
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        type="number"
                        name="sla"
                        id="sla"
                        value={formData.sla}
                        onChange={handleChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        min="90"
                        max="100"
                        step="0.1"
                        required
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <span className="text-gray-500 dark:text-gray-400 text-sm">%</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between mt-8">
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
                  >
                    Next: Pricing
                  </button>
                </div>
              </div>
            </form>
          )}
          
          {/* Step 3: Pricing */}
          {step === 3 && (
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Pricing Model
                  </label>
                  <div className="mt-2 space-y-4">
                    <div className="flex items-center">
                      <input
                        id="pricing-subscription"
                        name="pricingModel"
                        type="radio"
                        value="subscription"
                        checked={formData.pricingModel === 'subscription'}
                        onChange={handleChange}
                        className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600"
                      />
                      <label htmlFor="pricing-subscription" className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Subscription (Monthly fee with quota)
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="pricing-usage"
                        name="pricingModel"
                        type="radio"
                        value="usage"
                        checked={formData.pricingModel === 'usage'}
                        onChange={handleChange}
                        className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600"
                      />
                      <label htmlFor="pricing-usage" className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Usage-Based (Pay per API call)
                      </label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="basePrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Base Price
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400">$</span>
                    </div>
                    <input
                      type="number"
                      name="basePrice"
                      id="basePrice"
                      value={formData.basePrice}
                      onChange={handleChange}
                      className="block w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      min="0"
                      step="0.01"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400 text-sm">
                        {formData.pricingModel === 'subscription' ? '/ month' : '/ 1000 calls'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="freeTrialDays" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Free Trial Period (Days)
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="number"
                      name="freeTrialDays"
                      id="freeTrialDays"
                      value={formData.freeTrialDays}
                      onChange={handleChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      min="0"
                      max="90"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <ClockIcon className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Set to 0 if you don't want to offer a free trial.
                  </p>
                </div>
                
                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
                  <div className="flex items-start">
                    <ShieldCheckIcon className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-indigo-900 dark:text-indigo-300">Marketplace Policy</h4>
                      <p className="mt-1 text-sm text-indigo-700 dark:text-indigo-300">
                        Your API must maintain the promised SLA uptime and response times. Quantum Hub takes a 15% commission on all marketplace sales.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between mt-8">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="btn-secondary"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    Publish API
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
                API Published Successfully!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Your quantum API "{formData.name}" has been published to the Marketplace and is now available for customers to purchase.
              </p>
              
              <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 max-w-md mx-auto text-left mb-8">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">API Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Endpoint:</span>
                    <span className="font-mono text-gray-900 dark:text-white">https://api.quantum-hub.io/v1/{formData.endpoint}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Base Price:</span>
                    <span className="text-gray-900 dark:text-white">${formData.basePrice} {formData.pricingModel === 'subscription' ? '/ month' : '/ 1000 calls'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Free Trial:</span>
                    <span className="text-gray-900 dark:text-white">{formData.freeTrialDays} days</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col space-y-4 items-center">
                <Link href="/marketplace" className="btn-secondary">
                  View in Marketplace
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