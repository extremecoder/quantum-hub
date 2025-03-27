'use client';

import { useState, useEffect } from 'react';
import { 
  CodeIcon, 
  BeakerIcon, 
  ChipIcon, 
  LightningBoltIcon, 
  FolderAddIcon,
  PlayIcon
} from '@heroicons/react/outline';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Import Monaco Editor dynamically to avoid SSR issues
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center">
      <div className="animate-pulse text-indigo-500 dark:text-indigo-400">
        <svg className="w-16 h-16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 6v6l4 2"></path>
        </svg>
        <p className="mt-4 text-center text-gray-500">Loading editor...</p>
      </div>
    </div>
  )
});

// Project file system interface
interface ProjectFile {
  name: string;
  language: string;
  content: string;
  modified: boolean;
}

export default function DevelopPage() {
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectType, setProjectType] = useState('circuit');
  const [projectName, setProjectName] = useState('');
  const [projectCreated, setProjectCreated] = useState(false);

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creating project:', { projectName, projectType });
    setProjectCreated(true);
  };

  if (projectCreated) {
    return <EnhancedIDEEnvironment projectName={projectName || "test-quantum-app"} projectType={projectType} />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Quantum Development</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Create, edit, and test quantum applications directly in your browser
      </p>

      {!showProjectForm ? (
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center space-x-4 mb-12">
            <button
              onClick={() => setShowProjectForm(true)}
              className="btn-primary flex items-center"
            >
              <FolderAddIcon className="h-5 w-5 mr-2" />
              Create New Project
            </button>
            <Link
              href="/develop/publish"
              className="btn-secondary flex items-center"
            >
              <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Publish Existing Project
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center">
                <CodeIcon className="h-6 w-6 mr-2 text-indigo-600 dark:text-indigo-400" />
                Recent Projects
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Continue working on your existing quantum applications
              </p>
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No recent projects found
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center">
                <BeakerIcon className="h-6 w-6 mr-2 text-indigo-600 dark:text-indigo-400" />
                Templates
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Start with pre-configured templates for common quantum algorithms
              </p>
              <ul className="space-y-2">
                <li className="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer">
                  <div className="flex items-center">
                    <ChipIcon className="h-5 w-5 mr-3 text-purple-600 dark:text-purple-400" />
                    <span className="text-gray-800 dark:text-gray-200">Quantum Fourier Transform</span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Circuit</span>
                </li>
                <li className="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer">
                  <div className="flex items-center">
                    <ChipIcon className="h-5 w-5 mr-3 text-green-600 dark:text-green-400" />
                    <span className="text-gray-800 dark:text-gray-200">Grover's Algorithm</span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Algorithm</span>
                </li>
                <li className="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer">
                  <div className="flex items-center">
                    <ChipIcon className="h-5 w-5 mr-3 text-blue-600 dark:text-blue-400" />
                    <span className="text-gray-800 dark:text-gray-200">VQE Model</span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Quantum Model</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Create New Project</h2>
          
          <form onSubmit={handleCreateProject} className="space-y-6">
            <div>
              <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Project Name
              </label>
              <input
                type="text"
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="my-quantum-app"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Project Type
              </label>
              <div className="grid grid-cols-3 gap-4 mt-2">
                <div
                  className={`flex flex-col items-center p-4 rounded-lg border cursor-pointer transition-all ${
                    projectType === 'circuit'
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-400'
                      : 'border-gray-200 hover:border-indigo-300 dark:border-gray-700 dark:hover:border-indigo-600'
                  }`}
                  onClick={() => setProjectType('circuit')}
                >
                  <ChipIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mb-2" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Circuit</span>
                  {projectType === 'circuit' && (
                    <span className="mt-2 text-xs text-indigo-600 dark:text-indigo-400">Selected</span>
                  )}
                </div>
                
                <div
                  className={`flex flex-col items-center p-4 rounded-lg border cursor-pointer transition-all ${
                    projectType === 'algorithm'
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-400'
                      : 'border-gray-200 hover:border-indigo-300 dark:border-gray-700 dark:hover:border-indigo-600'
                  }`}
                  onClick={() => setProjectType('algorithm')}
                >
                  <LightningBoltIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mb-2" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Algorithm</span>
                  {projectType === 'algorithm' && (
                    <span className="mt-2 text-xs text-indigo-600 dark:text-indigo-400">Selected</span>
                  )}
                </div>
                
                <div
                  className={`flex flex-col items-center p-4 rounded-lg border cursor-pointer transition-all ${
                    projectType === 'model'
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-400'
                      : 'border-gray-200 hover:border-indigo-300 dark:border-gray-700 dark:hover:border-indigo-600'
                  }`}
                  onClick={() => setProjectType('model')}
                >
                  <BeakerIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mb-2" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Quantum Model</span>
                  {projectType === 'model' && (
                    <span className="mt-2 text-xs text-indigo-600 dark:text-indigo-400">Selected</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setShowProjectForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
              >
                Create Project
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function EnhancedIDEEnvironment({ projectName, projectType }: { projectName: string; projectType: string }) {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [activeFile, setActiveFile] = useState<string>('');
  const [output, setOutput] = useState<{ type: string; content: string }[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showOutput, setShowOutput] = useState(true);
  const [editorTheme, setEditorTheme] = useState('vs-dark');
  const [isMaximized, setIsMaximized] = useState(false);
  
  // Generate initial files based on project type
  useEffect(() => {
    const initialFiles: ProjectFile[] = [
      {
        name: 'main.py',
        language: 'python',
        content: `# Quantum ${projectType.charAt(0).toUpperCase() + projectType.slice(1)} Example
# Project: ${projectName}

from qiskit import QuantumCircuit, transpile, assemble, Aer, execute
from qiskit.visualization import plot_histogram

# Create a Quantum Circuit
qc = QuantumCircuit(2, 2)

# Add a H gate on qubit 0
qc.h(0)

# Add a CX (CNOT) gate on control qubit 0 and target qubit 1
qc.cx(0, 1)

# Measure all qubits
qc.measure([0,1], [0,1])

# Use Aer's qasm_simulator
simulator = Aer.get_backend('qasm_simulator')

# Execute the circuit on the simulator
job = execute(qc, simulator, shots=1000)

# Grab results from the job
result = job.result()

# Returns counts
counts = result.get_counts(qc)
print("\\nTotal count for 00 and 11 are:", counts)

# Draw the circuit
qc.draw(output='mpl')
`,
        modified: false
      },
      {
        name: 'circuit.py',
        language: 'python',
        content: `from qiskit import QuantumCircuit

def create_bell_state():
    # Create a Quantum Circuit acting on the q register
    circuit = QuantumCircuit(2, 2)

    # Add a H gate on qubit 0
    circuit.h(0)
    
    # Add a CX (CNOT) gate on control qubit 0 and target qubit 1
    circuit.cx(0, 1)
    
    # Add measurement operators
    circuit.measure([0,1], [0,1])
    
    return circuit
`,
        modified: false
      },
      {
        name: 'requirements.txt',
        language: 'plaintext',
        content: `qiskit==0.42.0
matplotlib>=3.5.0
numpy>=1.21.0
scipy>=1.7.0
`,
        modified: false
      },
      {
        name: 'README.md',
        language: 'markdown',
        content: `# ${projectName}

A quantum ${projectType} project created with Quantum Hub.

## Description

This project demonstrates a simple Bell state preparation circuit, showing quantum entanglement.

## Requirements

- Python 3.8+
- Qiskit 0.42.0+

## Usage

To run this project:

\`\`\`
python main.py
\`\`\`

## Circuit Explanation

The main circuit creates a Bell state (entangled qubits) using:
1. A Hadamard gate on qubit 0
2. A CNOT gate with control qubit 0 and target qubit 1

When measured, the qubits will always be correlated - either both 0 or both 1.
`,
        modified: false
      }
    ];
    
    setFiles(initialFiles);
    setActiveFile('main.py');
  }, [projectName, projectType]);

  // Function to update file content when editing
  const handleCodeChange = (value: string | undefined) => {
    if (value === undefined) return;
    
    setFiles(prev => prev.map(file => 
      file.name === activeFile ? { ...file, content: value, modified: true } : file
    ));
  };

  // Run the quantum circuit
  const handleRunCode = () => {
    setIsRunning(true);
    setOutput([
      { type: 'info', content: 'Executing circuit...' },
      { type: 'result', content: 'Total count for 00 and 11 are: {\'00\': 497, \'11\': 503}' },
    ]);
    setShowOutput(true);
    
    // Simulate a delay in execution
    setTimeout(() => {
      setIsRunning(false);
      setOutput(prev => [
        ...prev,
        { 
          type: 'visualization', 
          content: `
      ┌───┐     ┌─┐   
q_0: |0>┤ H ├──■──┤M├───
      └───┘┌─┴─┐└╥┘┌─┐
q_1: |0>───┤ X ├─╫─┤M├
           └───┘ ║ └╥┘
c: 2/════════════╩══╩═
                 0  1 
          `
        }
      ]);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col text-gray-300 font-sans">
      {/* Top Toolbar */}
      <div className="bg-gray-800 border-b border-gray-700 p-2 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <span className="flex items-center">
            <CodeIcon className="h-5 w-5 mr-2 text-blue-400" />
            <span className="font-medium">{projectName}</span>
            <span className="mx-2 text-gray-500">|</span>
            <span className="text-gray-400 text-sm">{projectType}</span>
          </span>
          
          <div className="flex space-x-3">
            <button className="px-3 py-1 text-sm rounded hover:bg-gray-700">File</button>
            <button className="px-3 py-1 text-sm rounded hover:bg-gray-700">Edit</button>
            <button className="px-3 py-1 text-sm rounded hover:bg-gray-700">View</button>
            <button className="px-3 py-1 text-sm rounded hover:bg-gray-700" onClick={handleRunCode}>Run</button>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            className={`${isRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white px-3 py-1 rounded text-sm flex items-center`}
            onClick={handleRunCode}
            disabled={isRunning}
          >
            {isRunning ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Running...
              </>
            ) : (
              <>
                <PlayIcon className="h-4 w-4 mr-1" />
                Run
              </>
            )}
          </button>
          <button 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm"
            onClick={() => setIsMaximized(!isMaximized)}
          >
            {isMaximized ? 'Restore' : 'Maximize Editor'}
          </button>
          <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white">
            Exit Editor
          </Link>
        </div>
      </div>
      
      <div className="flex-1 flex overflow-hidden">
        {/* File Explorer - Hide when maximized */}
        {!isMaximized && (
          <div className="w-64 bg-gray-800 flex flex-col border-r border-gray-700">
            <div className="p-2 flex justify-between items-center border-b border-gray-700">
              <span className="text-sm font-medium uppercase text-gray-400">Explorer</span>
              <button className="p-1 rounded hover:bg-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
            
            <div className="p-2 flex-1 overflow-y-auto">
              <div className="mb-2">
                <div className="flex items-center mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  <span className="text-sm text-gray-300">{projectName}</span>
                </div>
                
                <div className="ml-4 space-y-1">
                  {files.map((file) => (
                    <div 
                      key={file.name}
                      className={`flex items-center py-1 px-2 rounded cursor-pointer ${
                        activeFile === file.name 
                          ? 'bg-blue-800 bg-opacity-30 text-blue-300' 
                          : 'hover:bg-gray-700 text-gray-300'
                      }`}
                      onClick={() => setActiveFile(file.name)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-1 ${activeFile === file.name ? 'text-blue-400' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-sm flex items-center">
                        {file.name}
                        {file.modified && <span className="ml-1 text-xs">●</span>}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Bottom sidebar sections */}
            <div className="border-t border-gray-700">
              <button 
                className={`w-full p-2 text-left text-sm flex items-center hover:bg-gray-700 ${showOutput ? 'bg-gray-700' : ''}`}
                onClick={() => setShowOutput(!showOutput)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Output
              </button>
              <button className="w-full p-2 text-left text-sm flex items-center hover:bg-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search
              </button>
              <button className="w-full p-2 text-left text-sm flex items-center hover:bg-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Extensions
              </button>
            </div>
          </div>
        )}
        
        {/* Main Editor + Output Area */}
        <div className="flex-1 flex flex-col">
          {/* Editor Tabs */}
          <div className="bg-gray-800 border-b border-gray-700 flex">
            {files.map((file) => (
              <div 
                key={file.name}
                className={`px-4 py-2 flex items-center border-r border-gray-700 cursor-pointer ${
                  activeFile === file.name ? 'bg-gray-900 text-gray-300' : 'text-gray-500 hover:bg-gray-750'
                }`}
                onClick={() => setActiveFile(file.name)}
              >
                <span className="text-sm">{file.name}</span>
                {file.modified && <span className="ml-1 text-xs">●</span>}
                <button className="ml-2 p-1 rounded-full hover:bg-gray-700 focus:outline-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          
          {/* Split View: Editor and Output */}
          <div className={`flex-1 flex ${showOutput ? 'flex-col' : ''}`}>
            {/* Monaco Editor */}
            <div className={`${showOutput ? 'h-3/5' : 'flex-1'} overflow-hidden`}>
              {activeFile && (
                <MonacoEditor
                  height="100%"
                  language={files.find(f => f.name === activeFile)?.language || 'plaintext'}
                  theme={editorTheme}
                  value={files.find(f => f.name === activeFile)?.content || ''}
                  onChange={handleCodeChange}
                  options={{
                    minimap: { enabled: true },
                    scrollBeyondLastLine: false,
                    fontSize: 14,
                    wordWrap: 'on',
                    automaticLayout: true,
                    tabSize: 4,
                    suggest: {
                      showClasses: true,
                      showFunctions: true,
                      showVariables: true,
                    }
                  }}
                />
              )}
            </div>
            
            {/* Output Panel */}
            {showOutput && (
              <div className="h-2/5 border-t border-gray-700 flex flex-col">
                <div className="bg-gray-800 p-2 flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-400">Output</span>
                  <button 
                    className="text-gray-400 hover:text-white"
                    onClick={() => setShowOutput(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="flex-1 bg-gray-900 p-3 overflow-y-auto font-mono text-sm">
                  {output.map((line, index) => (
                    <div key={index} className="mb-3">
                      {line.type === 'info' && (
                        <div className="text-green-400">{line.content}</div>
                      )}
                      {line.type === 'result' && (
                        <div className="text-white">{line.content}</div>
                      )}
                      {line.type === 'visualization' && (
                        <div>
                          <div className="text-gray-400 mb-1">-- Circuit Visualization --</div>
                          <pre className="bg-gray-800 p-2 rounded text-gray-300 overflow-x-auto">
                            {line.content}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {output.length > 0 && (
                    <div className="mt-4">
                      <div className="text-gray-400 mb-1">-- Histogram --</div>
                      <div className="bg-gray-800 p-3 rounded">
                        <div className="flex items-end h-32 justify-center">
                          <div className="flex flex-col items-center mx-4">
                            <div className="w-16 bg-blue-500" style={{height: '48%'}}></div>
                            <div className="text-xs mt-1 text-gray-300">00: 497</div>
                          </div>
                          <div className="flex flex-col items-center mx-4">
                            <div className="w-16 bg-blue-500" style={{height: '50%'}}></div>
                            <div className="text-xs mt-1 text-gray-300">11: 503</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Status Bar */}
      <div className="bg-blue-600 text-white px-4 py-1 text-xs flex justify-between">
        <div className="flex space-x-4">
          <span>{isRunning ? 'Running...' : 'Ready'}</span>
          <span>{activeFile}</span>
        </div>
        <div className="flex space-x-4">
          <span>Python</span>
          <span>Qiskit 0.42.0</span>
          <button 
            className="hover:text-blue-200"
            onClick={() => setEditorTheme(editorTheme === 'vs-dark' ? 'light' : 'vs-dark')}
          >
            {editorTheme === 'vs-dark' ? 'Light Theme' : 'Dark Theme'}
          </button>
        </div>
      </div>
    </div>
  );
} 