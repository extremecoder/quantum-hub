'use client';

import { useState, useEffect } from 'react';
import ProjectManagement from '../components/develop/ProjectManagement';
import dynamic from 'next/dynamic';
import Link from 'next/link';

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
  const [showIDE, setShowIDE] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectType, setProjectType] = useState('circuit');
  
  // Check for URL parameters that might indicate a project is being opened directly
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const projectParam = urlParams.get('project');
      const templateParam = urlParams.get('template');
      
      if (projectParam) {
        setProjectName(projectParam);
        if (templateParam) {
          setProjectType(templateParam);
        }
        setShowIDE(true);
      }
    }
  }, []);

  if (showIDE) {
    return <EnhancedIDEEnvironment projectName={projectName || "test-quantum-app"} projectType={projectType} />;
  }

  return (
    <div>
      <ProjectManagement />
      {/* Add link to demo VS Code page */}
      <div className="mt-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">VS Code Integration Demo</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link 
            href="/develop/vscode-demo" 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  VS Code Demo
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  Visualization of OpenVSCode integration
                </p>
              </div>
              <span className="text-indigo-600 dark:text-indigo-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
            <div className="mt-2">
              <span className="inline-block bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300 text-xs px-2 py-1 rounded">
                Demo
              </span>
              <span className="inline-block bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-xs px-2 py-1 rounded ml-2">
                Visual
              </span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

// Existing IDE Environment component remains unchanged
function EnhancedIDEEnvironment({ projectName, projectType }: { projectName: string; projectType: string }) {
  // All the existing IDE code remains the same
  
  // Initial file setup and state
  const initialFiles: ProjectFile[] = [
    {
      name: 'main.py',
      language: 'python',
      content: `# ${projectName}
# A quantum ${projectType} application

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
job = execute(compiled_circuit, simulator, shots=1000)
result = job.result()

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
      content: `# ${projectName}

A quantum ${projectType} application built with Qiskit.

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
  ];
  
  const [files, setFiles] = useState<ProjectFile[]>(initialFiles);
  const [activeFile, setActiveFile] = useState<string>('main.py');
  const [editorContent, setEditorContent] = useState<string>('');
  const [editorTheme, setEditorTheme] = useState<string>('vs-dark');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [showOutput, setShowOutput] = useState<boolean>(false);
  const [output, setOutput] = useState<Array<{ type: 'info' | 'result' | 'visualization', content: string }>>([]);
  
  useEffect(() => {
    const currentFile = files.find(f => f.name === activeFile);
    if (currentFile) {
      setEditorContent(currentFile.content);
    }
  }, [activeFile, files]);
  
  const selectFile = (fileName: string) => {
    setActiveFile(fileName);
  };
  
  const handleCodeChange = (value: string | undefined) => {
    if (value === undefined) return;
    
    setEditorContent(value);
    const updatedFiles = files.map(file => {
      if (file.name === activeFile) {
        return { ...file, content: value, modified: true };
      }
      return file;
    });
    setFiles(updatedFiles);
  };
  
  const handleRunCode = () => {
    setIsRunning(true);
    setShowOutput(true);
    
    // Simulate running the code
    setOutput([
      { type: 'info', content: 'Running quantum circuit simulation...' },
      { type: 'info', content: 'Using backend: qasm_simulator' },
      { type: 'info', content: 'Executing job with 1000 shots...' }
    ]);
    
    // Simulate a delay for execution
    setTimeout(() => {
      setOutput(prev => [
        ...prev,
        { type: 'result', content: 'Total counts: {"00": 497, "11": 503}' },
        { type: 'info', content: 'Job completed successfully.' },
        { type: 'visualization', content: '╭─────────┐┌─┐     ╭───┐\n│ q_0: |0⟩ ┤ H ├┤M├──■─┤ = ├\n│         │└─┘    │ │ = │\n│ q_1: |0⟩ ─────X─┤M├─┤ = ├\n╰─────────┘      └─┘ ╰───┘\n' }
      ]);
      setIsRunning(false);
    }, 2000);
  };
  
  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      {/* IDE Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{projectName}</h1>
          <span className="ml-2 px-2 py-1 text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300 rounded-md">
            {projectType}
          </span>
        </div>
        
        <div className="flex space-x-4">
          <button 
            className="btn-primary text-sm inline-flex items-center"
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
                <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Run
              </>
            )}
          </button>
          
          <button className="btn-secondary text-sm">
            <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Save
          </button>
          
          <button className="btn-secondary text-sm">
            <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Publish
          </button>
        </div>
      </div>
      
      {/* IDE Main Container */}
      <div className="flex-grow flex">
        {/* File Explorer */}
        <div className="w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Files</h2>
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
        
        {/* Code Editor and Output Panel */}
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