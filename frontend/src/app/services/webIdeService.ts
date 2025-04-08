'use client';

/**
 * Web IDE Service
 * 
 * This service handles communication with the Web IDE backend service
 * for creating and opening projects in the OpenVSCode editor.
 */

import { Project } from '../types/project';

// API base URL from environment variables
const WEB_IDE_API_URL = 
  process.env.NEXT_PUBLIC_WEB_IDE_API_URL || 'http://localhost:8010';

// The VS Code server port
const VS_CODE_PORT = '8080';
const VS_CODE_HOST = 'localhost';

interface ProjectResponse {
  project_id: string;
  name: string;
  ide_url: string;
  created_at: string;
  status: string;
}

/**
 * Create a new project with the Web IDE service
 */
export async function createProject(
  name: string,
  description: string | undefined,
  projectType: string
): Promise<ProjectResponse> {
  return retryWithBackoff(async () => {
    try {
      const response = await fetch(`${WEB_IDE_API_URL}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          project_type: projectType,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create project');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  });
}

/**
 * Open an existing project in the Web IDE
 */
export async function openProject(
  projectId: string,
  githubRepo: string
): Promise<ProjectResponse> {
  return retryWithBackoff(async () => {
    try {
      const response = await fetch(`${WEB_IDE_API_URL}/projects/open`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: projectId,
          github_repo: githubRepo,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to open project');
      }

      return await response.json();
    } catch (error) {
      console.error('Error opening project:', error);
      throw error;
    }
  });
}

/**
 * Get session information for an active IDE session
 */
export async function getSessionInfo(sessionId: string): Promise<any> {
  return retryWithBackoff(async () => {
    try {
      const response = await fetch(`${WEB_IDE_API_URL}/sessions/${sessionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to get session info');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting session info:', error);
      throw error;
    }
  });
}

/**
 * Check if the Web IDE service is available
 */
export async function checkWebIdeStatus(): Promise<boolean> {
  try {
    // First try the health endpoint
    console.log('Checking Web IDE service health endpoint...');
    const response = await fetch(`${WEB_IDE_API_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      console.log('Web IDE service health endpoint is available');
      return true;
    }
    
    // Fall back to root endpoint
    console.log('Health endpoint unavailable, trying root endpoint...');
    const rootResponse = await fetch(`${WEB_IDE_API_URL}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log(`Root endpoint status: ${rootResponse.ok ? 'available' : 'unavailable'}`);
    return rootResponse.ok;
  } catch (error) {
    console.error('Web IDE service is not available:', error);
    return false;
  }
}

/**
 * Check if the VS Code server is available
 */
export async function checkVSCodeServerStatus(): Promise<boolean> {
  try {
    // Try to connect to the VS Code server
    console.log(`Checking VS Code server at ${VS_CODE_HOST}:${VS_CODE_PORT}...`);
    const response = await fetch(`http://${VS_CODE_HOST}:${VS_CODE_PORT}`, {
      method: 'GET',
    });
    
    console.log(`VS Code server status: ${response.ok ? 'available' : 'unavailable'}`);
    return response.ok;
  } catch (error) {
    console.error('VS Code server is not available:', error);
    return false;
  }
}

/**
 * Get the direct URL to the VS Code server for a project
 */
export function getVSCodeUrl(projectId: string, projectName: string): string {
  // Create a URL for directly accessing the VS Code server with the project folder
  return `http://${VS_CODE_HOST}:${VS_CODE_PORT}/?folder=/workspace/${projectId}`;
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let retries = 0;
  let delay = initialDelay;
  
  while (true) {
    try {
      return await fn();
    } catch (error) {
      if (retries >= maxRetries) {
        throw error;
      }
      
      retries++;
      console.log(`Retrying operation after ${delay}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
}
