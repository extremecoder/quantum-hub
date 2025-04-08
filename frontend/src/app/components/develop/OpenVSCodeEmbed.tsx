'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  createProject, 
  openProject, 
  checkWebIdeStatus, 
  checkVSCodeServerStatus, 
  getVSCodeUrl,
  retryWithBackoff 
} from '@/app/services/webIdeService';

/**
 * OpenVSCodeEmbed component
 * 
 * This component embeds an OpenVSCode Server instance in an iframe.
 * It communicates with the Web IDE Service API to create and manage
 * IDE sessions for quantum projects.
 */
interface OpenVSCodeEmbedProps {
  projectId?: string;
  projectName?: string;
  githubRepo?: string;
  projectType?: 'circuit' | 'algorithm' | 'quantum-model' | 'agent';
  isNewProject?: boolean;
  onClose?: () => void;
  onError?: (error: string) => void;
}

export default function OpenVSCodeEmbed({
  projectId,
  projectName,
  githubRepo,
  projectType = 'circuit',
  isNewProject = false,
  onClose,
  onError
}: OpenVSCodeEmbedProps) {
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const [ideUrl, setIdeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [directVSCodeAccess, setDirectVSCodeAccess] = useState(false);
  const [wsRetryCount, setWsRetryCount] = useState(0);
  const maxRetries = 3;
  const maxWsRetries = 5;
  
  // Function to create a new project and start an IDE session
  const createProjectSession = async () => {
    try {
      if (!projectName) {
        throw new Error('Project name is required');
      }
      
      setLoading(true);
      
      // First check if we can directly access the VS Code server
      const vsCodeAvailable = await checkVSCodeServerStatus()
        .catch(() => false);
      
      if (vsCodeAvailable) {
        // If we can access VS Code directly, use that instead of the API
        setDirectVSCodeAccess(true);
        
        // Generate a simple project ID
        const simpleProjectId = `proj-${Date.now()}`;
        
        // Create a direct URL to the VS Code server
        const directUrl = getVSCodeUrl(simpleProjectId, projectName);
        setIdeUrl(directUrl);
        return;
      }
      
      // Check if Web IDE service is available with retries
      const isAvailable = await retryWithBackoff(
        async () => await checkWebIdeStatus(),
        3,
        1000
      ).catch(() => false);
      
      if (!isAvailable) {
        throw new Error('Web IDE service is not available. Please try again later.');
      }
      
      // Create the project using the service
      const data = await createProject(
        projectName,
        'Project created via Quantum Hub',
        projectType
      );
      
      setIdeUrl(data.ide_url);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Function to open an existing project
  const openExistingProject = async () => {
    try {
      if (!projectId || !githubRepo) {
        throw new Error('Project ID and GitHub repository are required');
      }
      
      setLoading(true);
      
      // First check if we can directly access the VS Code server
      const vsCodeAvailable = await checkVSCodeServerStatus()
        .catch(() => false);
      
      if (vsCodeAvailable) {
        // If we can access VS Code directly, use that instead of the API
        setDirectVSCodeAccess(true);
        
        // Create a direct URL to the VS Code server
        const directUrl = getVSCodeUrl(projectId, projectName || 'project');
        setIdeUrl(directUrl);
        return;
      }
      
      // Check if Web IDE service is available with retries
      const isAvailable = await retryWithBackoff(
        async () => await checkWebIdeStatus(),
        3,
        1000
      ).catch(() => false);
      
      if (!isAvailable) {
        throw new Error('Web IDE service is not available. Please try again later.');
      }
      
      // Open the project using the service
      const data = await openProject(projectId, githubRepo);
      
      setIdeUrl(data.ide_url);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Initialize the IDE session when the component mounts
  useEffect(() => {
    if (isNewProject) {
      createProjectSession();
    } else if (projectId) {
      openExistingProject();
    }
  }, [projectId, isNewProject]);
  
  // Set up communication with the iframe
  useEffect(() => {
    if (!ideUrl) return;
    
    // Convert any references to port 3000 to 8080 for code-server
    const updatedIdeUrl = ideUrl.replace(':3000', ':8080');
    
    // If URL was changed, update state
    if (updatedIdeUrl !== ideUrl) {
      setIdeUrl(updatedIdeUrl);
    }
    
    const handleMessage = (event: MessageEvent) => {
      // Handle messages from the Code Server
      try {
        if (event.origin !== new URL(updatedIdeUrl).origin) return;
        
        // Example: Handle a "close" message from the IDE
        if (event.data.type === 'close' && onClose) {
          onClose();
        }
        
        // Handle websocket error detection
        if (event.data.type === 'error' && event.data.payload?.includes('WebSocket')) {
          console.error('WebSocket error detected:', event.data.payload);
          if (wsRetryCount < maxWsRetries) {
            setWsRetryCount(prev => prev + 1);
            // Refresh the iframe
            if (iframeRef.current) {
              iframeRef.current.src = updatedIdeUrl;
            }
          }
        }
      } catch (err) {
        console.error('Error handling message from IDE:', err);
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [ideUrl, onClose, wsRetryCount]);

  // Function to handle iframe load event
  const handleIframeLoad = () => {
    setLoading(false);
    setWsRetryCount(0); // Reset websocket retry count when iframe loads successfully
    console.log('VS Code iframe loaded successfully');
  };
  
  // Function to handle iframe error event
  const handleIframeError = (e: React.SyntheticEvent<HTMLIFrameElement, Event>) => {
    console.error('Error loading VS Code iframe:', e);
    setError('Failed to load VS Code editor. Please try again later.');
    setLoading(false);
    if (onError) {
      onError('Failed to load VS Code editor. Please try again later.');
    }
  };
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900 p-4">
        <div className="bg-red-50 dark:bg-red-900 dark:bg-opacity-20 p-6 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">Error Loading IDE</h2>
          <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
          <div className="flex flex-col space-y-3">
            <button 
              onClick={() => router.push('/develop')}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
            >
              Back to Projects
            </button>
            {retryCount < maxRetries && (
              <button 
                onClick={() => {
                  setError(null);
                  setRetryCount(retryCount + 1);
                  setLoading(true);
                  if (isNewProject) {
                    createProjectSession();
                  } else if (projectId) {
                    openExistingProject();
                  }
                }}
                className="bg-white border border-indigo-600 text-indigo-600 px-4 py-2 rounded hover:bg-indigo-50 transition-colors"
              >
                Retry Connection
              </button>
            )}
            <button
              onClick={async () => {
                // Try to access VS Code directly as a fallback
                setError(null);
                setLoading(true);
                setDirectVSCodeAccess(true);
                
                const projectIdentifier = projectId || `proj-${Date.now()}`;
                const projectTitle = projectName || 'project';
                
                // Rebuild the IDE URL with additional parameters to prevent WebSocket issues
                const baseUrl = `http://localhost:8080/?folder=/workspace/${projectIdentifier}`;
                const enhancedUrl = `${baseUrl}&skipWebSocketCheck=true`;
                setIdeUrl(enhancedUrl);
                setLoading(false);
              }}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
            >
              Try Direct Connection
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full h-screen flex flex-col">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 z-50">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">
              {isNewProject ? 'Creating project...' : 'Opening project in IDE...'}
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {directVSCodeAccess 
                ? 'Connecting directly to VS Code Server' 
                : 'Setting up project environment'}
            </p>
          </div>
        </div>
      )}
      
      {ideUrl && (
        <iframe
          ref={iframeRef}
          src={ideUrl}
          className="w-full h-full border-0"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          title="VS Code IDE"
          allow="cross-origin-isolated; clipboard-read; clipboard-write"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-top-navigation allow-downloads"
        />
      )}
    </div>
  );
}
