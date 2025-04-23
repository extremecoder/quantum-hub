'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { 
  ArrowLeftIcon, 
  SaveIcon, 
  PlayIcon, 
  CodeIcon, 
  DocumentDownloadIcon, 
  ShareIcon 
} from '@heroicons/react/outline';

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

// Default project templates
const templates = {
  'bell-state': {
    name: 'Bell State',
    description: 'Create a quantum entanglement between two qubits',
    files: [
      {
        name: 'main.py',
        language: 'python',
        content: `# Bell State Preparation
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
`,
        modified: false
      },
      {
        name: 'requirements.txt',
        language: 'text',
        content: `qiskit==0.42.0
matplotlib==3.7.1
numpy==1.24.3
`,
        modified: false
      },
      {
        name: 'README.md',
        language: 'markdown',
        content: `# Bell State Example

A quantum circuit application that creates a Bell state.

## Description

This project implements a quantum circuit that creates a Bell state, which is one of the simplest examples of quantum entanglement.

## Requirements

- Python 3.8+
- Qiskit 0.42.0
- Matplotlib 3.7.1
- NumPy 1.24.3

## Usage

1. Install dependencies:
   \`\`\`
   pip install -r requirements.txt
   \`\`\`

2. Run the main script:
   \`\`\`
   python main.py
   \`\`\`

3. Observe the measurement outcomes and circuit visualization.

## License

MIT
`,
        modified: false
      }
    ]
  },
  'qft': {
    name: 'Quantum Fourier Transform',
    description: 'Implementation of QFT algorithm for signal processing',
    files: [
      {
        name: 'main.py',
        language: 'python',
        content: `# Quantum Fourier Transform Implementation
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

# For visualization, we'll also simulate the statevector
simulator = Aer.get_backend('statevector_simulator')
statevector = execute(qc, simulator).result().get_statevector()
print("Statevector dimensions:", len(statevector))
`,
        modified: false
      },
      {
        name: 'requirements.txt',
        language: 'text',
        content: `qiskit==0.42.0
matplotlib==3.7.1
numpy==1.24.3
`,
        modified: false
      }
    ]
  },
  'blank': {
    name: 'Blank Project',
    description: 'Start with an empty project',
    files: [
      {
        name: 'main.py',
        language: 'python',
        content: `# Quantum Application
# Add your code here

from qiskit import QuantumCircuit

# Create your quantum circuit
qc = QuantumCircuit(2, 2)

# Add gates and operations

# Draw the circuit
print(qc.draw())
`,
        modified: false
      },
      {
        name: 'requirements.txt',
        language: 'text',
        content: `qiskit==0.42.0
matplotlib==3.7.1
numpy==1.24.3
`,
        modified: false
      },
      {
        name: 'README.md',
        language: 'markdown',
        content: `# Quantum Project

## Description

Add your project description here.

## Requirements

- Python 3.8+
- Qiskit 0.42.0

## Usage

1. Install dependencies:
   \`\`\`
   pip install -r requirements.txt
   \`\`\`

2. Run the main script:
   \`\`\`
   python main.py
   \`\`\`

## License

MIT
`,
        modified: false
      }
    ]
  }
};

export default function IDEPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <IDEPage />
    </Suspense>
  );
}

function IDEPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const projectParam = searchParams.get('project');
  const templateParam = searchParams.get('template') || 'blank';
  
  const [projectName, setProjectName] = useState(projectParam || 'Untitled Project');
  const [projectType, setProjectType] = useState('circuit');
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [activeFile, setActiveFile] = useState<string>('');
  const [editorContent, setEditorContent] = useState<string>('');
  const [editorTheme, setEditorTheme] = useState<string>('vs-dark');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [showOutput, setShowOutput] = useState<boolean>(false);
  const [output, setOutput] = useState<Array<{ type: 'info' | 'result' | 'visualization', content: string }>>([]);
  const [showSaveDialog, setShowSaveDialog] = useState<boolean>(false);
  const [isModified, setIsModified] = useState<boolean>(false);
  
  // Initialize project files based on template
  useEffect(() => {
    let initialFiles: ProjectFile[] = [];
    
    if (templateParam && templates[templateParam as keyof typeof templates]) {
      initialFiles = [...templates[templateParam as keyof typeof templates].files];
    } else {
      initialFiles = [...templates['blank'].files];
    }
    
    // Update project name in file contents
    initialFiles = initialFiles.map(file => {
      if (file.name === 'README.md') {
        return {
          ...file,
          content: file.content.replace(/# .*?(\n|$)/, `# ${projectName}\n`)
        };
      }
      return file;
    });
    
    setFiles(initialFiles);
    if (initialFiles.length > 0) {
      setActiveFile(initialFiles[0].name);
      setEditorContent(initialFiles[0].content);
    }
  }, [projectParam, templateParam, projectName]);
  
  const selectFile = (fileName: string) => {
    // Save current file changes first
    updateCurrentFile();
    
    // Then switch files
    setActiveFile(fileName);
    const file = files.find(f => f.name === fileName);
    if (file) {
      setEditorContent(file.content);
    }
  };
  
  const updateCurrentFile = () => {
    if (activeFile) {
      const updatedFiles = files.map(file => {
        if (file.name === activeFile) {
          return { ...file, content: editorContent, modified: file.content !== editorContent };
        }
        return file;
      });
      setFiles(updatedFiles);
      setIsModified(updatedFiles.some(file => file.modified));
    }
  };
  
  const handleCodeChange = (value: string | undefined) => {
    if (value === undefined) return;
    setEditorContent(value);
  };
  
  const saveProject = () => {
    // In a real app, this would save to a backend
    updateCurrentFile();
    
    // Simulate saving
    setTimeout(() => {
      const updatedFiles = files.map(file => ({ ...file, modified: false }));
      setFiles(updatedFiles);
      setIsModified(false);
      setShowSaveDialog(false);
      
      // Show success in output
      setOutput(prev => [...prev, { 
        type: 'info', 
        content: `Project "${projectName}" saved successfully.` 
      }]);
    }, 800);
  };
  
  const runCode = () => {
    setIsRunning(true);
    setShowOutput(true);
    
    // Save current file first
    updateCurrentFile();
    
    // Simulating code execution
    setOutput([
      { type: 'info', content: 'Running quantum circuit simulation...' },
      { type: 'info', content: 'Using backend: qasm_simulator' },
      { type: 'info', content: 'Executing job with 1000 shots...' }
    ]);
    
    // Simulate delay and then show results
    setTimeout(() => {
      if (activeFile.endsWith('.py')) {
        // Get different outputs based on the template
        if (templateParam === 'bell-state') {
          setOutput(prev => [...prev,
            { type: 'result', content: 'Total counts: {"00": 497, "11": 503}' },
            { type: 'info', content: 'Job completed successfully.' },
            { type: 'visualization', content: '╭─────────┐┌─┐     ╭───┐\n│ q_0: |0⟩ ┤ H ├┤M├──■─┤ = ├\n│         │└─┘    │ │ = │\n│ q_1: |0⟩ ─────X─┤M├─┤ = ├\n╰─────────┘      └─┘ ╰───┘\n' }
          ]);
        } else if (templateParam === 'qft') {
          setOutput(prev => [...prev,
            { type: 'result', content: 'Statevector dimensions: 16' },
            { type: 'info', content: 'QFT applied successfully.' },
            { type: 'visualization', content: '     ┌───┐                                  ┌───┐     \n q_0: ┤ X ├──■────────────────────────────┤ X ├─────\n     ├───┤┌─┴─┐┌────────────────────────┐└───┘┌───┐\n q_1: ┤ H ├┤ P ├┤ P/2                    ├─────┤ X ├\n     └───┘└───┘│                        │     └───┘\n q_2: ─■────────┤ P/4                    ├──■───────\n     ┌─┴─┐     │                        │┌─┴─┐     \n q_3: ┤ X ├─────┤ P/8                    ├┤ H ├─────\n     └───┘     └────────────────────────┘└───┘     ' }
          ]);
        } else {
          setOutput(prev => [...prev,
            { type: 'result', content: 'Empty quantum circuit with 2 qubits and 2 classical bits' },
            { type: 'info', content: 'No operations defined.' },
            { type: 'visualization', content: 'q_0: ─────\n      \nq_1: ─────\n      \nc: 2/═════\n      ' }
          ]);
        }
      } else {
        setOutput(prev => [...prev,
          { type: 'info', content: 'Cannot execute non-Python files.' }
        ]);
      }
      setIsRunning(false);
    }, 2000);
  };
  
  const createNewFile = () => {
    // Save current changes
    updateCurrentFile();
    
    // Create default name based on existing files
    const pythonFiles = files.filter(f => f.name.endsWith('.py'));
    let newFileName = 'new_file.py';
    if (pythonFiles.length > 0) {
      newFileName = `file_${pythonFiles.length + 1}.py`;
    }
    
    // Add new file
    const newFile: ProjectFile = {
      name: newFileName,
      language: 'python',
      content: '# New Python file\n\n# Add your code here\n',
      modified: true
    };
    
    setFiles([...files, newFile]);
    setActiveFile(newFileName);
    setEditorContent(newFile.content);
  };
  
  const handleRelease = () => {
    // Save current changes
    updateCurrentFile();
    
    // In a real app, this would integrate with the ProjectRelease wizard
    router.push(`/develop/publish?project=${encodeURIComponent(projectName)}`);
  };
  
  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header/Toolbar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link 
            href="/develop"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{projectName}</h1>
            <span className="ml-2 px-2 py-1 text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300 rounded-md">
              {projectType}
            </span>
            {isModified && (
              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">●</span>
            )}
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button 
            className="btn-secondary text-sm inline-flex items-center"
            onClick={() => setShowSaveDialog(true)}
          >
            <SaveIcon className="h-4 w-4 mr-2" />
            Save
          </button>
          
          <button 
            className="btn-primary text-sm inline-flex items-center"
            onClick={runCode}
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
                <PlayIcon className="h-4 w-4 mr-2" />
                Run
              </>
            )}
          </button>
          
          <button 
            className="btn-secondary text-sm inline-flex items-center"
            onClick={handleRelease}
          >
            <ShareIcon className="h-4 w-4 mr-2" />
            Release
          </button>
        </div>
      </div>
      
      {/* Main content area */}
      <div className="flex-grow flex">
        {/* File Explorer */}
        <div className="w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Files</h2>
            <button 
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              onClick={createNewFile}
            >
              <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
          <div className="overflow-y-auto">
            {files.map((file) => (
              <div
                key={file.name}
                onClick={() => selectFile(file.name)}
                className={`px-4 py-2 flex items-center cursor-pointer ${
                  activeFile === file.name
                    ? 'bg-indigo-50 dark:bg-indigo-900 dark:bg-opacity-20 text-indigo-700 dark:text-indigo-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-750'
                }`}
              >
                <svg className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm">{file.name}</span>
                {file.modified && (
                  <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">●</span>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Editor and Output */}
        <div className="flex-grow flex flex-col bg-gray-900">
          <div className={`flex-grow ${showOutput ? 'h-3/5' : 'h-full'} overflow-hidden`}>
            <MonacoEditor
              height="100%"
              language={files.find(f => f.name === activeFile)?.language || 'python'}
              value={editorContent}
              onChange={handleCodeChange}
              theme={editorTheme}
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
              onMount={() => {
                // Focus editor on mount
                setTimeout(() => {
                  const editorElement = document.querySelector('.monaco-editor textarea');
                  if (editorElement) {
                    (editorElement as HTMLElement).focus();
                  }
                }, 100);
              }}
            />
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
                
                {output.length > 0 && output.some(o => o.type === 'result' && o.content.includes('"00"')) && (
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
      
      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Save Project</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Project Name
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Project Type
              </label>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="circuit">Quantum Circuit</option>
                <option value="algorithm">Quantum Algorithm</option>
                <option value="application">Full Application</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={saveProject}
                className="btn-primary"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
