'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { SearchIcon } from '@heroicons/react/outline';

// Mock data for marketplace applications
const marketplaceApps = [
  {
    id: 'shor-15',
    title: "Shor's Algorithm - Factor 15",
    description: "Demonstration of Shor's algorithm for factoring the number 15 into its prime factors.",
    category: "Factorization",
    author: "Quantum Labs",
    price: "Free",
    rating: 4.8,
    reviews: 124,
    imageUrl: '/images/shor-algorithm.png',
  },
  {
    id: 'vqe-h2',
    title: "VQE - H2 Molecule",
    description: "Variational Quantum Eigensolver application for calculating the ground state energy of H2.",
    category: "Chemistry",
    author: "Molecular Quantum",
    price: "$4.99",
    rating: 4.5,
    reviews: 87,
    imageUrl: '/images/vqe-h2.png',
  },
  {
    id: 'qml-iris',
    title: "Quantum ML - Iris Classification",
    description: "Quantum Machine Learning classifier for the Iris dataset using quantum kernels.",
    category: "Machine Learning",
    author: "QML Research",
    price: "$9.99",
    rating: 4.7,
    reviews: 56,
    imageUrl: '/images/qml-iris.png',
  },
  {
    id: 'quantum-random',
    title: "Quantum Random Number Generator",
    description: "True random number generation using quantum superposition and measurement.",
    category: "Utilities",
    author: "Random Quantum",
    price: "Free",
    rating: 4.9,
    reviews: 203,
    imageUrl: '/images/qrng.png',
  },
  {
    id: 'quantum-teleportation',
    title: "Quantum Teleportation Demo",
    description: "Educational demonstration of quantum teleportation protocol with visualization.",
    category: "Education",
    author: "Quantum Education Group",
    price: "$2.99",
    rating: 4.6,
    reviews: 112,
    imageUrl: '/images/teleportation.png',
  },
  {
    id: 'grover-search',
    title: "Grover's Search Algorithm",
    description: "Implementation of Grover's quantum search algorithm for faster database search.",
    category: "Factorization",
    author: "Quantum Labs",
    price: "$7.99",
    rating: 4.4,
    reviews: 78,
    imageUrl: '/images/grover.png',
  },
];

// Filter options
const categories = ["All", "Factorization", "Chemistry", "Machine Learning", "Utilities", "Education"];
const sortOptions = ["Featured", "Newest", "Price: Low to High", "Price: High to Low", "Top Rated"];

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
          Discover and download quantum applications from our community of developers
        </p>
      </div>
      
      {/* Search and filter bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search applications..."
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
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        
        <select 
          className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          value={selectedSort}
          onChange={(e) => setSelectedSort(e.target.value)}
        >
          {sortOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>
      
      {/* Applications grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredApps.map((app, index) => (
          <motion.div
            key={app.id}
            className="group overflow-hidden rounded-lg bg-white shadow-md transition-all hover:shadow-lg dark:bg-gray-800"
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 * index }}
          >
            <Link href={`/app/${app.id}`} className="block">
              <div className="relative h-40 w-full overflow-hidden rounded-t-lg bg-gradient-to-br from-indigo-500 to-purple-500">
                <div className="flex h-full w-full items-center justify-center text-white">
                  <span className="text-2xl font-bold">{app.title.charAt(0)}</span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="inline-block rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                    {app.category}
                  </span>
                  <span className="font-bold text-lg text-indigo-600 dark:text-indigo-400">
                    {app.price}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{app.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{app.description}</p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="mr-1 text-yellow-400">★</div>
                    <span className="text-sm font-medium">{app.rating} ({app.reviews})</span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    By {app.author}
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 