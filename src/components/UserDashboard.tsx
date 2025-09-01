'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as Tabs from '@radix-ui/react-tabs';
import * as Dialog from '@radix-ui/react-dialog';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { UserSession, LLMProvider } from '@/types';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

interface UserDashboardProps {
  userSession: UserSession;
  onUpdatePreferences: (preferences: any) => void;
  onStoreApiKey: (providerId: string, apiKey: string) => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({
  userSession,
  onUpdatePreferences,
  onStoreApiKey,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('usage');
  const [apiKeyForm, setApiKeyForm] = useState({ providerId: '', apiKey: '' });

  const totalCost = Object.values(userSession.apiUsage).reduce((sum, usage) => sum + usage.cost, 0);
  const totalTokens = Object.values(userSession.apiUsage).reduce((sum, usage) => sum + usage.tokensUsed, 0);
  const totalRequests = Object.values(userSession.apiUsage).reduce((sum, usage) => sum + usage.requestCount, 0);

  const usageChartData = {
    labels: Object.keys(userSession.apiUsage),
    datasets: [
      {
        label: 'Tokens Used',
        data: Object.values(userSession.apiUsage).map(usage => usage.tokensUsed),
        backgroundColor: 'rgba(6, 182, 212, 0.5)',
        borderColor: 'rgba(6, 182, 212, 1)',
        borderWidth: 2,
      },
    ],
  };

  const costChartData = {
    labels: Object.keys(userSession.apiUsage),
    datasets: [
      {
        label: 'Cost ($)',
        data: Object.values(userSession.apiUsage).map(usage => usage.cost),
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const handleApiKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKeyForm.providerId && apiKeyForm.apiKey) {
      onStoreApiKey(apiKeyForm.providerId, apiKeyForm.apiKey);
      setApiKeyForm({ providerId: '', apiKey: '' });
    }
  };

  const handlePreferenceChange = (key: string, value: any) => {
    onUpdatePreferences({ [key]: value });
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {userSession.userId ? userSession.userId[0].toUpperCase() : 'A'}
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Dashboard
          </span>
        </motion.button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 max-h-[90vh] overflow-hidden">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                User Dashboard
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </Dialog.Close>
            </div>

            <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <Tabs.List className="flex border-b border-gray-200 dark:border-gray-700 px-6">
                <Tabs.Trigger
                  value="usage"
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === 'usage'
                      ? 'border-b-2 border-cyan-500 text-cyan-600 dark:text-cyan-400'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  API Usage
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="preferences"
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === 'preferences'
                      ? 'border-b-2 border-cyan-500 text-cyan-600 dark:text-cyan-400'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  Preferences
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="apikeys"
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === 'apikeys'
                      ? 'border-b-2 border-cyan-500 text-cyan-600 dark:text-cyan-400'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  API Keys
                </Tabs.Trigger>
              </Tabs.List>

              <div className="flex-1 overflow-y-auto p-6">
                {/* Usage Tab */}
                <Tabs.Content value="usage" className="space-y-6">
                  {/* Stats Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg p-6 text-white">
                      <div className="text-2xl font-bold">${totalCost.toFixed(4)}</div>
                      <div className="text-sm opacity-90">Total Cost</div>
                    </div>
                    <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-lg p-6 text-white">
                      <div className="text-2xl font-bold">{totalTokens.toLocaleString()}</div>
                      <div className="text-sm opacity-90">Total Tokens</div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-6 text-white">
                      <div className="text-2xl font-bold">{totalRequests}</div>
                      <div className="text-sm opacity-90">Total Requests</div>
                    </div>
                  </div>

                  {/* Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                        Token Usage by Provider
                      </h3>
                      <div className="h-64">
                        <Bar data={usageChartData} options={chartOptions} />
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                        Cost by Provider
                      </h3>
                      <div className="h-64">
                        <Bar data={costChartData} options={chartOptions} />
                      </div>
                    </div>
                  </div>

                  {/* Detailed Usage Table */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-600">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Provider Details
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-100 dark:bg-gray-600">
                          <tr>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                              Provider
                            </th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                              Requests
                            </th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                              Tokens
                            </th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                              Cost
                            </th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                              Last Used
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                          {Object.entries(userSession.apiUsage).map(([providerId, usage]) => (
                            <tr key={providerId} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                              <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100 font-medium">
                                {providerId.charAt(0).toUpperCase() + providerId.slice(1)}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                                {usage.requestCount}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                                {usage.tokensUsed.toLocaleString()}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                                ${usage.cost.toFixed(4)}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                                {usage.lastUsed.toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </Tabs.Content>

                {/* Preferences Tab */}
                <Tabs.Content value="preferences" className="space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      Interface Preferences
                    </h3>
                    
                    {/* Theme Selection */}
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Theme
                      </label>
                      <select
                        value={userSession.preferences.theme}
                        onChange={(e) => handlePreferenceChange('theme', e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                      </select>
                    </div>

                    {/* View Mode Selection */}
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Default Chat View
                      </label>
                      <select
                        value={userSession.preferences.chatViewMode}
                        onChange={(e) => handlePreferenceChange('chatViewMode', e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      >
                        <option value="tabs">Tabs</option>
                        <option value="quad">Quad View</option>
                        <option value="comparison">Comparison</option>
                      </select>
                    </div>

                    {/* Auto Save */}
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Auto Save Sessions
                      </label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={userSession.preferences.autoSave}
                          onChange={(e) => handlePreferenceChange('autoSave', e.target.checked)}
                        />
                        <div className={`w-11 h-6 bg-gray-200 rounded-full peer ${userSession.preferences.autoSave ? 'peer-checked:bg-cyan-600' : ''}`}>
                          <div className={`dot absolute top-[2px] left-[2px] bg-white border border-gray-300 rounded-full h-5 w-5 transition-transform ${userSession.preferences.autoSave ? 'translate-x-full' : ''}`} />
                        </div>
                      </label>
                    </div>

                    {/* Notification Settings */}
                    <div className="space-y-3">
                      <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">
                        Notifications
                      </h4>
                      
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-gray-700 dark:text-gray-300">
                          Browser Notifications
                        </label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={userSession.preferences.notifications.browser}
                            onChange={(e) => handlePreferenceChange('notifications', {
                              ...userSession.preferences.notifications,
                              browser: e.target.checked
                            })}
                          />
                          <div className={`w-11 h-6 bg-gray-200 rounded-full peer ${userSession.preferences.notifications.browser ? 'peer-checked:bg-cyan-600' : ''}`}>
                            <div className={`dot absolute top-[2px] left-[2px] bg-white border border-gray-300 rounded-full h-5 w-5 transition-transform ${userSession.preferences.notifications.browser ? 'translate-x-full' : ''}`} />
                          </div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-gray-700 dark:text-gray-300">
                          API Alerts
                        </label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={userSession.preferences.notifications.apiAlerts}
                            onChange={(e) => handlePreferenceChange('notifications', {
                              ...userSession.preferences.notifications,
                              apiAlerts: e.target.checked
                            })}
                          />
                          <div className={`w-11 h-6 bg-gray-200 rounded-full peer ${userSession.preferences.notifications.apiAlerts ? 'peer-checked:bg-cyan-600' : ''}`}>
                            <div className={`dot absolute top-[2px] left-[2px] bg-white border border-gray-300 rounded-full h-5 w-5 transition-transform ${userSession.preferences.notifications.apiAlerts ? 'translate-x-full' : ''}`} />
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </Tabs.Content>

                {/* API Keys Tab */}
                <Tabs.Content value="apikeys" className="space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                      Add API Key
                    </h3>
                    
                    <form onSubmit={handleApiKeySubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Provider
                        </label>
                        <select
                          value={apiKeyForm.providerId}
                          onChange={(e) => setApiKeyForm({ ...apiKeyForm, providerId: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          required
                        >
                          <option value="">Select Provider</option>
                          <option value="openai">OpenAI</option>
                          <option value="anthropic">Anthropic</option>
                          <option value="openrouter">OpenRouter</option>
                          <option value="grok">Grok</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          API Key
                        </label>
                        <input
                          type="password"
                          value={apiKeyForm.apiKey}
                          onChange={(e) => setApiKeyForm({ ...apiKeyForm, apiKey: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          placeholder="Enter your API key"
                          required
                        />
                      </div>
                      
                      <button
                        type="submit"
                        className="w-full bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
                      >
                        Store API Key
                      </button>
                    </form>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                      Configured Providers
                    </h3>
                    
                    <div className="space-y-2">
                      {Object.entries(userSession.preferences.apiKeys).map(([providerId, apiKey]) => (
                        <div key={providerId} className="flex items-center justify-between p-3 bg-white dark:bg-gray-600 rounded-md">
                          <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-green-500 rounded-full" />
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {providerId.charAt(0).toUpperCase() + providerId.slice(1)}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            ••••••••{apiKey.slice(-4)}
                          </span>
                        </div>
                      ))}
                      
                      {Object.keys(userSession.preferences.apiKeys).length === 0 && (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          No API keys configured yet
                        </div>
                      )}
                    </div>
                  </div>
                </Tabs.Content>
              </div>
            </Tabs.Root>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default UserDashboard;