'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeftIcon, 
  DownloadIcon, 
  CodeIcon, 
  DocumentTextIcon, 
  ClipboardIcon,
  ChartBarIcon,
  TagIcon,
  ChipIcon,
  UserIcon,
  ClockIcon,
  StarIcon
} from '@heroicons/react/outline';

// Mock data for registry circuits (simplified version of the data in registry/page.tsx)
const registryCircuits = [
  {
    id: 'bellstate-gen',
    name: 'Bell State Generator',
    description: 'A simple quantum circuit that generates the Bell state, demonstrating quantum entanglement.',
    longDescription: `
    # Bell State Generator
    
    The Bell state is one of the simplest examples of quantum entanglement. This circuit creates a Bell state (also known as an EPR pair) using two qubits.
    
    ## How It Works
    
    1. Start with two qubits in the |0⟩ state
    2. Apply a Hadamard gate to the first qubit, creating a superposition
    3. Apply a CNOT gate with the first qubit as control and the second as target
    4. The result is the Bell state: (|00⟩ + |11⟩)/√2
    
    ## Applications
    
    - Quantum teleportation
    - Superdense coding
    - Quantum key distribution
    - Fundamental experiments in quantum mechanics
    
    ## Code Quality
    
    This implementation uses minimal gates and is optimized for clarity and educational purposes.
    `,
    tags: ['entanglement', 'educational', 'basic'],
    author: 'Quantum Labs',
    authorProfile: '/users/quantum-labs',
    version: '1.2.0',
    downloads: 3245,
    lastUpdated: '2023-03-15',
    license: 'MIT',
    language: 'Python',
    stars: 87,
    dependencies: ['qiskit>=0.39.0', 'matplotlib>=3.5.0', 'numpy>=1.20.0'],
    qubits: 2,
    depth: 2,
    gates: ['H', 'CNOT'],
    sampleCode: `
    # Bell State Generator
    from qiskit import QuantumCircuit, Aer, execute
    from qiskit.visualization import plot_histogram, plot_bloch_multivector
    import matplotlib.pyplot as plt
    import numpy as np
    
    # Create a quantum circuit with 2 qubits and 2 classical bits
    qc = QuantumCircuit(2, 2)
    
    # Step 1: Apply Hadamard gate to the first qubit
    qc.h(0)
    
    # Step 2: Apply CNOT gate with control=qubit 0 and target=qubit 1
    qc.cx(0, 1)
    
    # Optional: Measure both qubits
    qc.measure([0, 1], [0, 1])
    
    # Draw the circuit
    print("Bell State Circuit:")
    print(qc.draw())
    
    # Simulate the circuit
    simulator = Aer.get_backend('qasm_simulator')
    result = execute(qc, simulator, shots=1024).result()
    counts = result.get_counts(qc)
    
    # Plot the results
    plot_histogram(counts)
    plt.title('Bell State Measurement Results')
    plt.show()
    `
  },
  {
    id: 'qft-8qubit',
    name: 'Quantum Fourier Transform (8-qubit)',
    description: 'Implementation of the Quantum Fourier Transform algorithm for 8 qubits with optimized gate sequence.',
    longDescription: `
    # Quantum Fourier Transform (8-qubit)
    
    A highly optimized implementation of the Quantum Fourier Transform for 8 qubits.
    
    ## Technical Details
    
    The Quantum Fourier Transform (QFT) is a linear transformation on quantum bits and is the quantum analogue of the discrete Fourier transform. It is a key component in many quantum algorithms, most notably Shor's factoring algorithm and quantum phase estimation.
    
    This implementation uses a recursive approach to build the QFT circuit and includes gate decomposition techniques to minimize the gate count.
    
    ## Performance
    
    - Efficient gate sequence with optimization for depth
    - Gate cancellation for improved fidelity
    - Parameterized implementation allows for easy adaptation
    
    ## Applications
    
    - Core component for Shor's algorithm
    - Quantum phase estimation
    - Quantum signal processing
    - Hidden subgroup problems
    `,
    tags: ['algorithm', 'fourier', 'optimization'],
    author: 'QFT Research',
    authorProfile: '/users/qft-research',
    version: '2.1.3',
    downloads: 1876,
    lastUpdated: '2023-02-22',
    license: 'Apache-2.0',
    language: 'Qiskit',
    stars: 134,
    dependencies: ['qiskit>=0.39.0', 'numpy>=1.20.0', 'scipy>=1.7.0'],
    qubits: 8,
    depth: 36,
    gates: ['H', 'CPHASE', 'SWAP'],
    sampleCode: `
    # Quantum Fourier Transform (8-qubit)
    from qiskit import QuantumCircuit
    import numpy as np
    
    def qft_rotations(circuit, n):
        """Perform QFT rotations for first n qubits in circuit."""
        if n == 0:
            return circuit
        n -= 1
        circuit.h(n)
        for qubit in range(n):
            circuit.cp(np.pi/2**(n-qubit), qubit, n)
        qft_rotations(circuit, n)
        
    def swap_registers(circuit, n):
        """Swap the qubits to reverse the order."""
        for qubit in range(n//2):
            circuit.swap(qubit, n-qubit-1)
        return circuit
    
    def qft(circuit, n):
        """Apply QFT to first n qubits in circuit."""
        qft_rotations(circuit, n)
        swap_registers(circuit, n)
        return circuit
    
    # Create a quantum circuit with 8 qubits
    qc = QuantumCircuit(8)
    
    # Prepare a state to apply QFT to (here just setting qubits 0 and 4 to |1⟩)
    qc.x(0)
    qc.x(4)
    
    # Apply QFT
    qft(qc, 8)
    
    # Draw the circuit
    print(qc.draw())
    `
  },
  {
    id: 'grover-oracle',
    name: 'Grover Oracle Generator',
    description: 'Utility for automatically generating optimized oracle circuits for Grover\'s algorithm based on input criteria.',
    tags: ['search', 'oracle', 'utility'],
    author: 'Search Quantum',
    authorProfile: '/users/search-quantum',
    version: '0.9.5',
    downloads: 2103,
    lastUpdated: '2023-04-01',
    license: 'GPL-3.0',
    language: 'Q#',
    stars: 56,
    dependencies: ['.NET SDK >= 6.0', 'Microsoft.Quantum.Development.Kit >= 0.25.0'],
    qubits: 'Variable',
    depth: 'Variable',
    gates: ['X', 'CNOT', 'Multi-controlled-Z'],
    longDescription: 'A detailed description of the Grover Oracle Generator.',
    sampleCode: '// Sample code for Grover Oracle Generator'
  },
];

export default function CircuitDetails() {
  const router = useRouter();
  const params = useParams();
  const [circuit, setCircuit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'readme' | 'code' | 'dependencies'>('readme');
  
  useEffect(() => {
    // In a real app, this would be an API call
    const circuitId = params.id;
    const foundCircuit = registryCircuits.find(c => c.id === circuitId);
    
    if (foundCircuit) {
      setCircuit(foundCircuit);
    }
    setLoading(false);
  }, [params.id]);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(circuit.sampleCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse flex flex-col space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }
  
  if (!circuit) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg">
          <h2 className="text-xl font-bold text-red-800 dark:text-red-200">Circuit Not Found</h2>
          <p className="text-red-700 dark:text-red-300">
            The circuit you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/registry" className="mt-4 inline-block text-indigo-600 dark:text-indigo-400 hover:underline">
            Return to Registry
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/registry" className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 inline-flex items-center">
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Registry
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {circuit.name}
              </h1>
              
              <div className="flex items-center text-gray-500 dark:text-gray-400 mb-4">
                <Link href={circuit.authorProfile} className="flex items-center hover:text-indigo-600 dark:hover:text-indigo-400">
                  <UserIcon className="h-4 w-4 mr-1" />
                  {circuit.author}
                </Link>
                <span className="mx-2">•</span>
                <span className="flex items-center">
                  <TagIcon className="h-4 w-4 mr-1" />
                  v{circuit.version}
                </span>
                <span className="mx-2">•</span>
                <span>{circuit.license}</span>
                <span className="mx-2">•</span>
                <span className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  Updated {circuit.lastUpdated}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {circuit.tags && circuit.tags.map((tag: string) => (
                  <span 
                    key={tag} 
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {circuit.description}
              </p>
              
              {/* Tabs */}
              <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('readme')}
                    className={`${
                      activeTab === 'readme'
                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    <DocumentTextIcon className="h-5 w-5 mr-2 inline" />
                    README
                  </button>
                  <button
                    onClick={() => setActiveTab('code')}
                    className={`${
                      activeTab === 'code'
                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    <CodeIcon className="h-5 w-5 mr-2 inline" />
                    Sample Code
                  </button>
                  <button
                    onClick={() => setActiveTab('dependencies')}
                    className={`${
                      activeTab === 'dependencies'
                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    <ChipIcon className="h-5 w-5 mr-2 inline" />
                    Dependencies
                  </button>
                </nav>
              </div>
              
              {/* Tab Content */}
              {activeTab === 'readme' && (
                <div className="prose dark:prose-invert max-w-none">
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: circuit.longDescription ? 
                        circuit.longDescription.replace(/^.*?#/m, '<h1>')
                          .replace(/\n## /g, '</h1><h2>')
                          .replace(/\n- /g, '</p><ul><li>')
                          .replace(/\n\n/g, '</p><p>')
                          .replace(/\n/g, '<br />') + '</p>' 
                        : '<p>No detailed description available.</p>' 
                    }} 
                  />
                </div>
              )}
              
              {activeTab === 'code' && (
                <div>
                  <div className="flex justify-between mb-2">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Example implementation in {circuit.language}
                    </div>
                    <button 
                      onClick={copyToClipboard}
                      className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center"
                    >
                      <ClipboardIcon className="h-4 w-4 mr-1" />
                      {copied ? 'Copied!' : 'Copy code'}
                    </button>
                  </div>
                  <div className="bg-gray-900 rounded-md p-4 overflow-x-auto">
                    <pre className="text-gray-300 text-sm font-mono">
                      {circuit.sampleCode || 'No sample code available.'}
                    </pre>
                  </div>
                </div>
              )}
              
              {activeTab === 'dependencies' && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Required Dependencies</h3>
                  {circuit.dependencies && circuit.dependencies.length > 0 ? (
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                      {circuit.dependencies.map((dep: string, index: number) => (
                        <li key={index} className="py-3 flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400 font-mono text-sm">{dep}</span>
                          <span className="text-gray-500 dark:text-gray-500 text-sm">Required</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400">No dependencies specified.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Metrics Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Circuit Metrics</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center">
                <div className="p-2 rounded-md bg-green-100 dark:bg-green-900 mr-3">
                  <DownloadIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <span className="block text-sm text-gray-500 dark:text-gray-400">Downloads</span>
                  <span className="block text-lg font-bold text-gray-900 dark:text-white">{circuit.downloads.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="p-2 rounded-md bg-yellow-100 dark:bg-yellow-900 mr-3">
                  <StarIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <span className="block text-sm text-gray-500 dark:text-gray-400">Stars</span>
                  <span className="block text-lg font-bold text-gray-900 dark:text-white">{circuit.stars}</span>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="p-2 rounded-md bg-indigo-100 dark:bg-indigo-900 mr-3">
                  <ChipIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <span className="block text-sm text-gray-500 dark:text-gray-400">Qubits</span>
                  <span className="block text-lg font-bold text-gray-900 dark:text-white">{circuit.qubits}</span>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="p-2 rounded-md bg-purple-100 dark:bg-purple-900 mr-3">
                  <ChartBarIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <span className="block text-sm text-gray-500 dark:text-gray-400">Circuit Depth</span>
                  <span className="block text-lg font-bold text-gray-900 dark:text-white">{circuit.depth}</span>
                </div>
              </div>
            </div>
            
            {/* Gates */}
            {circuit.gates && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gate Set</h4>
                <div className="flex flex-wrap gap-2">
                  {circuit.gates.map((gate: string, index: number) => (
                    <span 
                      key={index} 
                      className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    >
                      {gate}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Actions Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex flex-col space-y-4">
              <Link 
                href={`/registry/${circuit.id}/download`}
                className="btn-primary w-full flex justify-center items-center"
              >
                <DownloadIcon className="h-5 w-5 mr-2" />
                Download
              </Link>
              
              <Link 
                href={`/develop/ide?template=${circuit.id}`}
                className="btn-secondary w-full flex justify-center items-center"
              >
                <CodeIcon className="h-5 w-5 mr-2" />
                Open in IDE
              </Link>
              
              <button 
                className="btn text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 w-full flex justify-center items-center hover:bg-gray-50 dark:hover:bg-gray-750"
                onClick={() => alert('Feature coming soon!')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                Star
              </button>
            </div>
          </div>
          
          {/* License Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">License</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              This circuit is available under the <span className="font-bold">{circuit.license}</span> license.
            </p>
            <Link 
              href={`https://opensource.org/licenses/${circuit.license}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              View license details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
