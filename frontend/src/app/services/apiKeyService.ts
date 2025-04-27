/**
 * Service for managing API keys
 */
import axios from 'axios';
import { getSession } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:8001/api/v1';

export interface ApiKey {
  id: string;
  key: string;
  name: string;
  created_at: string;
  expires_at: string | null;
  is_active: boolean;
}

export interface ApiKeyCreate {
  name: string;
  expires_at?: string | null;
}

export interface ApiUsageStats {
  total_requests: number;
  total_requests_limit: number;
  compute_time_hours: number;
  compute_time_limit: number;
}

// Default mock API keys for demo
const mockApiKeys: ApiKey[] = [
  {
    id: 'mock-key-1',
    key: 'qh_pk_sampleproductionkey123cRtG',
    name: 'Production Key',
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    expires_at: null,
    is_active: true
  },
  {
    id: 'mock-key-2',
    key: 'qh_dk_sampledevelopmentkey1tHj5',
    name: 'Development Key',
    created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 320 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: true
  },
  {
    id: 'mock-key-3',
    key: 'qh_tk_sampletrialkey12345zP4s',
    name: 'Trial Key',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: false
  }
];

// In-memory store for the demo
let demoApiKeys = [...mockApiKeys];

/**
 * Get authentication headers for API requests
 */
const getAuthHeaders = async () => {
  try {
    const session = await getSession();
    if (session?.accessToken) {
      return {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      };
    }

    // Fallback for demo
    return {
      'Content-Type': 'application/json',
    };
  } catch (error) {
    console.error('Error getting auth headers:', error);
    // Fallback for demo
    return {
      'Content-Type': 'application/json',
    };
  }
};

/**
 * Get all API keys for the current user
 */
export const getApiKeys = async (): Promise<ApiKey[]> => {
  try {
    const headers = await getAuthHeaders();
    console.log('Fetching API keys from:', `${API_URL}/api-keys`);
    const response = await axios.get(`${API_URL}/api-keys`, {
      headers,
      withCredentials: true,
    });

    // The response is now directly the array of API keys
    return response.data;
  } catch (error) {
    console.error('Error fetching API keys from server:', error);

    // Return the in-memory demo data
    return demoApiKeys;
  }
};

/**
 * Create a new API key
 */
export const createApiKey = async (apiKeyData: ApiKeyCreate): Promise<ApiKey> => {
  try {
    const headers = await getAuthHeaders();
    console.log('Creating API key at:', `${API_URL}/api-keys`);
    const response = await axios.post(`${API_URL}/api-keys`, apiKeyData, {
      headers,
      withCredentials: true,
    });

    // The response is now directly the created API key
    return response.data;
  } catch (error) {
    console.error('Error creating API key:', error);

    // Generate a mock key for demo
    const keyPrefix = apiKeyData.name.toLowerCase().includes('prod') ? 'qh_pk' :
                    apiKeyData.name.toLowerCase().includes('dev') ? 'qh_dk' : 'qh_tk';

    // Generate a random suffix for the key
    const randomSuffix = Math.random().toString(36).substring(2, 10);

    const newKey: ApiKey = {
      id: `mock-key-${Date.now()}`,
      key: `${keyPrefix}_${randomSuffix}`,
      name: apiKeyData.name,
      created_at: new Date().toISOString(),
      expires_at: apiKeyData.expires_at || null,
      is_active: true
    };

    // Add to our in-memory demo data
    demoApiKeys = [newKey, ...demoApiKeys];

    return newKey;
  }
};

/**
 * Revoke (disable) an API key
 */
export const revokeApiKey = async (keyId: string): Promise<void> => {
  try {
    const headers = await getAuthHeaders();
    await axios.delete(`${API_URL}/api-keys/${keyId}`, {
      headers,
      withCredentials: true,
    });
  } catch (error) {
    console.error('Error revoking API key:', error);

    // For demo, update our in-memory data
    demoApiKeys = demoApiKeys.map(key =>
      key.id === keyId ? { ...key, is_active: false } : key
    );
  }
};

/**
 * Get API usage statistics
 */
export const getApiUsageStats = async (): Promise<ApiUsageStats> => {
  try {
    const headers = await getAuthHeaders();
    console.log('Fetching API usage stats from:', `${API_URL}/api-keys/usage/stats`);
    const response = await axios.get(`${API_URL}/api-keys/usage/stats`, {
      headers,
      withCredentials: true,
    });

    // The response is now directly the API usage stats
    return response.data;
  } catch (error) {
    console.error('Error fetching API usage stats:', error);

    // Return demo stats
    return {
      total_requests: 25421,
      total_requests_limit: 50000,
      compute_time_hours: 28.5,
      compute_time_limit: 100
    };
  }
};
