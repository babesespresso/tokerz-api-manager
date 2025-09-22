
import React, { useState, useEffect } from 'react'
import { useApiKeys } from '../hooks/useApiKeys'
import { getProviderConfig, formatUsage } from '../utils/providerConfig'
import {Play, Copy, Download, RefreshCw, Settings, Code, Zap, CheckCircle, AlertCircle, Clock} from 'lucide-react'
import toast from 'react-hot-toast'

const ApiTester = () => {
  const { apiKeys, loading } = useApiKeys()
  const [selectedKey, setSelectedKey] = useState<string>('')
  const [testPrompt, setTestPrompt] = useState('Hello, how are you today?')
  const [testResults, setTestResults] = useState<any>(null)
  const [testHistory, setTestHistory] = useState<any[]>([])
  const [testLoading, setTestLoading] = useState(false)
  const [isAdvancedMode, setIsAdvancedMode] = useState(false)
  const [parameters, setParameters] = useState({
    max_tokens: 100,
    temperature: 0.7,
    top_p: 1.0,
    frequency_penalty: 0,
    presence_penalty: 0
  })

  const safeApiKeys = Array.isArray(apiKeys) ? apiKeys : []

  // Real API call functions for each provider
  const makeOpenAICall = async (apiKey: string, prompt: string, params: any) => {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: params.max_tokens,
        temperature: params.temperature,
        top_p: params.top_p,
        frequency_penalty: params.frequency_penalty,
        presence_penalty: params.presence_penalty
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || `OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    return {
      response: data.choices?.[0]?.message?.content || 'No response',
      tokensUsed: data.usage?.total_tokens || 0,
      cost: (data.usage?.total_tokens || 0) * 0.0015 / 1000, // Approximate cost
      model: data.model || 'gpt-3.5-turbo'
    }
  }

  const makeClaudeCall = async (apiKey: string, prompt: string, params: any) => {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: params.max_tokens,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || `Claude API error: ${response.status}`)
    }

    const data = await response.json()
    const inputTokens = data.usage?.input_tokens || 0
    const outputTokens = data.usage?.output_tokens || 0
    const totalTokens = inputTokens + outputTokens

    return {
      response: data.content?.[0]?.text || 'No response',
      tokensUsed: totalTokens,
      cost: (inputTokens * 0.00025 + outputTokens * 0.00125) / 1000,
      model: data.model || 'claude-3-haiku'
    }
  }

  const makeGeminiCall = async (apiKey: string, prompt: string, params: any) => {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: params.max_tokens,
          temperature: params.temperature,
          topP: params.top_p
        }
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || `Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    return {
      response: data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response',
      tokensUsed: data.usageMetadata?.totalTokenCount || 0,
      cost: (data.usageMetadata?.totalTokenCount || 0) * 0.000125 / 1000,
      model: 'gemini-1.5-flash'
    }
  }

  const makeDeepSeekCall = async (apiKey: string, prompt: string, params: any) => {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: params.max_tokens,
        temperature: params.temperature,
        top_p: params.top_p,
        frequency_penalty: params.frequency_penalty,
        presence_penalty: params.presence_penalty
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || `DeepSeek API error: ${response.status}`)
    }

    const data = await response.json()
    return {
      response: data.choices?.[0]?.message?.content || 'No response',
      tokensUsed: data.usage?.total_tokens || 0,
      cost: (data.usage?.total_tokens || 0) * 0.0014 / 1000,
      model: data.model || 'deepseek-chat'
    }
  }

  const handleTest = async () => {
    if (!selectedKey || !testPrompt.trim()) {
      toast.error('Please select an API key and enter a prompt')
      return
    }

    const selectedApiKey = safeApiKeys.find(key => key._id === selectedKey)
    if (!selectedApiKey) {
      toast.error('Selected API key not found')
      return
    }

    setTestLoading(true)
    
    try {
      let result: any

      // Get the actual API key (stored in encrypted_key field)
      const actualApiKey = selectedApiKey.encrypted_key

      // Make real API call based on provider
      switch (selectedApiKey.provider.toLowerCase()) {
        case 'openai':
        case 'openai-gpt4o':
        case 'openai-gpt41':
        case 'openai-gpt41-mini':
        case 'openai-gpt41-nano':
        case 'openai-o3':
        case 'openai-o4-mini':
        case 'openai-o4-mini-high':
          result = await makeOpenAICall(actualApiKey, testPrompt, parameters)
          break

        case 'claude':
        case 'claude-3-5-sonnet':
        case 'claude-3-haiku':
          result = await makeClaudeCall(actualApiKey, testPrompt, parameters)
          break

        case 'gemini':
        case 'gemini-2-flash-exp':
        case 'gemini-1-5-pro':
          result = await makeGeminiCall(actualApiKey, testPrompt, parameters)
          break

        case 'deepseek':
        case 'deepseek-r1':
        case 'deepseek-v3':
          result = await makeDeepSeekCall(actualApiKey, testPrompt, parameters)
          break

        default:
          throw new Error(`Provider ${selectedApiKey.provider} not supported for testing yet`)
      }

      const testResult = {
        success: true,
        response: result.response,
        tokensUsed: result.tokensUsed,
        cost: result.cost,
        provider: selectedApiKey.provider,
        model: result.model
      }

      setTestResults(testResult)
      
      // Add to history
      const historyItem = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        provider: selectedApiKey.provider,
        prompt: testPrompt,
        result: testResult,
        parameters: { ...parameters }
      }
      setTestHistory(prev => [historyItem, ...prev.slice(0, 9)]) // Keep last 10 tests
      
      toast.success('API test completed successfully!')
    } catch (error) {
      console.error('Test error:', error)
      const errorResult = { 
        success: false, 
        error: error instanceof Error ? error.message : 'Test failed' 
      }
      setTestResults(errorResult)
      toast.error(`API test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setTestLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy')
    }
  }

  const exportResults = () => {
    if (!testResults) return
    
    const dataStr = JSON.stringify(testResults, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `api-test-results-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex-1 bg-black flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-8 h-8 animate-spin text-white" />
          <span className="text-xl text-white">Loading API keys...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-black overflow-auto min-h-screen">
      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
            API Tester
          </h1>
          <p className="text-base text-gray-300">
            Test your API keys with real calls to provider endpoints
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Test Configuration */}
          <div className="space-y-6">
            {/* API Key Selection */}
            <div className="bg-gray-900 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Select API Key</h3>
              {safeApiKeys.length > 0 ? (
                <div className="space-y-3">
                  {safeApiKeys.map((key) => {
                    const config = getProviderConfig(key.provider)
                    return (
                      <div
                        key={key._id}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                          selectedKey === key._id
                            ? 'border-blue-500 bg-gray-800'
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                        onClick={() => setSelectedKey(key._id || '')}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-white">{key.key_name}</h4>
                            <p className="text-sm text-gray-400">
                              {config?.displayName || key.provider}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              key.status === 'active'
                                ? 'bg-green-900 text-green-300'
                                : 'bg-gray-800 text-gray-400'
                            }`}>
                              {key.status || 'Active'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Code className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">No API keys available</p>
                  <p className="text-sm">Add API keys to start testing</p>
                </div>
              )}
            </div>

            {/* Test Prompt */}
            <div className="bg-gray-900 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Test Prompt</h3>
              <textarea
                value={testPrompt}
                onChange={(e) => setTestPrompt(e.target.value)}
                placeholder="Enter your test prompt here..."
                className="w-full h-32 px-3 py-2 rounded-lg border-2 bg-black border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none"
              />
              
              {/* Quick Prompts */}
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-300 mb-2">Quick Prompts:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Hello, how are you?',
                    'Explain quantum computing',
                    'Write a Python function',
                    'Translate to Spanish: Hello world'
                  ].map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => setTestPrompt(prompt)}
                      className="px-3 py-1 text-xs rounded-full bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Advanced Parameters */}
            <div className="bg-gray-900 rounded-xl border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Parameters</h3>
                <button
                  onClick={() => setIsAdvancedMode(!isAdvancedMode)}
                  className="flex items-center gap-2 px-3 py-1 text-sm rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700"
                >
                  <Settings className="w-4 h-4" />
                  {isAdvancedMode ? 'Simple' : 'Advanced'}
                </button>
              </div>
              
              {isAdvancedMode && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Max Tokens: {parameters.max_tokens}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="1000"
                      value={parameters.max_tokens}
                      onChange={(e) => setParameters(prev => ({ ...prev, max_tokens: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Temperature: {parameters.temperature}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={parameters.temperature}
                      onChange={(e) => setParameters(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Top P: {parameters.top_p}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={parameters.top_p}
                      onChange={(e) => setParameters(prev => ({ ...prev, top_p: parseFloat(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
              
              <button
                onClick={handleTest}
                disabled={testLoading || !selectedKey || !testPrompt.trim()}
                className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {testLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                {testLoading ? 'Testing...' : 'Run Real Test'}
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-6">
            {/* Test Results */}
            <div className="bg-gray-900 rounded-xl border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Test Results</h3>
                {testResults && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(testResults, null, 2))}
                      className="p-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700"
                      title="Copy results"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={exportResults}
                      className="p-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700"
                      title="Export results"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              
              {testResults ? (
                <div className="space-y-4">
                  {testResults.error || !testResults.success ? (
                    <div className="p-4 rounded-lg bg-red-900/20 border border-red-700">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        <span className="font-medium text-red-300">Error</span>
                      </div>
                      <p className="text-red-200 text-sm">{testResults.error || 'Test failed'}</p>
                    </div>
                  ) : (
                    <>
                      <div className="p-4 rounded-lg bg-green-900/20 border border-green-700">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-green-400" />
                          <span className="font-medium text-green-300">Response</span>
                        </div>
                        <p className="text-green-100 whitespace-pre-wrap">
                          {testResults.response || 'No response'}
                        </p>
                      </div>
                      
                      {testResults.tokensUsed && (
                        <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-700">
                          <div className="flex items-center gap-2 mb-2">
                            <Zap className="w-5 h-5 text-blue-400" />
                            <span className="font-medium text-blue-300">Usage</span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-blue-200">Tokens Used:</span>
                              <span className="text-white ml-2">{testResults.tokensUsed || 0}</span>
                            </div>
                            <div>
                              <span className="text-blue-200">Cost:</span>
                              <span className="text-white ml-2">${(testResults.cost || 0).toFixed(4)}</span>
                            </div>
                            <div>
                              <span className="text-blue-200">Provider:</span>
                              <span className="text-white ml-2">{testResults.provider || 'Unknown'}</span>
                            </div>
                            <div>
                              <span className="text-blue-200">Model:</span>
                              <span className="text-white ml-2">{testResults.model || 'Unknown'}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <Play className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">No test results yet</p>
                  <p className="text-sm">Run a test to see real API responses here</p>
                </div>
              )}
            </div>

            {/* Test History */}
            <div className="bg-gray-900 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Test History</h3>
              {testHistory.length > 0 ? (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {testHistory.map((test) => (
                    <div key={test.id} className="p-3 rounded-lg bg-gray-800 border border-gray-600">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-300">
                          {getProviderConfig(test.provider)?.displayName || test.provider}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          {new Date(test.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      <p className="text-sm text-gray-400 truncate mb-1">
                        {test.prompt}
                      </p>
                      {test.result.tokensUsed && (
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{test.result.tokensUsed || 0} tokens</span>
                          <span>${(test.result.cost || 0).toFixed(4)}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No test history yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApiTester
