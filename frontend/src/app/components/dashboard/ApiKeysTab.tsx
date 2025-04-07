/**
 * API Keys management tab for the dashboard
 */
'use client';

import { useState, useEffect } from 'react';
import { KeyIcon, ClipboardCopyIcon, XCircleIcon, PlusIcon, ExclamationCircleIcon } from '@heroicons/react/outline';
import { BadgeCheckIcon } from '@heroicons/react/solid';
import { getApiKeys, createApiKey, revokeApiKey, getApiUsageStats, ApiKey, ApiUsageStats } from '../../services/apiKeyService';

// New API Key dialog component
const NewApiKeyDialog = ({ 
  isOpen, 
  onClose, 
  onCreateKey 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onCreateKey: (name: string, expires: string | null) => Promise<void>; 
}) => {
  const [name, setName] = useState('');
  const [expiration, setExpiration] = useState<'never' | '30days' | '90days' | '1year'>('never');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!name.trim()) {
      setError('Please enter a key name');
      return;
    }
    
    setIsSubmitting(true);
    
    let expiresAt: string | null = null;
    
    if (expiration === '30days') {
      const date = new Date();
      date.setDate(date.getDate() + 30);
      expiresAt = date.toISOString();
    } else if (expiration === '90days') {
      const date = new Date();
      date.setDate(date.getDate() + 90);
      expiresAt = date.toISOString();
    } else if (expiration === '1year') {
      const date = new Date();
      date.setFullYear(date.getFullYear() + 1);
      expiresAt = date.toISOString();
    }
    
    try {
      await onCreateKey(name, expiresAt);
      setName('');
      setExpiration('never');
      onClose();
    } catch (err) {
      setError('Failed to create API key. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
        
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full p-6">
          <div className="flex justify-between items-start">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
              Create New API Key
            </h3>
            <button 
              type="button" 
              className="text-gray-400 hover:text-gray-500" 
              onClick={onClose}
            >
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>
          
          {error && (
            <div className="mt-3 bg-red-100 dark:bg-red-900 p-3 rounded-md">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mt-4">
              <label htmlFor="key-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Key Name
              </label>
              <input
                type="text"
                name="key-name"
                id="key-name"
                className="mt-1 p-2 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., Production Key"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            
            <div className="mt-4">
              <label htmlFor="expiration" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Expiration
              </label>
              <select
                id="expiration"
                name="expiration"
                className="mt-1 p-2 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={expiration}
                onChange={(e) => setExpiration(e.target.value as any)}
                disabled={isSubmitting}
              >
                <option value="never">Never</option>
                <option value="30days">30 days</option>
                <option value="90days">90 days</option>
                <option value="1year">1 year</option>
              </select>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                className="mr-3 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create API Key'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// New key created dialog component
const NewKeyCreatedDialog = ({ 
  isOpen, 
  onClose, 
  apiKey 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  apiKey: ApiKey | null; 
}) => {
  const [copied, setCopied] = useState(false);
  
  if (!isOpen || !apiKey) return null;
  
  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey.key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
        
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full p-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              <BadgeCheckIcon className="h-6 w-6 text-green-500 mr-2" />
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                API Key Created
              </h3>
            </div>
            <button 
              type="button" 
              className="text-gray-400 hover:text-gray-500" 
              onClick={onClose}
            >
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>
          
          <div className="mt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Please copy your API key now. For security reasons, it won't be displayed again.
            </p>
            
            <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-900 rounded-md">
              <div className="flex justify-between items-center">
                <code className="font-mono text-sm break-all">{apiKey.key}</code>
                <button
                  type="button"
                  className="ml-3 text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                  onClick={handleCopyKey}
                >
                  {copied ? (
                    <BadgeCheckIcon className="h-5 w-5" />
                  ) : (
                    <ClipboardCopyIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            
            <div className="mt-4 bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ExclamationCircleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    This API key grants access to your quantum resources. Keep it secure and never share it publicly.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
              onClick={onClose}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Confirmation dialog for revoking API keys
const ConfirmDialog = ({ 
  isOpen, 
  title,
  message,
  confirmButtonText,
  onConfirm, 
  onCancel 
}: { 
  isOpen: boolean; 
  title: string;
  message: string;
  confirmButtonText: string;
  onConfirm: () => void; 
  onCancel: () => void; 
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onCancel}></div>
        
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full p-6">
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 sm:mx-0 sm:h-10 sm:w-10">
              <XCircleIcon className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" />
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                {title}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {message}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onConfirm}
            >
              {confirmButtonText}
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 sm:mt-0 sm:w-auto sm:text-sm"
              onClick={onCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main API Keys Tab component
const ApiKeysTab = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [usageStats, setUsageStats] = useState<ApiUsageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCreatedKey, setNewCreatedKey] = useState<ApiKey | null>(null);
  const [isKeyCreatedDialogOpen, setIsKeyCreatedDialogOpen] = useState(false);
  
  const [keyToRevoke, setKeyToRevoke] = useState<string | null>(null);
  const [isRevokeDialogOpen, setIsRevokeDialogOpen] = useState(false);
  
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // Load API keys and usage stats
  const loadData = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const [keysData, statsData] = await Promise.all([
        getApiKeys(),
        getApiUsageStats()
      ]);
      
      setApiKeys(keysData);
      setUsageStats(statsData);
    } catch (err) {
      console.error('Error loading API key data:', err);
      setError('Failed to load API key data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle create API key
  const handleCreateKey = async (name: string, expires: string | null) => {
    try {
      const newKey = await createApiKey({ 
        name, 
        expires_at: expires 
      });
      
      setNewCreatedKey(newKey);
      setIsDialogOpen(false);
      setIsKeyCreatedDialogOpen(true);
      
      // Refresh the key list
      loadData();
    } catch (err) {
      console.error('Error creating API key:', err);
      throw err;
    }
  };

  // Handle revoke API key
  const handleRevokeKey = async () => {
    if (!keyToRevoke) return;
    
    try {
      await revokeApiKey(keyToRevoke);
      setIsRevokeDialogOpen(false);
      setKeyToRevoke(null);
      
      // Update the API key in the state
      setApiKeys(apiKeys.map(key => 
        key.id === keyToRevoke ? { ...key, is_active: false } : key
      ));
    } catch (err) {
      console.error('Error revoking API key:', err);
      setError('Failed to revoke API key. Please try again.');
    }
  };

  // Handle copy API key
  const handleCopyKey = (keyText: string, keyId: string) => {
    try {
      // Use a more robust clipboard copy method
      const textArea = document.createElement('textarea');
      textArea.value = keyText;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
        setCopiedKeyId(keyId);
        setTimeout(() => setCopiedKeyId(null), 2000);
      } catch (err) {
        console.error('Fallback: Could not copy text using execCommand', err);
        // Try using Clipboard API as a fallback
        navigator.clipboard.writeText(keyText)
          .then(() => {
            setCopiedKeyId(keyId);
            setTimeout(() => setCopiedKeyId(null), 2000);
          })
          .catch(err => {
            console.error('Error copying text with Clipboard API:', err);
            alert('Failed to copy to clipboard. Please try again or copy manually.');
          });
      }
      
      document.body.removeChild(textArea);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
      alert('Failed to copy to clipboard. Please try again or copy manually.');
    }
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">API Keys</h2>
        <button 
          className="btn-primary inline-flex items-center text-sm"
          onClick={() => setIsDialogOpen(true)}
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Generate New Key
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-100 dark:bg-red-900 p-4 rounded-md">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 mb-8">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Key Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Key</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Expires</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  {apiKeys.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        <KeyIcon className="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
                        <p>No API keys found. Generate your first key to get started.</p>
                      </td>
                    </tr>
                  ) : (
                    apiKeys.map((key) => (
                      <tr key={key.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{key.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-mono bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded">{key.key}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">{formatDate(key.created_at)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(key.expires_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            key.is_active 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {key.is_active ? 'Active' : 'Revoked'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3"
                            onClick={() => handleCopyKey(key.key, key.id)}
                            disabled={!key.is_active}
                          >
                            {copiedKeyId === key.id ? 'Copied!' : 'Copy'}
                          </button>
                          {key.is_active && (
                            <button 
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              onClick={() => {
                                setKeyToRevoke(key.id);
                                setIsRevokeDialogOpen(true);
                              }}
                            >
                              Revoke
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {usageStats && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">API Usage Limits</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Requests ({usageStats.total_requests.toLocaleString()}/{usageStats.total_requests_limit.toLocaleString()})
                    </span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {Math.round((usageStats.total_requests / usageStats.total_requests_limit) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div 
                      className="bg-indigo-600 h-2.5 rounded-full dark:bg-indigo-500" 
                      style={{ width: `${Math.min(100, (usageStats.total_requests / usageStats.total_requests_limit) * 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Compute Time ({usageStats.compute_time_hours.toFixed(1)}/{usageStats.compute_time_limit} hours)
                    </span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {Math.round((usageStats.compute_time_hours / usageStats.compute_time_limit) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div 
                      className="bg-indigo-600 h-2.5 rounded-full dark:bg-indigo-500" 
                      style={{ width: `${Math.min(100, (usageStats.compute_time_hours / usageStats.compute_time_limit) * 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="text-right">
                  <a href="/billing" className="text-indigo-600 hover:text-indigo-900 text-sm font-medium dark:text-indigo-400 dark:hover:text-indigo-300">
                    Upgrade Plan →
                  </a>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      
      {/* Dialogs */}
      <NewApiKeyDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
        onCreateKey={handleCreateKey} 
      />
      
      <NewKeyCreatedDialog 
        isOpen={isKeyCreatedDialogOpen} 
        onClose={() => setIsKeyCreatedDialogOpen(false)} 
        apiKey={newCreatedKey} 
      />
      
      <ConfirmDialog 
        isOpen={isRevokeDialogOpen}
        title="Revoke API Key"
        message="Are you sure you want to revoke this API key? This action cannot be undone, and any services using this key will no longer be able to access the API."
        confirmButtonText="Revoke Key"
        onConfirm={handleRevokeKey}
        onCancel={() => {
          setIsRevokeDialogOpen(false);
          setKeyToRevoke(null);
        }}
      />
    </div>
  );
};

export default ApiKeysTab;
