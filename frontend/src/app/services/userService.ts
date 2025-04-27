/**
 * Service for managing user profiles
 */
import axios from 'axios';
import { getSession } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:8001/api/v1';

export interface User {
  id: string;
  username: string;
  email: string;
  full_name?: string;
  is_active: boolean;
  is_provider: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserUpdate {
  full_name?: string;
  is_active?: boolean;
  is_provider?: boolean;
}

// Default mock user for demo
const mockUser: User = {
  id: 'mock-user-id',
  username: 'demouser',
  email: 'demo@example.com',
  full_name: 'Demo User',
  is_active: true,
  is_provider: false,
  created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
};

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
 * Get the current user's profile
 */
export const getUserProfile = async (): Promise<User> => {
  try {
    const headers = await getAuthHeaders();
    console.log('Fetching user profile from:', `${API_URL}/users/me`);
    const response = await axios.get(`${API_URL}/users/me`, {
      headers,
      withCredentials: true,
    });
    
    // The response is now directly the user profile
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    
    // Return the mock user for demo
    return mockUser;
  }
};

/**
 * Update the current user's profile
 */
export const updateUserProfile = async (userData: UserUpdate): Promise<User> => {
  try {
    const headers = await getAuthHeaders();
    console.log('Updating user profile at:', `${API_URL}/users/me`);
    const response = await axios.put(`${API_URL}/users/me`, userData, {
      headers,
      withCredentials: true,
    });
    
    // The response is now directly the updated user profile
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    
    // Return the mock user with updates for demo
    return {
      ...mockUser,
      ...userData,
      updated_at: new Date().toISOString()
    };
  }
};
