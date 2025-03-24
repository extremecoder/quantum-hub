'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChipIcon, ClockIcon, DesktopComputerIcon, BeakerIcon } from '@heroicons/react/outline';

// Mock data for quantum hardware
const quantumHardware = [
  {
    id: 'superconducting-20',
    name: 'Superconducting 20Q',
    type: 'Superconducting',
    qubits: 20,
    quantumVolume: 32,
    availability: 'Available Now',
    description: 'A 20-qubit superconducting quantum processor with low error rates and high coherence times.',
    provider: 'Quantum Labs',
    location: 'North America',
    features: ['Multi-qubit gates', 'Low decoherence', 'Cloud access'],
    imageUrl: '/images/superconducting.png',
    status: 'Online',
  },
  {
    id: 'ion-trap-11',
    name: 'Ion Trap 11Q',
    type: 'Trapped Ion',
    qubits: 11,
    quantumVolume: 28,
    availability: 'Available Now',
    description: 'An 11-qubit trapped ion quantum processor featuring all-to-all connectivity and high fidelity gates.',
    provider: 'IonQ Systems',
    location: 'Europe',
    features: ['All-to-all connectivity', 'Long coherence times', 'High fidelity gates'],
    imageUrl: '/images/ion-trap.png',
    status: 'Online',
  },
  {
    id: 'photonic-8',
    name: 'Photonic 8Q',
    type: 'Photonic',
    qubits: 8,
    quantumVolume: 16,
    availability: 'Available Now',
    description: 'An 8-qubit photonic quantum processor ideal for quantum communication and networking applications.',
    provider: 'Photon Quantum',
    location: 'Asia',
    features: ['Room temperature operation', 'Quantum networking', 'Low loss rates'],
    imageUrl: '/images/photonic.png',
    status: 'Maintenance',
  },
  {
    id: 'silicon-spin-4',
    name: 'Silicon Spin 4Q',
    type: 'Silicon Spin',
    qubits: 4,
    quantumVolume: 8,
    availability: 'Available Now',
    description: 'A 4-qubit silicon spin quantum processor with potential for scaling to thousands of qubits.',
    provider: 'Silicon Quantum',
    location: 'Australia',
    features: ['CMOS compatible', 'Long coherence', 'Scalable architecture'],
    imageUrl: '/images/silicon-spin.png',
    status: 'Online',
  },
  {
    id: 'superconducting-65',
    name: 'Superconducting 65Q',
    type: 'Superconducting',
    qubits: 65,
    quantumVolume: 64,
    availability: 'Coming Soon',
    description: 'Our next-generation 65-qubit superconducting processor featuring improved connectivity and reduced crosstalk.',
    provider: 'Quantum Labs',
    location: 'North America',
    features: ['Enhanced connectivity', 'Reduced crosstalk', 'Higher coherence times'],
    imageUrl: '/images/superconducting-advanced.png',
    status: 'Testing',
  },
  {
    id: 'topological-12',
    name: 'Topological 12Q',
    type: 'Topological',
    qubits: 12,
    quantumVolume: 24,
    availability: 'Research',
    description: 'A research-grade 12-qubit topological quantum processor with inherent error correction capabilities.',
    provider: 'Topology Quantum',
    location: 'Europe',
    features: ['Error protection', 'Topological encoding', 'Research access'],
    imageUrl: '/images/topological.png',
    status: 'Research',
  },
];

// Filter options
const hardwareTypes = ["All", "Superconducting", "Trapped Ion", "Photonic", "Silicon Spin", "Topological"];
const availabilityOptions = ["All", "Available Now", "Coming Soon", "Research"];
const statusOptions = ["All", "Online", "Maintenance", "Testing", "Research"];

export default function Hardware() {
  const [selectedType, setSelectedType] = useState('All');
  const [selectedAvailability, setSelectedAvailability] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  
  // Filter hardware based on selections
  const filteredHardware = quantumHardware.filter(hw => {
    const matchesType = selectedType === 'All' || hw.type === selectedType;
    const matchesAvailability = selectedAvailability === 'All' || hw.availability === selectedAvailability;
    const matchesStatus = selectedStatus === 'All' || hw.status === selectedStatus;
    return matchesType && matchesAvailability && matchesStatus;
  });
  
  // Helper function for status badge color
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Online': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Maintenance': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Testing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Research': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Quantum Hardware</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Access cutting-edge quantum processors for your applications
        </p>
      </div>
      
      {/* Filter bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <select 
          className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          <option value="" disabled>Hardware Type</option>
          {hardwareTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        
        <select 
          className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          value={selectedAvailability}
          onChange={(e) => setSelectedAvailability(e.target.value)}
        >
          <option value="" disabled>Availability</option>
          {availabilityOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        
        <select 
          className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="" disabled>Status</option>
          {statusOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>
      
      {/* Hardware cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredHardware.map((hardware, index) => (
          <motion.div
            key={hardware.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 * index }}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    {hardware.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {hardware.provider} • {hardware.location}
                  </p>
                </div>
                <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(hardware.status)}`}>
                  {hardware.status}
                </span>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {hardware.description}
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center">
                  <ChipIcon className="h-5 w-5 text-indigo-500 mr-2" />
                  <span className="text-sm"><strong>Qubits:</strong> {hardware.qubits}</span>
                </div>
                <div className="flex items-center">
                  <DesktopComputerIcon className="h-5 w-5 text-indigo-500 mr-2" />
                  <span className="text-sm"><strong>Type:</strong> {hardware.type}</span>
                </div>
                <div className="flex items-center">
                  <BeakerIcon className="h-5 w-5 text-indigo-500 mr-2" />
                  <span className="text-sm"><strong>Quantum Volume:</strong> {hardware.quantumVolume}</span>
                </div>
                <div className="flex items-center">
                  <ClockIcon className="h-5 w-5 text-indigo-500 mr-2" />
                  <span className="text-sm"><strong>Availability:</strong> {hardware.availability}</span>
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="font-medium mb-2 text-gray-900 dark:text-white">Features:</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400">
                  {hardware.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center mb-1">
                      <span className="mr-2 text-indigo-500">•</span> {feature}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="flex justify-end">
                <Link 
                  href={`/hardware/${hardware.id}`}
                  className="btn-primary"
                >
                  View Details
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 