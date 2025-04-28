/**
 * Service for managing quantum applications
 */
import axios from 'axios';
import { getSession } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_QUANTUM_APP_SERVICE_URL || 'http://localhost:8005/api/v1';

export interface QuantumApp {
  id: string;
  name: string;
  description: string;
  type: string;
  status: string[] | string; // Can be an array of strings or a single string
  visibility: string;
  developer_id: string;
  latest_version_id?: string;
  api_url?: string;
  documentation_url?: string;
  license_type?: string;
  license_url?: string;
  readme_content?: string;
  repository_url?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Get auth headers for API requests
 */
export const getAuthHeaders = async () => {
  const session = await getSession();
  return {
    Authorization: `Bearer ${session?.accessToken || ''}`,
  };
};

/**
 * Check if the quantum app service is available
 */
export const checkServiceAvailability = async (): Promise<boolean> => {
  try {
    // Extract the base URL without the /api/v1 part
    const baseUrl = API_URL.replace('/api/v1', '');

    // Try the root health endpoint first
    try {
      const rootHealthResponse = await axios.get(`${baseUrl}/health`, {
        timeout: 3000, // 3 second timeout
      });
      if (rootHealthResponse.status === 200) {
        console.log('Root health endpoint available');
        return true;
      }
    } catch (rootHealthError) {
      console.log('Root health endpoint not available, trying API prefix health endpoint');
    }

    // Try the API prefix health endpoint
    try {
      const apiHealthResponse = await axios.get(`${API_URL}/health`, {
        timeout: 3000, // 3 second timeout
      });
      if (apiHealthResponse.status === 200) {
        console.log('API prefix health endpoint available');
        return true;
      }
    } catch (apiHealthError) {
      console.log('API prefix health endpoint not available, trying base URL');
    }

    // Try the quantum-apps endpoint to check if the API is working
    try {
      const headers = await getAuthHeaders();
      const apiEndpointResponse = await axios.get(`${API_URL}/quantum-apps`, {
        headers,
        timeout: 3000,
        validateStatus: (status) => status < 500
      });

      // If we get a 401 or 403, it means the service is running but requires auth
      if (apiEndpointResponse.status === 401 || apiEndpointResponse.status === 403) {
        console.log('API endpoint available but requires authentication');
        return true;
      }

      // If we get a 200, the service is definitely running
      if (apiEndpointResponse.status === 200) {
        console.log('API endpoint available');
        return true;
      }

      console.log('API endpoint response:', apiEndpointResponse.status);
    } catch (apiEndpointError) {
      console.log('API endpoint not available, trying base URL');
    }

    // If all specific endpoints fail, try the base URL
    const response = await axios.get(`${baseUrl}`, {
      timeout: 3000, // 3 second timeout
      validateStatus: (status) => {
        // Consider the service available even if it returns 404 or other error codes
        // as long as the server responds
        return status < 500;
      }
    });

    // If we get any response (even 404), the service is running
    console.log('Base URL check response:', response.status);
    return true;
  } catch (error) {
    console.error('Quantum app service availability check failed:', error);
    return false;
  }
};

/**
 * Get all quantum apps for the current user
 */
export const getQuantumApps = async (): Promise<QuantumApp[]> => {
  try {
    const headers = await getAuthHeaders();
    console.log('Fetching quantum apps from:', `${API_URL}/quantum-apps`);
    const response = await axios.get(`${API_URL}/quantum-apps`, {
      headers,
      withCredentials: true,
    });

    console.log('Quantum apps response:', response.data);

    // Handle both response formats - direct array or wrapped in data property
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
      return response.data.data;
    } else {
      console.warn('Unexpected response format:', response.data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching quantum apps:', error);
    // Return empty array on error
    return [];
  }
};

/**
 * Get a specific quantum app by ID
 */
export const getQuantumApp = async (appId: string): Promise<QuantumApp | null> => {
  try {
    const headers = await getAuthHeaders();
    console.log('Fetching quantum app from:', `${API_URL}/quantum-apps/${appId}`);
    const response = await axios.get(`${API_URL}/quantum-apps/${appId}`, {
      headers,
      withCredentials: true,
    });

    return response.data.data || null;
  } catch (error) {
    console.error(`Error fetching quantum app ${appId}:`, error);
    return null;
  }
};

/**
 * Upload a quantum app package
 */
export const uploadQuantumAppPackage = async (packageFile: File): Promise<QuantumApp | null> => {
  try {
    const headers = await getAuthHeaders();
    console.log('Uploading quantum app package to:', `${API_URL}/quantum-apps/upload`);
    console.log('Auth headers:', headers);

    const formData = new FormData();
    formData.append('package_file', packageFile);

    const response = await axios.post(`${API_URL}/quantum-apps/upload`, formData, {
      headers: {
        ...headers,
        'Content-Type': 'multipart/form-data',
      },
      withCredentials: true,
    });

    console.log('Upload response:', response.data);
    return response.data.data || null;
  } catch (error: any) {
    console.error('Error uploading quantum app package:', error);

    // Extract more detailed error information
    let errorMessage = 'Failed to upload quantum app package';

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);

      if (error.response.data && error.response.data.detail) {
        errorMessage = typeof error.response.data.detail === 'string'
          ? error.response.data.detail
          : JSON.stringify(error.response.data.detail);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Error request:', error.request);
      errorMessage = 'No response received from server';
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
      errorMessage = error.message || errorMessage;
    }

    // Create a custom error object with the detailed message
    const customError = new Error(errorMessage);
    customError.name = 'UploadError';
    // @ts-ignore
    customError.originalError = error;
    throw customError;
  }
};
