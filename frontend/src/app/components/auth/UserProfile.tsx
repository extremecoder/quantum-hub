'use client';

import { useState, useEffect } from 'react';
import { getUserProfile, updateUserProfile, User, UserUpdate } from '../../services/userService';

/**
 * User profile component that displays and allows editing of user information
 */
export default function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<UserUpdate>({
    full_name: '',
    is_provider: false
  });

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const userData = await getUserProfile();
        setUser(userData);
        setFormData({
          full_name: userData.full_name || '',
          is_provider: userData.is_provider || false
        });
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updatedUser = await updateUserProfile(formData);
      setUser(updatedUser);
      setEditing(false);
      setError('');
    } catch (err) {
      console.error('Error updating user profile:', err);
      setError('Failed to update user profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !user) {
    return (
      <div className="p-4 bg-white rounded-lg shadow dark:bg-gray-800">
        <div className="animate-pulse flex flex-col space-y-4">
          <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="p-4 bg-white rounded-lg shadow dark:bg-gray-800 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow dark:bg-gray-800">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">User Profile</h2>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Edit
          </button>
        )}
      </div>

      {editing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_provider"
              checked={formData.is_provider}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Provider Account
            </label>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex space-x-2">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Username</p>
            <p className="text-gray-900 dark:text-white">{user?.username}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
            <p className="text-gray-900 dark:text-white">{user?.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</p>
            <p className="text-gray-900 dark:text-white">{user?.full_name || 'Not set'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Type</p>
            <p className="text-gray-900 dark:text-white">
              {user?.is_provider ? 'Provider' : 'Consumer'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Member Since</p>
            <p className="text-gray-900 dark:text-white">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
