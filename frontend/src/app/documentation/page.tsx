'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpenIcon, CodeIcon, ChipIcon, AcademicCapIcon, BookmarkIcon, SearchIcon } from '@heroicons/react/outline';

// Define types for documentation data
interface DocumentationTopic {
  id: string;
  title: string;
  description: string;
}

interface DocumentationData {
  [category: string]: DocumentationTopic[];
}

// Documentation categories and topics
const documentationData: DocumentationData = {
  'Getting Started': [
    { id: 'intro', title: 'Introduction to Quantum Hub', description: 'Learn the basics of the Quantum Hub platform and its capabilities.' },
    { id: 'account', title: 'Creating an Account', description: 'Step-by-step guide to setting up your Quantum Hub account.' },
    { id: 'first-app', title: 'Running Your First Quantum App', description: 'Tutorial on how to run your first quantum application on the platform.' },
    { id: 'dashboard', title: 'Navigating the Dashboard', description: 'Overview of the Quantum Hub dashboard and its features.' },
  ],
  'Quantum Programming': [
    { id: 'quantum-basics', title: 'Quantum Computing Basics', description: 'Introduction to quantum computing concepts for beginners.' },
    { id: 'circuits', title: 'Building Quantum Circuits', description: 'Learn how to create and manipulate quantum circuits using our SDK.' },
    { id: 'algorithms', title: 'Quantum Algorithms', description: 'Detailed explanations of common quantum algorithms with examples.' },
    { id: 'optimization', title: 'Circuit Optimization', description: 'Techniques to optimize your quantum circuits for better performance.' },
  ],
  'SDKs and APIs': [
    { id: 'python-sdk', title: 'Python SDK', description: 'Documentation for the Quantum Hub Python SDK with code examples.' },
    { id: 'js-sdk', title: 'JavaScript SDK', description: 'Documentation for the Quantum Hub JavaScript SDK with code examples.' },
    { id: 'rest-api', title: 'REST API Reference', description: 'Complete reference for the Quantum Hub REST API endpoints.' },
    { id: 'authentication', title: 'Authentication and Authorization', description: 'Learn how to authenticate your applications with Quantum Hub.' },
  ],
  'Hardware Access': [
    { id: 'hardware-overview', title: 'Hardware Overview', description: 'Information about the quantum hardware available on the platform.' },
    { id: 'access-models', title: 'Access Models and Pricing', description: 'Details about different access models and pricing for quantum hardware.' },
    { id: 'reservations', title: 'Reserving Compute Time', description: 'How to reserve dedicated compute time on quantum processors.' },
    { id: 'connectivity', title: 'Qubit Connectivity Maps', description: 'Connectivity maps and topology information for available quantum processors.' },
  ],
  'Marketplace': [
    { id: 'marketplace-intro', title: 'Marketplace Introduction', description: 'Overview of the Quantum Hub Marketplace and available applications.' },
    { id: 'app-submission', title: 'Submitting Your Application', description: 'Guidelines for submitting your quantum application to the marketplace.' },
    { id: 'monetization', title: 'Monetization Options', description: 'Ways to monetize your quantum applications on the platform.' },
    { id: 'app-analytics', title: 'Application Analytics', description: 'Understanding usage analytics for your marketplace applications.' },
  ],
};

export default function Documentation() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Getting Started');
  
  // Filter topics based on search query
  const filterTopics = (): DocumentationData => {
    if (!searchQuery.trim()) {
      return documentationData;
    }
    
    const filteredData: DocumentationData = {};
    
    Object.entries(documentationData).forEach(([category, topics]) => {
      const filteredTopics = topics.filter(topic => 
        topic.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        topic.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      if (filteredTopics.length > 0) {
        filteredData[category] = filteredTopics;
      }
    });
    
    return filteredData;
  };
  
  const filteredDocsData = filterTopics();
  const categories = Object.keys(filteredDocsData);

  // Icons for categories
  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'Getting Started': return BookOpenIcon;
      case 'Quantum Programming': return CodeIcon;
      case 'SDKs and APIs': return ChipIcon;
      case 'Hardware Access': return AcademicCapIcon;
      case 'Marketplace': return BookmarkIcon;
      default: return BookOpenIcon;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Documentation</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Comprehensive guides and reference materials for the Quantum Hub platform
        </p>
      </div>
      
      {/* Search box */}
      <div className="relative max-w-md mb-8">
        <input
          type="text"
          placeholder="Search documentation..."
          className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <SearchIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Categories sidebar */}
        <div className="w-full lg:w-1/4 lg:border-r lg:pr-6 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Categories</h2>
          <nav>
            <ul>
              {categories.map(category => {
                const Icon = getCategoryIcon(category);
                return (
                  <li key={category} className="mb-2">
                    <button
                      onClick={() => setActiveCategory(category)}
                      className={`flex items-center w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        activeCategory === category 
                          ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' 
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-2" />
                      <span>{category}</span>
                      <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                        {filteredDocsData[category].length}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
        
        {/* Topics content */}
        <div className="w-full lg:w-3/4">
          {categories.length > 0 ? (
            <>
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                {activeCategory}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredDocsData[activeCategory].map((topic: DocumentationTopic, index: number) => (
                  <motion.div
                    key={topic.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 * index }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
                  >
                    <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
                      {topic.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                      {topic.description}
                    </p>
                    <Link 
                      href={`/documentation/${topic.id}`}
                      className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium inline-flex items-center"
                    >
                      Read More
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                No results found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search terms or browse the categories.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 