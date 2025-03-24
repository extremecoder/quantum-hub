'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { SearchIcon, ChipIcon, CloudIcon, LightningBoltIcon, CubeIcon } from '@heroicons/react/outline';

// Mock data for featured quantum applications
const featuredApps = [
  {
    id: 'shor-15',
    title: "Shor's Algorithm - Factor 15",
    description: "Demonstration of Shor's algorithm for factoring the number 15 into its prime factors.",
    category: "Factorization",
    author: "Quantum Labs",
    qubits: 8,
    runs: 15642,
    imageUrl: '/images/shor-algorithm.png',
  },
  {
    id: 'vqe-h2',
    title: "VQE - H2 Molecule",
    description: "Variational Quantum Eigensolver application for calculating the ground state energy of H2.",
    category: "Chemistry",
    author: "Molecular Quantum",
    qubits: 4,
    runs: 8732,
    imageUrl: '/images/vqe-h2.png',
  },
  {
    id: 'qml-iris',
    title: "Quantum ML - Iris Classification",
    description: "Quantum Machine Learning classifier for the Iris dataset using quantum kernels.",
    category: "Machine Learning",
    author: "QML Research",
    qubits: 6,
    runs: 12340,
    imageUrl: '/images/qml-iris.png',
  },
  {
    id: 'quantum-random',
    title: "Quantum Random Number Generator",
    description: "True random number generation using quantum superposition and measurement.",
    category: "Utilities",
    author: "Random Quantum",
    qubits: 2,
    runs: 235890,
    imageUrl: '/images/qrng.png',
  },
];

// Mock data for categories
const categories = [
  { id: 'factorization', name: 'Factorization', count: 12, icon: CubeIcon },
  { id: 'chemistry', name: 'Chemistry', count: 28, icon: ChipIcon },
  { id: 'ml', name: 'Machine Learning', count: 18, icon: CloudIcon },
  { id: 'utilities', name: 'Utilities', count: 35, icon: LightningBoltIcon },
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 py-32">
        <div className="absolute inset-0 opacity-20">
          <svg className="h-full w-full" viewBox="0 0 800 800">
            <g fill="none" stroke="white" strokeWidth="1">
              <path d="M769 229L1037 260.9M927 880L731 737 520 660 309 538 40 599 295 764 126.5 879.5 40 599-197 493 102 382-31 229 126.5 79.5-69-63" />
              <path d="M-31 229L237 261 390 382 603 493 308.5 537.5 101.5 381.5M370 905L295 764" />
              <path d="M520 660L578 842 731 737 840 599 603 493 520 660 295 764 309 538 390 382 539 269 769 229 577.5 41.5 370 105 295 -36 126.5 79.5 237 261 102 382 40 599 -69 737 127 880" />
              <path d="M520-140L578.5 42.5 731-63M603 493L539 269 237 261 370 105M902 382L539 269M390 382L102 382" />
              <path d="M-222 42L126.5 79.5 370 105 539 269 577.5 41.5 927 80 769 229 902 382 603 493 731 737M295-36L577.5 41.5M578 842L295 764M40-201L127 80M102 382L-31 229" />
            </g>
          </svg>
        </div>
        <div className="container relative z-10 mx-auto px-4 text-center text-white">
          <motion.h1 
            className="mb-8 text-5xl font-bold md:text-6xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Quantum Hub
          </motion.h1>
          <motion.p 
            className="mx-auto mb-10 max-w-2xl text-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Discover, deploy, and run quantum applications on real quantum hardware
          </motion.p>
          <motion.div 
            className="mx-auto flex max-w-xl flex-col items-center justify-center rounded-xl bg-white p-2 shadow-lg dark:bg-gray-800 sm:flex-row sm:p-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="relative flex w-full flex-grow items-center">
              <SearchIcon className="absolute left-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search quantum applications..."
                className="w-full rounded-lg border-0 py-3 pl-10 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0 dark:bg-gray-800 dark:text-white sm:text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="mt-2 w-full rounded-lg bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700 sm:mt-0 sm:w-auto sm:flex-shrink-0">
              Search
            </button>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold dark:text-white">
            Browse by Category
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                className="rounded-xl bg-white p-6 shadow-md transition-all hover:shadow-lg dark:bg-gray-800"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900">
                  <category.icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="mb-2 text-xl font-semibold dark:text-white">{category.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {category.count} applications
                </p>
                <Link
                  href={`/category/${category.id}`}
                  className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                >
                  View applications &rarr;
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Applications Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold dark:text-white">
            Featured Quantum Applications
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {featuredApps.map((app, index) => (
              <motion.div
                key={app.id}
                className="overflow-hidden rounded-xl bg-white shadow-md transition-all hover:shadow-lg dark:bg-gray-800"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <div className="relative h-48 w-full bg-gray-200 dark:bg-gray-700">
                  <div className="h-full w-full bg-gradient-to-br from-indigo-500 to-purple-600 opacity-70"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">Q</span>
                  </div>
                </div>
                <div className="p-6">
                  <span className="inline-block rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                    {app.category}
                  </span>
                  <h3 className="mt-3 mb-2 text-xl font-bold dark:text-white">
                    {app.title}
                  </h3>
                  <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                    {app.description}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      {app.qubits} qubits
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {app.runs.toLocaleString()} runs
                    </span>
                  </div>
                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      By {app.author}
                    </span>
                    <Link
                      href={`/app/${app.id}`}
                      className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                    >
                      Run App
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link
              href="/marketplace"
              className="inline-flex items-center rounded-lg border border-indigo-600 px-6 py-3 font-medium text-indigo-600 transition-colors hover:bg-indigo-600 hover:text-white dark:text-indigo-400"
            >
              Browse All Applications
              <svg
                className="ml-2 h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                ></path>
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-6 text-3xl font-bold dark:text-white md:text-4xl">
            Ready to Build Your Own Quantum Application?
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
            Use our developer tools and SDK to create, test, and deploy your quantum algorithms
            directly to the Quantum Hub.
          </p>
          <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
            <Link
              href="/docs/getting-started"
              className="inline-flex items-center rounded-lg bg-indigo-600 px-8 py-3 font-medium text-white hover:bg-indigo-700"
            >
              Get Started
              <svg
                className="ml-2 h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                ></path>
              </svg>
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-8 py-3 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              View Documentation
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
} 