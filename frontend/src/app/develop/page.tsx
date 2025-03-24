'use client';

import { useState } from 'react';
import { 
  CodeIcon, 
  BeakerIcon, 
  ChipIcon, 
  LightningBoltIcon, 
  FolderAddIcon,
  PlayIcon
} from '@heroicons/react/outline';
import Link from 'next/link';

export default function DevelopPage() {
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectType, setProjectType] = useState('circuit');
  const [projectName, setProjectName] = useState('');
  const [projectCreated, setProjectCreated] = useState(false);

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    // Here we would handle the actual project creation
    console.log('Creating project:', { projectName, projectType });
    
    // Force set to true regardless of validation for demo purposes
    setProjectCreated(true);
    console.log('Project created state set to true');
  };

  if (projectCreated) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col text-gray-300 font-sans">
        {/* VSCode-like Header */}
        <div className="bg-gray-800 border-b border-gray-700 p-2 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <CodeIcon className="h-5 w-5 mr-2 text-blue-400" />
              <span className="font-medium">{projectName || "test-quantum-app"}</span>
              <span className="mx-2 text-gray-500">|</span>
              <span className="text-gray-400 text-sm">{projectType}</span>
            </span>
            
            <div className="flex space-x-1">
              <button className="px-3 py-1 text-sm rounded hover:bg-gray-700">File</button>
              <button className="px-3 py-1 text-sm rounded hover:bg-gray-700">Edit</button>
              <button className="px-3 py-1 text-sm rounded hover:bg-gray-700">View</button>
              <button className="px-3 py-1 text-sm rounded hover:bg-gray-700">Run</button>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center">
              <PlayIcon className="h-4 w-4 mr-1" />
              Run
            </button>
            <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white">
              Exit Editor
            </Link>
          </div>
        </div>
        
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Explorer */}
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
                  <span className="text-sm text-gray-300">Project Files</span>
                </div>
                
                <div className="ml-4 space-y-1">
                  <div className="flex items-center py-1 px-2 rounded bg-blue-800 bg-opacity-30 text-blue-300 cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm">main.py</span>
                  </div>
                  
                  <div className="flex items-center py-1 px-2 rounded hover:bg-gray-700 cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm">circuit.py</span>
                  </div>
                  
                  <div className="flex items-center py-1 px-2 rounded hover:bg-gray-700 cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm">requirements.txt</span>
                  </div>
                  
                  <div className="flex items-center py-1 px-2 rounded hover:bg-gray-700 cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm">README.md</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Bottom sidebar sections */}
            <div className="border-t border-gray-700">
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
          
          {/* Main Editor Area */}
          <div className="flex-1 flex flex-col">
            {/* Tabs Bar */}
            <div className="bg-gray-800 border-b border-gray-700 flex">
              <div className="px-4 py-2 bg-gray-900 text-gray-300 border-r border-gray-700 flex items-center">
                <span className="text-sm">main.py</span>
                <button className="ml-2 p-1 rounded-full hover:bg-gray-700 focus:outline-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Editor Content */}
            <div className="flex-1 overflow-auto bg-gray-900 p-0">
              <div className="py-2 pl-2 flex">
                {/* Line Numbers */}
                <div className="text-right pr-4 select-none text-gray-500 font-mono text-sm">
                  {Array.from({ length: 30 }, (_, i) => (
                    <div key={i+1} className="h-6 leading-6">{i+1}</div>
                  ))}
                </div>
                
                {/* Code Content */}
                <div className="flex-1 font-mono text-sm text-gray-300">
                  <div className="h-6 leading-6 text-blue-400"># Quantum {projectType.charAt(0).toUpperCase() + projectType.slice(1)} Example</div>
                  <div className="h-6 leading-6 text-blue-400"># Project: {projectName || "quantum-project"}</div>
                  <div className="h-6 leading-6 text-gray-300">&nbsp;</div>
                  <div className="h-6 leading-6"><span className="text-purple-400">from</span> <span className="text-cyan-300">qiskit</span> <span className="text-purple-400">import</span> QuantumCircuit, transpile, assemble, Aer, execute</div>
                  <div className="h-6 leading-6"><span className="text-purple-400">from</span> <span className="text-cyan-300">qiskit.visualization</span> <span className="text-purple-400">import</span> plot_histogram</div>
                  <div className="h-6 leading-6 text-gray-300">&nbsp;</div>
                  <div className="h-6 leading-6 text-blue-400"># Create a Quantum Circuit</div>
                  <div className="h-6 leading-6">qc = QuantumCircuit(2, 2)</div>
                  <div className="h-6 leading-6 text-gray-300">&nbsp;</div>
                  <div className="h-6 leading-6 text-blue-400"># Add a H gate on qubit 0</div>
                  <div className="h-6 leading-6">qc.h(0)</div>
                  <div className="h-6 leading-6 text-gray-300">&nbsp;</div>
                  <div className="h-6 leading-6 text-blue-400"># Add a CX (CNOT) gate on control qubit 0 and target qubit 1</div>
                  <div className="h-6 leading-6">qc.cx(0, 1)</div>
                  <div className="h-6 leading-6 text-gray-300">&nbsp;</div>
                  <div className="h-6 leading-6 text-blue-400"># Measure all qubits</div>
                  <div className="h-6 leading-6">qc.measure([0,1], [0,1])</div>
                  <div className="h-6 leading-6 text-gray-300">&nbsp;</div>
                  <div className="h-6 leading-6 text-blue-400"># Use Aer's qasm_simulator</div>
                  <div className="h-6 leading-6">simulator = Aer.get_backend(<span className="text-yellow-300">'qasm_simulator'</span>)</div>
                  <div className="h-6 leading-6 text-gray-300">&nbsp;</div>
                  <div className="h-6 leading-6 text-blue-400"># Execute the circuit on the simulator</div>
                  <div className="h-6 leading-6">job = execute(qc, simulator, shots=1000)</div>
                  <div className="h-6 leading-6 text-gray-300">&nbsp;</div>
                  <div className="h-6 leading-6 text-blue-400"># Grab results from the job</div>
                  <div className="h-6 leading-6">result = job.result()</div>
                  <div className="h-6 leading-6 text-gray-300">&nbsp;</div>
                  <div className="h-6 leading-6 text-blue-400"># Returns counts</div>
                  <div className="h-6 leading-6">counts = result.get_counts(qc)</div>
                  <div className="h-6 leading-6"><span className="text-gray-300">print(</span><span className="text-yellow-300">"\nTotal count for 00 and 11 are:"</span><span className="text-gray-300">,counts)</span></div>
                  <div className="h-6 leading-6 text-gray-300">&nbsp;</div>
                  <div className="h-6 leading-6 text-blue-400"># Draw the circuit</div>
                  <div className="h-6 leading-6">qc.draw(output=<span className="text-yellow-300">'mpl'</span>)</div>
                  <div className="h-6 leading-6 text-gray-300">&nbsp;</div>
                  {/* Additional empty lines for scrolling */}
                  {Array.from({ length: 10 }, (_, i) => (
                    <div key={i+30} className="h-6 leading-6">&nbsp;</div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Bottom Panel */}
            <div className="bg-gray-800 border-t border-gray-700 p-2 flex justify-between items-center">
              <div className="flex space-x-4 text-sm text-gray-400">
                <span>Python 3.9.0</span>
                <span>|</span>
                <span>Qiskit 0.36.1</span>
                <span>|</span>
                <span>Line 21, Col 15</span>
              </div>
              
              <div className="flex space-x-4 text-sm">
                <button className="text-blue-400 hover:text-blue-300">Terminal</button>
                <button className="text-blue-400 hover:text-blue-300">Problems</button>
                <button className="text-blue-400 hover:text-blue-300">Output</button>
              </div>
            </div>
          </div>
          
          {/* Right Sidebar - Preview/Output */}
          <div className="w-64 bg-gray-800 border-l border-gray-700 flex flex-col">
            <div className="p-2 border-b border-gray-700">
              <span className="text-sm font-medium uppercase text-gray-400">Output</span>
            </div>
            
            <div className="flex-1 p-2 overflow-y-auto">
              <div className="text-sm">
                <div className="text-green-400">Executing circuit...</div>
                <div className="mt-1">
                  Total count for 00 and 11 are: {'{'}'00': 497, '11': 503{'}'}
                </div>
                <div className="mt-2">
                  <div className="text-gray-400">-- Circuit Visualization --</div>
                  <div className="bg-gray-900 border border-gray-700 p-2 mt-1 text-gray-300 text-xs">
                    <pre>
                      {`      ┌───┐     ┌─┐   
q_0: |0>┤ H ├──■──┤M├───
      └───┘┌─┴─┐└╥┘┌─┐
q_1: |0>───┤ X ├─╫─┤M├
           └───┘ ║ └╥┘
c: 2/════════════╩══╩═
                 0  1 `}
                    </pre>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-gray-400">-- Histogram --</div>
                  <div className="bg-gray-900 border border-gray-700 p-2 mt-1 flex justify-center">
                    <div className="flex items-end h-20 space-x-4">
                      <div className="flex flex-col items-center">
                        <div className="w-8 bg-blue-500" style={{height: '50%'}}></div>
                        <div className="text-xs mt-1">00</div>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-8 bg-blue-500" style={{height: '50%'}}></div>
                        <div className="text-xs mt-1">11</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Status Bar */}
        <div className="bg-blue-600 text-white px-4 py-1 text-xs flex justify-between">
          <div className="flex space-x-4">
            <span>Ready</span>
            <span>Ln 21, Col 15</span>
          </div>
          <div className="flex space-x-4">
            <span>UTF-8</span>
            <span>Python</span>
            <span>Spaces: 4</span>
          </div>
        </div>
      </div>
    );
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

function EmbeddedIDE({ projectName, projectType }: { projectName: string; projectType: string }) {
  const [selectedFile, setSelectedFile] = useState('main.py');
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate loading the editor
  setTimeout(() => {
    setIsLoading(false);
  }, 1500);

  const files = [
    { name: 'main.py', type: 'python' },
    { name: 'circuit.py', type: 'python' },
    { name: 'requirements.txt', type: 'text' },
    { name: 'README.md', type: 'markdown' },
  ];

  const fileContent = `# Quantum ${projectType.charAt(0).toUpperCase() + projectType.slice(1)} Example
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
print("\\nTotal count for 00 and 11 are:",counts)

# Draw the circuit
qc.draw(output='mpl')
`;

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-gray-800 text-white p-2 flex justify-between items-center">
        <div className="flex items-center">
          <CodeIcon className="h-5 w-5 mr-2" />
          <span className="font-medium">{projectName}</span>
          <span className="mx-2 text-gray-400">|</span>
          <span className="text-gray-400 text-sm">{projectType}</span>
        </div>
        <div className="flex items-center space-x-4">
          <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm flex items-center">
            <PlayIcon className="h-4 w-4 mr-1" />
            Run
          </button>
          <Link href="/dashboard" className="text-sm text-gray-300 hover:text-white">
            Exit Editor
          </Link>
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* File Explorer */}
        <div className="w-56 bg-gray-900 text-gray-300 p-2 overflow-y-auto">
          <div className="mb-2 text-xs uppercase tracking-wider text-gray-500 font-medium pl-2">
            Explorer
          </div>
          
          <div className="mb-2">
            <div className="pl-2 py-1 text-sm font-medium text-gray-400">
              {projectName}
            </div>
            <ul className="pl-2">
              {files.map((file) => (
                <li 
                  key={file.name}
                  className={`pl-4 py-1 text-sm cursor-pointer hover:bg-gray-800 rounded ${selectedFile === file.name ? 'bg-gray-800 text-white' : 'text-gray-400'}`}
                  onClick={() => setSelectedFile(file.name)}
                >
                  {file.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Editor Area */}
        <div className="flex-1 bg-gray-900">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="animate-pulse text-indigo-500 dark:text-indigo-400">
                <svg className="w-16 h-16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 6v6l4 2"></path>
                </svg>
                <p className="mt-4 text-center text-gray-500">Loading editor...</p>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col">
              <div className="bg-gray-800 px-4 py-1 text-sm text-gray-400 border-b border-gray-700">
                {selectedFile}
              </div>
              <div className="flex-1 font-mono text-sm p-4 overflow-auto bg-gray-950 text-gray-300">
                <pre className="whitespace-pre-wrap">{fileContent}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-gray-800 border-t border-gray-700 p-2 text-gray-400 text-xs">
        Python 3.9.0 | Qiskit 0.36.1 | Status: Ready
      </div>
    </div>
  );
} 