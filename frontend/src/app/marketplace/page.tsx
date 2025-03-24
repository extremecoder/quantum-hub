'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { SearchIcon, KeyIcon, CreditCardIcon, ChartBarIcon, ClockIcon } from '@heroicons/react/outline';

// Mock data for marketplace applications
const marketplaceApps = [
  {
    id: 'shor-15',
    title: "Shor's Algorithm - Factor 15",
    description: "REST API for Shor's algorithm factoring numbers up to 15 into prime factors with optimized circuit efficiency.",
    category: "Factorization",
    author: "Quantum Labs",
    price: "Free Trial / $4.99 per 100 requests",
    rating: 4.8,
    reviews: 124,
    apiEndpoint: "https://api.quantum-hub.example.com/factorization/shor",
    qubits: 8,
    slaUptime: "99.9%",
    responseTime: "< 500ms",
    lastUpdated: "2023-03-15",
  },
  {
    id: 'vqe-h2',
    title: "VQE - H2 Molecule",
    description: "API for Variational Quantum Eigensolver calculating the ground state energy of H2 molecule with high precision.",
    category: "Chemistry",
    author: "Molecular Quantum",
    price: "$9.99 per month / $0.10 per request",
    rating: 4.5,
    reviews: 87,
    apiEndpoint: "https://api.quantum-hub.example.com/chemistry/vqe",
    qubits: 4,
    slaUptime: "99.95%",
    responseTime: "< 800ms",
    lastUpdated: "2023-02-22",
  },
  {
    id: 'qml-iris',
    title: "Quantum ML - Iris Classification",
    description: "Production-ready API for quantum machine learning classifier pre-trained on the Iris dataset using quantum kernels.",
    category: "Machine Learning",
    author: "QML Research",
    price: "$19.99 per month / Unlimited requests",
    rating: 4.7,
    reviews: 56,
    apiEndpoint: "https://api.quantum-hub.example.com/ml/classifier",
    qubits: 6,
    slaUptime: "99.8%",
    responseTime: "< 200ms",
    lastUpdated: "2023-01-15",
  },
  {
    id: 'quantum-random',
    title: "Quantum Random Number Generator",
    description: "Enterprise-grade API providing true random numbers generated using quantum superposition and measurement.",
    category: "Utilities",
    author: "Random Quantum",
    price: "Free Tier (100 req/day) / $29.99 per month (unlimited)",
    rating: 4.9,
    reviews: 203,
    apiEndpoint: "https://api.quantum-hub.example.com/utils/random",
    qubits: 2,
    slaUptime: "99.99%",
    responseTime: "< 100ms",
    lastUpdated: "2023-03-01",
  },
  {
    id: 'quantum-teleportation',
    title: "Quantum State Transfer API",
    description: "API for securely transferring quantum states between different parts of your quantum application with teleportation.",
    category: "Communication",
    author: "Quantum Comm",
    price: "$49.99 per month (10,000 transfers)",
    rating: 4.6,
    reviews: 112,
    apiEndpoint: "https://api.quantum-hub.example.com/comms/teleport",
    qubits: 3,
    slaUptime: "99.9%",
    responseTime: "< 300ms",
    lastUpdated: "2023-02-18",
  },
  {
    id: 'grover-search',
    title: "Grover's Search Algorithm API",
    description: "High-performance API implementing Grover's quantum search algorithm for faster database search operations.",
    category: "Database",
    author: "Quantum Search Ltd",
    price: "$0.05 per request / Volume discounts available",
    rating: 4.4,
    reviews: 78,
    apiEndpoint: "https://api.quantum-hub.example.com/search/grover",
    qubits: 12,
    slaUptime: "99.8%",
    responseTime: "< 1500ms",
    lastUpdated: "2023-01-30",
  },
];

// Filter options
const categories = ["All", "Factorization", "Chemistry", "Machine Learning", "Utilities", "Communication", "Database"];
const sortOptions = ["Featured", "Most Popular", "Newest", "Price: Low to High", "Price: High to Low", "Highest Rated"];

export default function Marketplace() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSort, setSelectedSort] = useState('Featured');
  
  // Filter apps based on search query and category
  const filteredApps = marketplaceApps.filter(app => {
    const matchesSearch = app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          app.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || app.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Quantum Application Marketplace</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Access commercial quantum algorithms and applications via secure REST APIs
        </p>
      </div>
      
      {/* Search and filter bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search API services..."
            className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <SearchIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        </div>
        
        <select 
          className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="" disabled>Category</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        
        <select 
          className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          value={selectedSort}
          onChange={(e) => setSelectedSort(e.target.value)}
        >
          <option value="" disabled>Sort By</option>
          {sortOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>
      
      {/* Applications grid */}
      <div className="grid grid-cols-1 gap-6">
        {filteredApps.map((app, index) => (
          <motion.div
            key={app.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 * index }}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center mb-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mr-3">
                      {app.title}
                    </h3>
                    <span className="inline-block rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                      {app.category}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <span>By {app.author}</span>
                    <span className="mx-2">•</span>
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {app.rating} ({app.reviews} reviews)
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                    {app.price}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Updated {app.lastUpdated}
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {app.description}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">API Endpoint</span>
                  <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
                    {app.apiEndpoint}
                  </span>
                </div>
                <div className="flex items-center">
                  <ChartBarIcon className="h-5 w-5 text-indigo-500 mr-2" />
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400 block">Qubits</span>
                    <span className="font-medium">{app.qubits}</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <ClockIcon className="h-5 w-5 text-indigo-500 mr-2" />
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400 block">Response Time</span>
                    <span className="font-medium">{app.responseTime}</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400 block">SLA Uptime</span>
                    <span className="font-medium">{app.slaUptime}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <Link 
                  href={`/marketplace/${app.id}`}
                  className="btn-secondary inline-flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Documentation
                </Link>
                <div className="space-x-2">
                  <Link 
                    href={`/marketplace/${app.id}/try`}
                    className="btn-secondary inline-flex items-center"
                  >
                    <KeyIcon className="h-5 w-5 mr-1" />
                    Get Trial Key
                  </Link>
                  <Link 
                    href={`/marketplace/${app.id}/subscribe`}
                    className="btn-primary inline-flex items-center"
                  >
                    <CreditCardIcon className="h-5 w-5 mr-1" />
                    Subscribe
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 