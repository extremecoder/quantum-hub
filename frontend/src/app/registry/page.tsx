'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { SearchIcon, DownloadIcon, CodeIcon, TagIcon, DocumentTextIcon } from '@heroicons/react/outline';

// Mock data for registry circuits
const registryCircuits = [
  {
    id: 'bellstate-gen',
    name: 'Bell State Generator',
    description: 'A simple quantum circuit that generates the Bell state, demonstrating quantum entanglement.',
    tags: ['entanglement', 'educational', 'basic'],
    author: 'Quantum Labs',
    version: '1.2.0',
    downloads: 3245,
    lastUpdated: '2023-03-15',
    license: 'MIT',
    language: 'Python',
    stars: 87,
  },
  {
    id: 'qft-8qubit',
    name: 'Quantum Fourier Transform (8-qubit)',
    description: 'Implementation of the Quantum Fourier Transform algorithm for 8 qubits with optimized gate sequence.',
    tags: ['algorithm', 'fourier', 'optimization'],
    author: 'QFT Research',
    version: '2.1.3',
    downloads: 1876,
    lastUpdated: '2023-02-22',
    license: 'Apache-2.0',
    language: 'Qiskit',
    stars: 134,
  },
  {
    id: 'grover-oracle',
    name: 'Grover Oracle Generator',
    description: 'Utility for automatically generating optimized oracle circuits for Grover\'s algorithm based on input criteria.',
    tags: ['search', 'oracle', 'utility'],
    author: 'Search Quantum',
    version: '0.9.5',
    downloads: 2103,
    lastUpdated: '2023-04-01',
    license: 'GPL-3.0',
    language: 'Q#',
    stars: 56,
  },
  {
    id: 'vqe-ansatz',
    name: 'VQE Ansatz Library',
    description: 'Collection of parameterized quantum circuit ansatzes for Variational Quantum Eigensolver applications.',
    tags: ['chemistry', 'optimization', 'library'],
    author: 'Molecular Quantum',
    version: '1.5.2',
    downloads: 3721,
    lastUpdated: '2023-03-25',
    license: 'BSD-3',
    language: 'Cirq',
    stars: 209,
  },
  {
    id: 'quantum-error-correct',
    name: 'Quantum Error Correction Codes',
    description: 'Implementation of various quantum error correction codes including Surface Code and Steane Code.',
    tags: ['error-correction', 'noise', 'fault-tolerance'],
    author: 'QError Labs',
    version: '1.0.1',
    downloads: 985,
    lastUpdated: '2023-02-10',
    license: 'MIT',
    language: 'Python',
    stars: 112,
  },
  {
    id: 'qaoa-maxcut',
    name: 'QAOA for MaxCut Problem',
    description: 'Quantum Approximate Optimization Algorithm implementation for solving the MaxCut problem on arbitrary graphs.',
    tags: ['optimization', 'graph', 'algorithm'],
    author: 'Graph Quantum',
    version: '1.3.0',
    downloads: 1532,
    lastUpdated: '2023-03-18',
    license: 'Apache-2.0',
    language: 'Qiskit',
    stars: 98,
  },
];

// Filter options
const languages = ["All", "Python", "Qiskit", "Cirq", "Q#", "OpenQASM"];
const licenses = ["All", "MIT", "Apache-2.0", "GPL-3.0", "BSD-3"];
const sortOptions = ["Most Downloads", "Recently Updated", "Most Stars", "Name (A-Z)"];

export default function Registry() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [selectedLicense, setSelectedLicense] = useState('All');
  const [selectedSort, setSelectedSort] = useState('Most Downloads');
  
  // Filter circuits based on search query and filters
  const filteredCircuits = registryCircuits
    .filter(circuit => {
      const matchesSearch = circuit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           circuit.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           circuit.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesLanguage = selectedLanguage === 'All' || circuit.language === selectedLanguage;
      const matchesLicense = selectedLicense === 'All' || circuit.license === selectedLicense;
      return matchesSearch && matchesLanguage && matchesLicense;
    })
    .sort((a, b) => {
      switch(selectedSort) {
        case 'Most Downloads':
          return b.downloads - a.downloads;
        case 'Recently Updated':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        case 'Most Stars':
          return b.stars - a.stars;
        case 'Name (A-Z)':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Quantum Circuit Registry</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Discover, download, and contribute open-source quantum circuits
        </p>
      </div>
      
      {/* Search and filter bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search circuits by name, description or tags..."
            className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <SearchIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        </div>
        
        <select 
          className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
        >
          <option value="" disabled>Language</option>
          {languages.map(language => (
            <option key={language} value={language}>{language}</option>
          ))}
        </select>
        
        <select 
          className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          value={selectedLicense}
          onChange={(e) => setSelectedLicense(e.target.value)}
        >
          <option value="" disabled>License</option>
          {licenses.map(license => (
            <option key={license} value={license}>{license}</option>
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

      {/* Contribution button */}
      <div className="flex justify-end mb-6">
        <Link
          href="/dashboard/publish"
          className="btn-primary inline-flex items-center"
        >
          <CodeIcon className="w-5 h-5 mr-2" />
          Publish Circuit
        </Link>
      </div>
      
      {/* Circuit cards */}
      <div className="grid grid-cols-1 gap-6">
        {filteredCircuits.map((circuit, index) => (
          <motion.div
            key={circuit.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 * index }}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    {circuit.name}
                  </h3>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <span>{circuit.author}</span>
                    <span className="mx-2">•</span>
                    <span className="flex items-center">
                      <TagIcon className="h-4 w-4 mr-1" />
                      v{circuit.version}
                    </span>
                    <span className="mx-2">•</span>
                    <span>{circuit.license}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600 dark:text-gray-300 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    {circuit.stars}
                  </span>
                  <span className="text-gray-600 dark:text-gray-300 flex items-center">
                    <DownloadIcon className="h-4 w-4 mr-1" />
                    {circuit.downloads}
                  </span>
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {circuit.description}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {circuit.tags.map(tag => (
                  <span 
                    key={tag} 
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {circuit.language}
                  </span>
                  <span className="ml-4 text-sm text-gray-500 dark:text-gray-400">
                    Updated {circuit.lastUpdated}
                  </span>
                </div>
                
                <div className="flex space-x-2">
                  <Link 
                    href={`/registry/${circuit.id}`}
                    className="btn-secondary"
                  >
                    <DocumentTextIcon className="h-5 w-5 mr-1" />
                    Details
                  </Link>
                  <Link 
                    href={`/registry/${circuit.id}/download`}
                    className="btn-primary"
                  >
                    <DownloadIcon className="h-5 w-5 mr-1" />
                    Download
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