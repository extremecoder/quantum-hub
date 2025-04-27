'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  getApiKeys, 
  createApiKey, 
  revokeApiKey, 
  getApiUsageStats,
  ApiKey,
  ApiUsageStats
} from '../../services/apiKeyService';

/**
 * API Keys management page
 */
export default function ApiKeysPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [usageStats, setUsageStats] = useState<ApiUsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [expiryDays, setExpiryDays] = useState(90);
  const [creatingKey, setCreatingKey] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<ApiKey | null>(null);
  const [keyToDelete, setKeyToDelete] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // Fetch API keys and usage stats on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [keys, stats] = await Promise.all([
          getApiKeys(),
          getApiUsageStats()
        ]);
        setApiKeys(keys);
        setUsageStats(stats);
        setError('');
      } catch (err) {
        console.error('Error fetching API keys:', err);
        setError('Failed to load API keys');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchData();
    }
  }, [status]);

  // Handle creating a new API key
  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreatingKey(true);
      const newKey = await createApiKey({
        name: newKeyName,
        expires_at: expiryDays > 0 
          ? new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString() 
          : null
      });
      
      setApiKeys([newKey, ...apiKeys]);
      setNewlyCreatedKey(newKey);
      setNewKeyName('');
      setExpiryDays(90);
      setShowCreateForm(false);
      setError('');
    } catch (err) {
      console.error('Error creating API key:', err);
      setError('Failed to create API key');
    } finally {
      setCreatingKey(false);
    }
  };

  // Handle revoking an API key
  const handleRevokeKey = async (keyId: string) => {
    try {
      await revokeApiKey(keyId);
      setApiKeys(apiKeys.map(key => 
        key.id === keyId ? { ...key, is_active: false } : key
      ));
      setKeyToDelete(null);
      setError('');
    } catch (err) {
      console.error('Error revoking API key:', err);
      setError('Failed to revoke API key');
    }
  };

  // Copy API key to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert('API key copied to clipboard');
      })
      .catch(err => {
        console.error('Failed to copy API key:', err);
      });
  };

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse flex flex-col space-y-4">
          <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">API Keys</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Create New Key
        </button>
      </div>

      {/* Usage Stats */}
      {usageStats && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow dark:bg-gray-800">
          <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">API Usage</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Requests</p>
              <div className="mt-1 relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">
                      {Math.round((usageStats.total_requests / usageStats.total_requests_limit) * 100)}%
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-indigo-600">
                      {usageStats.total_requests} / {usageStats.total_requests_limit}
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
                  <div
                    style={{ width: `${(usageStats.total_requests / usageStats.total_requests_limit) * 100}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
                  ></div>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Compute Time</p>
              <div className="mt-1 relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">
                      {Math.round((usageStats.compute_time_hours / usageStats.compute_time_limit) * 100)}%
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-indigo-600">
                      {usageStats.compute_time_hours} / {usageStats.compute_time_limit} hours
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
                  <div
                    style={{ width: `${(usageStats.compute_time_hours / usageStats.compute_time_limit) * 100}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create API Key Form */}
      {showCreateForm && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow dark:bg-gray-800">
          <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Create New API Key</h2>
          <form onSubmit={handleCreateKey} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Key Name
              </label>
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g., Production Key"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Expiration
              </label>
              <select
                value={expiryDays}
                onChange={(e) => setExpiryDays(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value={30}>30 days</option>
                <option value={90}>90 days</option>
                <option value={180}>180 days</option>
                <option value={365}>1 year</option>
                <option value={0}>No expiration</option>
              </select>
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={creatingKey || !newKeyName}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {creatingKey ? 'Creating...' : 'Create Key'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Newly Created Key */}
      {newlyCreatedKey && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900 dark:border-green-800">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">New API Key Created</h3>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                Make sure to copy your API key now. You won't be able to see it again!
              </p>
            </div>
            <button
              onClick={() => setNewlyCreatedKey(null)}
              className="text-green-700 dark:text-green-300 hover:text-green-900 dark:hover:text-green-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded border border-green-200 dark:border-green-700 flex items-center justify-between">
            <code className="text-sm font-mono text-green-800 dark:text-green-200 break-all">
              {newlyCreatedKey.key}
            </code>
            <button
              onClick={() => copyToClipboard(newlyCreatedKey.key)}
              className="ml-2 p-1 text-green-700 hover:text-green-900 dark:text-green-300 dark:hover:text-green-100"
              title="Copy to clipboard"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900 dark:border-red-800">
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* API Keys List */}
      <div className="bg-white rounded-lg shadow dark:bg-gray-800 overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Your API Keys</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            Manage your API keys for accessing the Quantum Hub API.
          </p>
        </div>

        {loading && apiKeys.length === 0 ? (
          <div className="p-4">
            <div className="animate-pulse flex flex-col space-y-4">
              <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-2/3"></div>
            </div>
          </div>
        ) : apiKeys.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            <p>You don't have any API keys yet.</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="mt-2 text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Create your first API key
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {apiKeys.map((key) => (
              <li key={key.id} className="p-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <div className="mb-2 sm:mb-0">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">{key.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Created: {new Date(key.created_at).toLocaleDateString()}
                    </p>
                    {key.expires_at && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Expires: {new Date(key.expires_at).toLocaleDateString()}
                      </p>
                    )}
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          key.is_active
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}
                      >
                        {key.is_active ? 'Active' : 'Revoked'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded">
                      {key.key.substring(0, 8)}...{key.key.substring(key.key.length - 4)}
                    </div>
                    {key.is_active && (
                      <button
                        onClick={() => setKeyToDelete(key.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        title="Revoke API key"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {keyToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Revoke API Key</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Are you sure you want to revoke this API key? This action cannot be undone, and any applications using this key will no longer be able to access the API.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setKeyToDelete(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => keyToDelete && handleRevokeKey(keyToDelete)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Revoke Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
