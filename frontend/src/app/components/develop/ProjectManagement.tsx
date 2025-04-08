'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CodeIcon, 
  BeakerIcon, 
  FolderAddIcon,
  ChipIcon,
  LightningBoltIcon,
  DocumentTextIcon,
  ArrowSmRightIcon
} from '@heroicons/react/outline';

// Define project template types
interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  icon: JSX.Element;
  sampleCode: string;
  sdkType: 'qiskit' | 'cirq' | 'braket';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

// Define project interface
interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  language: 'python' | 'javascript' | 'other';
  framework: 'qiskit' | 'cirq' | 'braket' | 'pennylane' | 'other';
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  type: 'circuit' | 'algorithm' | 'quantum-model' | 'agent';
  lastOpened?: string;
  githubRepo?: string;
}

// Sample project templates
const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'bell-state',
    name: 'Bell State',
    description: 'Create a quantum entanglement between two qubits',
    icon: <ChipIcon className="h-8 w-8 text-indigo-500" />,
    difficulty: 'beginner',
    sdkType: 'qiskit',
    sampleCode: `# Bell State Preparation
from qiskit import QuantumCircuit, transpile, Aer, execute
from qiskit.visualization import plot_histogram

# Create a Quantum Circuit with 2 qubits and 2 classical bits
qc = QuantumCircuit(2, 2)

# Apply H-gate to the first qubit
qc.h(0)

# Apply CNOT with control qubit 0 and target qubit 1
qc.cx(0, 1)

# Measure both qubits
qc.measure([0, 1], [0, 1])

# Run the circuit on a simulator backend
simulator = Aer.get_backend('qasm_simulator')
compiled_circuit = transpile(qc, simulator)
result = execute(compiled_circuit, simulator, shots=1000).result()

# Get the counts and display as a histogram
counts = result.get_counts(qc)
print("Total counts:", counts)

# Draw the circuit
qc.draw('mpl')
`
  },
  {
    id: 'qft',
    name: 'Quantum Fourier Transform',
    description: 'Implementation of QFT algorithm for signal processing',
    icon: <LightningBoltIcon className="h-8 w-8 text-purple-500" />,
    difficulty: 'intermediate',
    sdkType: 'qiskit',
    sampleCode: `# Quantum Fourier Transform Implementation
from qiskit import QuantumCircuit, transpile, Aer, execute
import numpy as np
import matplotlib.pyplot as plt

# Create a function for QFT
def qft_rotations(circuit, n):
    """Apply the QFT rotations to the first n qubits"""
    if n == 0:
        return circuit
    n -= 1
    circuit.h(n)
    for qubit in range(n):
        circuit.cp(np.pi/2**(n-qubit), qubit, n)
    # Call recursively
    qft_rotations(circuit, n)
    
def swap_registers(circuit, n):
    """Swap the qubits to reverse the order"""
    for qubit in range(n//2):
        circuit.swap(qubit, n-qubit-1)
    return circuit
    
def qft(circuit, n):
    """Apply QFT to the first n qubits in the circuit"""
    qft_rotations(circuit, n)
    swap_registers(circuit, n)
    return circuit

# Create a 4-qubit QFT circuit
qc = QuantumCircuit(4)

# Prepare an interesting state
qc.x(0)
qc.x(2)

# Apply QFT
qft(qc, 4)

# Draw the circuit
qc.draw('mpl')
`
  },
  {
    id: 'shor',
    name: "Shor's Algorithm",
    description: 'Quantum algorithm for integer factorization',
    icon: <BeakerIcon className="h-8 w-8 text-green-500" />,
    difficulty: 'advanced',
    sdkType: 'qiskit',
    sampleCode: `# Shor's Algorithm (Simplified)
from qiskit import QuantumCircuit, Aer, execute, transpile
from qiskit.visualization import plot_histogram
import numpy as np
from math import gcd
from fractions import Fraction

# We'll implement a simplified version that factors 15
N = 15  # Number to be factored
a = 7   # Any number that satisfies 1 < a < N and gcd(a, N) = 1

def qft_dagger(qc, n):
    """Inverse Quantum Fourier Transform on n qubits"""
    # Swap qubits
    for qubit in range(n//2):
        qc.swap(qubit, n-qubit-1)
    # Apply the inverse QFT    
    for j in range(n):
        for m in range(j):
            qc.cp(-np.pi/float(2**(j-m)), m, j)
        qc.h(j)
    return qc

# Prepare the Quantum Circuit
counting_qubits = 8  # Number of counting qubits
qc = QuantumCircuit(counting_qubits + 4, counting_qubits)  # +4 for work qubits

# Initial State Preparation
for qubit in range(counting_qubits):
    qc.h(qubit)  # Apply Hadamard to all counting qubits
qc.x(counting_qubits + 3)  # Initialize the target qubit in state |1⟩

# Apply controlled-U operations
# (This is a simplified version)
for i in range(counting_qubits):
    angle = 2*np.pi*a**(2**i) / N
    qc.cp(angle, i, counting_qubits + 3)

# Apply inverse QFT to the counting qubits
qft_dagger(qc, counting_qubits)

# Measure the counting qubits
qc.measure(range(counting_qubits), range(counting_qubits))

# Run the circuit
simulator = Aer.get_backend('qasm_simulator')
compiled_circuit = transpile(qc, simulator)
result = execute(compiled_circuit, simulator, shots=1024).result()

# Process results to find the factors
counts = result.get_counts(qc)
print("Measurement results:", counts)

# Display the circuit
qc.draw('mpl')
`
  }
];

// Sample mock data for existing projects
const MOCK_PROJECTS: Project[] = [
  {
    id: 'proj-001',
    name: 'Bell State Experiment',
    description: 'A project to demonstrate quantum entanglement using Bell states',
    createdAt: '2023-11-15T10:30:00Z',
    updatedAt: '2023-12-03T14:20:00Z',
    language: 'python',
    framework: 'qiskit',
    tags: ['entanglement', 'qiskit', 'education'],
    status: 'draft',
    type: 'circuit',
    lastOpened: '2023-12-03T14:20:00Z',
    githubRepo: 'quantum-labs/bell-state-experiment'
  },
  {
    id: 'proj-002',
    name: 'Grover Search Implementation',
    description: 'Implementation of Grover\'s quantum search algorithm for database search',
    createdAt: '2023-10-28T09:15:00Z',
    updatedAt: '2023-12-01T11:45:00Z',
    language: 'python',
    framework: 'qiskit',
    tags: ['algorithm', 'search', 'optimization'],
    status: 'published',
    type: 'algorithm',
    lastOpened: '2023-11-29T16:30:00Z',
    githubRepo: 'quantum-labs/grover-search-implementation'
  },
  {
    id: 'proj-003',
    name: 'Quantum Fourier Demo',
    description: 'Demonstration of Quantum Fourier Transform on different input states',
    createdAt: '2023-11-02T15:20:00Z',
    updatedAt: '2023-11-30T10:10:00Z',
    language: 'python',
    framework: 'cirq',
    tags: ['fourier', 'transformation', 'cirq'],
    status: 'draft',
    type: 'circuit',
    lastOpened: '2023-11-30T10:10:00Z',
    githubRepo: 'quantum-labs/quantum-fourier-demo'
  },
  {
    id: 'proj-004',
    name: 'QAOA MaxCut Solver',
    description: 'Quantum Approximate Optimization Algorithm for solving the MaxCut problem',
    createdAt: '2023-09-15T13:40:00Z',
    updatedAt: '2023-11-20T09:30:00Z',
    language: 'python',
    framework: 'pennylane',
    tags: ['optimization', 'qaoa', 'graph-theory'],
    status: 'published',
    type: 'algorithm',
    lastOpened: '2023-11-18T11:25:00Z',
    githubRepo: 'quantum-labs/qaoa-maxcut-solver'
  },
  {
    id: 'proj-005',
    name: 'Quantum Error Correction',
    description: 'Implementation of quantum error correction codes for fault-tolerant quantum computing',
    createdAt: '2023-10-10T11:00:00Z',
    updatedAt: '2023-12-02T08:45:00Z',
    language: 'python',
    framework: 'qiskit',
    tags: ['error-correction', 'fault-tolerance', 'qiskit'],
    status: 'draft',
    type: 'circuit',
    lastOpened: '2023-12-02T08:45:00Z',
    githubRepo: 'quantum-labs/quantum-error-correction'
  }
];

export default function ProjectManagement() {
  const router = useRouter();
  
  // State for development path selection
  const [developmentPath, setDevelopmentPath] = useState<'path1' | 'path2' | 'list'>('list');
  const [step, setStep] = useState(1);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectType, setProjectType] = useState<'circuit' | 'algorithm' | 'quantum-model' | 'agent'>('circuit');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [projectNameError, setProjectNameError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [githubNameError, setGithubNameError] = useState('');
  
  // State for project list view
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'draft' | 'published'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'updated' | 'created'>('updated');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  
  // Filter and sort projects
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = selectedFilter === 'all' || project.status === selectedFilter;
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'created') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  const handlePathSelect = (path: 'path1' | 'path2') => {
    setDevelopmentPath(path);
    if (path === 'path1') {
      // Navigate directly to IDE with blank template
      router.push('/develop/vscode?template=blank');
    } else {
      setStep(2);
    }
  };
  
  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
  };
  
  const handleCreateProject = () => {
    if (projectName.trim() === '') {
      setProjectNameError('Project name is required');
      return;
    }
    
    setIsCreating(true);
    
    // In a real app, this would make an API call to create the project
    // API call would be: POST /projects with project details
    // The backend would:
    // 1. Create a GitHub repo with the project scaffolding
    // 2. Return project details including the repo URL
    // 3. Embedded VS Code would then open with the repo
    
    // Simulate API call with timeout
    setTimeout(() => {
      // Check if project with same name exists (GitHub repo name check)
      const nameExists = projects.some(p => 
        p.name.toLowerCase() === projectName.toLowerCase() || 
        p.githubRepo?.endsWith(projectName.toLowerCase().replace(/\s+/g, '-'))
      );
      
      if (nameExists) {
        setGithubNameError('A project or repository with this name already exists. Please choose a different name.');
        setIsCreating(false);
        return;
      }
      
      // Create new project
      const newProject: Project = {
        id: `proj-${Math.floor(Math.random() * 1000)}`,
        name: projectName,
        description: projectDescription,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        language: 'python',
        framework: 'qiskit',
        tags: ['new-project'],
        status: 'draft',
        type: projectType,
        githubRepo: `quantum-labs/${projectName.toLowerCase().replace(/\s+/g, '-')}`
      };
      
      setProjects([newProject, ...projects]);
      setIsCreating(false);
      
      // In a real app, this would redirect to the IDE with the repo loaded
      // For now, redirect to the IDE with the project name
      router.push(`/develop/vscode?id=${newProject.id}&name=${encodeURIComponent(newProject.name)}&repo=${encodeURIComponent(newProject.githubRepo || '')}&type=${newProject.type || 'circuit'}&new=true`);
    }, 1500);
  };

  const handleOpenInIDE = (project: Project) => {
    router.push(`/develop/vscode?id=${project.id}&name=${encodeURIComponent(project.name)}&repo=${encodeURIComponent(project.githubRepo || '')}&type=${project.type || 'circuit'}`);
  };

  const handleReleaseProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      router.push(`/develop/publish?project=${encodeURIComponent(project.name)}`);
    }
  };

  const handleDeleteProject = (projectId: string) => {
    // In a real app, this would make an API call to delete the project
    setProjects(projects.filter(p => p.id !== projectId));
    setShowDeleteConfirm(null);
  };

  const handleEditProject = (project: Project) => {
    router.push(`/develop/vscode?id=${project.id}&name=${encodeURIComponent(project.name)}&repo=${encodeURIComponent(project.githubRepo || '')}&type=${project.type || 'circuit'}&edit=true`);
  };

  const handleCreateNewProject = () => {
    setDevelopmentPath('path2');
    setStep(2);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Quantum Development</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Create, edit, and test quantum applications directly in your browser
      </p>
      
      {developmentPath === 'list' && (
        <div className="max-w-6xl mx-auto">
          {/* Project List Header with Actions */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold">Your Quantum Projects</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Manage and continue development on your quantum projects
              </p>
            </div>
            <button
              onClick={handleCreateNewProject}
              className="btn-primary inline-flex items-center"
            >
              <FolderAddIcon className="h-5 w-5 mr-2" />
              Create New Project
            </button>
          </div>
          
          {/* Search and Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Search Box */}
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Search projects by name, description, or tags"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {/* Filters */}
              <div className="flex flex-wrap gap-3">
                <div>
                  <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                  <select
                    id="status-filter"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value as 'all' | 'draft' | 'published')}
                  >
                    <option value="all">All Projects</option>
                    <option value="draft">Drafts</option>
                    <option value="published">Published</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sort by</label>
                  <select
                    id="sort-by"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'name' | 'updated' | 'created')}
                  >
                    <option value="updated">Last Updated</option>
                    <option value="created">Date Created</option>
                    <option value="name">Project Name</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          {/* Projects List */}
          {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {filteredProjects.map(project => (
                <div 
                  key={project.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Project Info */}
                    <div className="flex-grow">
                      <div className="flex items-start">
                        <div className="bg-indigo-100 dark:bg-indigo-900 p-3 rounded-lg mr-4">
                          <CodeIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{project.name}</h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                            {project.description}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {project.tags.map(tag => (
                              <span 
                                key={tag} 
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Project Metadata */}
                    <div className="flex flex-col items-end">
                      <div className="flex items-center mb-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                          ${project.status === 'published' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'}`}>
                          {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                        </span>
                        <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
                          {project.framework.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Last updated: {formatDate(project.updatedAt)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Created: {formatDate(project.createdAt)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-wrap justify-end gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => handleOpenInIDE(project)}
                      className="btn-secondary text-sm inline-flex items-center"
                    >
                      <CodeIcon className="h-4 w-4 mr-2" />
                      Open in IDE
                    </button>
                    
                    <button
                      onClick={() => handleEditProject(project)}
                      className="btn-outline text-sm inline-flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit/Configure
                    </button>
                    
                    <button
                      onClick={() => handleReleaseProject(project.id)}
                      className="btn-primary text-sm inline-flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                      </svg>
                      Release to App
                    </button>
                    
                    <button
                      onClick={() => setShowDeleteConfirm(project.id)}
                      className="btn-danger text-sm inline-flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-8 text-center">
              <div className="mx-auto w-12 h-12 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No projects found</h3>
              <p className="mt-1 text-gray-500 dark:text-gray-400">
                {searchQuery ? 'Try adjusting your search or filters.' : 'Create your first quantum project to get started.'}
              </p>
              <div className="mt-6">
                <button
                  onClick={handleCreateNewProject}
                  className="btn-primary inline-flex items-center"
                >
                  <FolderAddIcon className="h-5 w-5 mr-2" />
                  Create New Project
                </button>
              </div>
            </div>
          )}
          
          {/* Delete Confirmation Dialog */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 shadow-xl">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Project</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Are you sure you want to delete this project? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteProject(showDeleteConfirm!)}
                    className="btn-danger"
                  >
                    Delete Project
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {developmentPath === 'path2' && step === 2 && (
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold">Create New Project</h2>
            <div className="text-sm text-gray-500">Step {step} of 2</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <form onSubmit={(e) => { e.preventDefault(); handleCreateProject(); }}>
              <div className="grid grid-cols-1 gap-6 mb-6">
                <div>
                  <label htmlFor="project-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Project Name*
                  </label>
                  <input
                    type="text"
                    id="project-name"
                    value={projectName}
                    onChange={(e) => {
                      setProjectName(e.target.value);
                      if (e.target.value.trim() !== '') {
                        setProjectNameError('');
                      }
                      if (githubNameError) {
                        setGithubNameError('');
                      }
                    }}
                    className={`form-input w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white ${
                      projectNameError || githubNameError ? 'border-red-500 dark:border-red-500' : ''
                    }`}
                    placeholder="MyQuantumProject"
                  />
                  {projectNameError && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-500">{projectNameError}</p>
                  )}
                  {githubNameError && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-500">{githubNameError}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    This will also be used as your GitHub repository name
                  </p>
                </div>
                
                <div>
                  <label htmlFor="project-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Project Type*
                  </label>
                  <select
                    id="project-type"
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value as 'circuit' | 'algorithm' | 'quantum-model' | 'agent')}
                    className="form-select w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="circuit">Quantum Circuit</option>
                    <option value="algorithm">Quantum Algorithm</option>
                    <option value="quantum-model">Quantum Model</option>
                    <option value="agent">Quantum Agent</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Determines the structure and tooling of your project
                  </p>
                </div>
                
                <div>
                  <label htmlFor="project-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    id="project-description"
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    rows={3}
                    className="form-textarea w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="A brief description of your quantum project..."
                  ></textarea>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => {
                    setDevelopmentPath('list');
                    setStep(1);
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                
                <div className="flex items-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mr-4">
                    <p>Your project will be created with the standard quantum project scaffolding</p>
                  </div>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="btn-primary inline-flex items-center"
                  >
                    {isCreating ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating...
                      </>
                    ) : (
                      <>
                        <FolderAddIcon className="h-5 w-5 mr-2" />
                        Create Project
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">What happens when you create a project?</h3>
            <ol className="text-sm text-blue-700 dark:text-blue-400 list-decimal pl-4 space-y-1">
              <li>A GitHub repository with the project name will be created in your account</li>
              <li>The repository will be initialized with the standard quantum project scaffolding</li>
              <li>An integrated VS Code environment will open with your project ready for development</li>
              <li>Your project structure will follow the quantum SDK conventions for easy CLI integration</li>
            </ol>
          </div>
        </div>
      )}
      
      {developmentPath === 'path2' && step === 3 && (
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold">Choose Template</h2>
            <div className="text-sm text-gray-500">Step {step} of 3</div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Blank template option */}
            <div 
              onClick={() => handleTemplateSelect('blank')}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-md border ${
                selectedTemplate === 'blank' 
                  ? 'border-indigo-500 ring-2 ring-indigo-500 ring-opacity-50' 
                  : 'border-gray-200 dark:border-gray-700'
              } p-6 hover:shadow-lg transition-all cursor-pointer`}
            >
              <div className="text-center mb-4">
                <FolderAddIcon className="h-12 w-12 mx-auto text-gray-400" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-center">Blank Project</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Start with an empty project and build from scratch.
              </p>
              <div className="mt-4 text-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                  Custom
                </span>
              </div>
            </div>
            
            {/* Template options */}
            {PROJECT_TEMPLATES.map(template => (
              <div 
                key={template.id}
                onClick={() => handleTemplateSelect(template.id)}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-md border ${
                  selectedTemplate === template.id 
                    ? 'border-indigo-500 ring-2 ring-indigo-500 ring-opacity-50' 
                    : 'border-gray-200 dark:border-gray-700'
                } p-6 hover:shadow-lg transition-all cursor-pointer`}
              >
                <div className="text-center mb-4">
                  {template.icon}
                </div>
                <h3 className="text-lg font-bold mb-2 text-center">{template.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {template.description}
                </p>
                <div className="mt-4 text-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                    ${template.difficulty === 'beginner' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 
                      template.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
                    {template.difficulty.charAt(0).toUpperCase() + template.difficulty.slice(1)}
                  </span>
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300">
                    {template.sdkType}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => setStep(2)}
              className="btn-secondary"
            >
              Back
            </button>
            <button
              onClick={handleCreateProject}
              className="btn-primary"
              disabled={!selectedTemplate}
            >
              Create Project
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
