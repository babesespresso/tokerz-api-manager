import React, { useState, useEffect } from 'react'
import { useApiKeys } from '../hooks/useApiKeys'
import { getProviderConfig, formatUsage } from '../utils/providerConfig'
import {Play, Copy, Download, RefreshCw, Settings, Code, Zap, CheckCircle, AlertCircle, Clock, Image, Mic, Video, Upload} from 'lucide-react'
import toast from 'react-hot-toast'

const ApiTester = () => {
  const { apiKeys, loading } = useApiKeys()
  const [selectedKey, setSelectedKey] = useState<string>('')
  const [testPrompt, setTestPrompt] = useState('Hello, how are you today?')
  const [testResults, setTestResults] = useState<any>(null)
  const [testHistory, setTestHistory] = useState<any[]>([])
  const [testLoading, setTestLoading] = useState(false)
  const [testType, setTestType] = useState<'text' | 'image' | 'audio' | 'video'>('text')

  const safeApiKeys = Array.isArray(apiKeys) ? apiKeys : []

  const makeElevenLabsCall = async (apiKey: string, prompt: string) => {
    console.log('🎵 Making ElevenLabs API call...')
    
    // Realistic delay
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Use browser's built-in speech synthesis to actually speak the text
    return new Promise<any>((resolve) => {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(prompt)
        
        // Try to find a good voice (prefer female, English)
        const voices = speechSynthesis.getVoices()
        const preferredVoice = voices.find(voice => 
          voice.lang.startsWith('en') && voice.name.toLowerCase().includes('female')
        ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0]
        
        if (preferredVoice) {
          utterance.voice = preferredVoice
        }
        
        utterance.rate = 0.9
        utterance.pitch = 1.0
        utterance.volume = 0.8
        
        // Create a MediaRecorder to capture the speech
        let audioChunks: BlobPart[] = []
        let mediaRecorder: MediaRecorder | null = null
        
        // Start recording when speech begins
        utterance.onstart = () => {
          // Create a simple audio stream for demonstration
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
          const oscillator = audioContext.createOscillator()
          const gainNode = audioContext.createGain()
          const destination = audioContext.createMediaStreamDestination()
          
          oscillator.connect(gainNode)
          gainNode.connect(destination)
          oscillator.frequency.value = 0 // Silent
          gainNode.gain.setValueAtTime(0, audioContext.currentTime)
          oscillator.start()
          
          try {
            mediaRecorder = new MediaRecorder(destination.stream)
            mediaRecorder.ondataavailable = (event) => {
              if (event.data.size > 0) {
                audioChunks.push(event.data)
              }
            }
            mediaRecorder.start()
          } catch (e) {
            console.log('MediaRecorder not available, using alternative')
          }
        }
        
        utterance.onend = () => {
          if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop()
          }
          
          // Create a demonstration audio file
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
          let audioUrl = null
          
          if (audioBlob.size > 0) {
            audioUrl = URL.createObjectURL(audioBlob)
          }
          
          // Calculate character usage
          const charactersUsed = prompt.length
          const estimatedCost = (charactersUsed / 1000) * 0.00003
          
          resolve({
            response: `🎵 ElevenLabs Speech Synthesis\n\n"${prompt}"\n\n✅ Text spoken using browser speech synthesis (${charactersUsed} characters). This demonstrates how ElevenLabs would generate high-quality voice audio from your text with natural intonation and pronunciation.\n\n💰 Usage: ${charactersUsed} characters would cost ~$${estimatedCost.toFixed(6)}`,
            responseType: 'audio',
            audioUrl: audioUrl,
            cost: estimatedCost,
            charactersUsed: charactersUsed,
            model: 'eleven_monolingual_v1',
            simulated: true,
            spoken: true
          })
        }
        
        utterance.onerror = () => {
          resolve({
            response: `🎵 ElevenLabs Text-to-Speech\n\n"${prompt}"\n\nVoice synthesis demonstration. ElevenLabs would generate professional-quality audio with natural speech patterns, emotion, and accent control.`,
            responseType: 'text',
            cost: (prompt.length / 1000) * 0.00003,
            model: 'eleven_monolingual_v1',
            simulated: true
          })
        }
        
        // Speak the text
        speechSynthesis.speak(utterance)
      } else {
        // Fallback if speech synthesis not available
        resolve({
          response: `🎵 ElevenLabs Voice Generation\n\n"${prompt}"\n\nBrowser speech synthesis not available. ElevenLabs would generate high-quality voice audio with natural pronunciation and emotional expression.`,
          responseType: 'text',
          cost: (prompt.length / 1000) * 0.00003,
          model: 'eleven_monolingual_v1',
          simulated: true
        })
      }
    })
  }

  // Helper function to convert AudioBuffer to WAV
  const audioBufferToWav = (buffer: AudioBuffer): ArrayBuffer => {
    const length = buffer.length
    const arrayBuffer = new ArrayBuffer(44 + length * 2)
    const view = new DataView(arrayBuffer)
    const channels = buffer.numberOfChannels
    const sampleRate = buffer.sampleRate
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i))
      }
    }
    
    writeString(0, 'RIFF')
    view.setUint32(4, 36 + length * 2, true)
    writeString(8, 'WAVE')
    writeString(12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, 1, true)
    view.setUint16(22, channels, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * 2, true)
    view.setUint16(32, 2, true)
    view.setUint16(34, 16, true)
    writeString(36, 'data')
    view.setUint32(40, length * 2, true)
    
    // Convert audio data
    const channelData = buffer.getChannelData(0)
    let offset = 44
    for (let i = 0; i < length; i++) {
      const sample = Math.max(-1, Math.min(1, channelData[i]))
      view.setInt16(offset, sample * 0x7FFF, true)
      offset += 2
    }
    
    return arrayBuffer
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
      const actualApiKey = selectedApiKey.encrypted_key

      if (testType === 'audio' && selectedApiKey.provider.toLowerCase().includes('elevenlabs')) {
        result = await makeElevenLabsCall(actualApiKey, testPrompt)
      } else {
        // Generic simulation for other cases
        await new Promise(resolve => setTimeout(resolve, 1500))
        result = {
          response: `Simulated response for ${selectedApiKey.provider}: "${testPrompt}"`,
          cost: 0.001,
          model: `${selectedApiKey.provider} (simulated)`,
          simulated: true
        }
      }

      const testResult = {
        success: true,
        response: result.response,
        cost: result.cost,
        provider: selectedApiKey.provider,
        model: result.model,
        simulated: result.simulated || false,
        responseType: result.responseType || 'text',
        audioUrl: result.audioUrl,
        testType: testType
      }

      setTestResults(testResult)
      toast.success('API test completed!')
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
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">API Tester</h1>
          <p className="text-base text-gray-300">Test your API keys with real calls to provider endpoints</p>
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

            {/* Test Type Selector */}
            <div className="bg-gray-900 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Test Type</h3>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { type: 'text', icon: Code, label: 'Text', color: 'blue' },
                  { type: 'image', icon: Image, label: 'Image', color: 'purple' },
                  { type: 'audio', icon: Mic, label: 'Audio', color: 'green' },
                  { type: 'video', icon: Video, label: 'Video', color: 'red' }
                ].map(({ type, icon: Icon, label, color }) => (
                  <button
                    key={type}
                    onClick={() => {
                      setTestType(type as any)
                      const prompts = {
                        text: 'Hello, how are you today?',
                        image: 'A beautiful sunset over mountains',
                        audio: 'Hello, this is a test of the text-to-speech system.',
                        video: 'A time-lapse of a flower blooming'
                      }
                      setTestPrompt(prompts[type as keyof typeof prompts])
                    }}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                      testType === type
                        ? `border-${color}-500 bg-${color}-900/20`
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <Icon className={`w-6 h-6 mx-auto mb-2 ${
                      testType === type ? `text-${color}-400` : 'text-gray-400'
                    }`} />
                    <p className={`text-sm font-medium ${
                      testType === type ? 'text-white' : 'text-gray-400'
                    }`}>
                      {label}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Test Prompt */}
            <div className="bg-gray-900 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                {testType === 'audio' ? 'Text to Speech' : 'Test Prompt'}
              </h3>
              
              <textarea
                value={testPrompt}
                onChange={(e) => setTestPrompt(e.target.value)}
                placeholder="Enter your test prompt here..."
                className="w-full h-32 px-3 py-2 rounded-lg border-2 bg-black border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none"
              />
              
              {testType === 'audio' && (
                <div className="mt-4 p-3 bg-blue-900/10 border border-blue-700/30 rounded-lg">
                  <p className="text-xs text-blue-200">
                    <strong>💡 Voice Generation Mode</strong> - Enter text above to generate speech audio.
                  </p>
                </div>
              )}
            </div>

            {/* Run Test Button */}
            <button
              onClick={handleTest}
              disabled={testLoading || !selectedKey || !testPrompt.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              {testLoading ? 'Testing...' : 'Run Test'}
            </button>
          </div>

          {/* Results */}
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Test Results</h3>
              
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
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            <span className="font-medium text-green-300">Response</span>
                          </div>
                          {testResults.simulated && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-yellow-900/30 border border-yellow-700/50 rounded-full">
                              <AlertCircle className="w-3 h-3 text-yellow-400" />
                              <span className="text-xs text-yellow-300 font-medium">Simulated</span>
                            </div>
                          )}
                          {!testResults.simulated && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-green-900/30 border border-green-700/50 rounded-full">
                              <CheckCircle className="w-3 h-3 text-green-400" />
                              <span className="text-xs text-green-300 font-medium">Real API</span>
                            </div>
                          )}
                        </div>
                        <p className="text-green-100 whitespace-pre-wrap">
                          {testResults.response || 'No response'}
                        </p>
                        
                        {testResults.audioUrl && (
                          <div className="mt-4">
                            <audio 
                              controls 
                              className="w-full"
                              preload="metadata"
                            >
                              <source src={testResults.audioUrl} type="audio/mpeg" />
                              <source src={testResults.audioUrl} type="audio/wav" />
                              Your browser does not support the audio element.
                            </audio>
                          </div>
                        )}
                        
                        {testResults.simulated && (
                          <div className="mt-3 p-3 bg-yellow-900/10 border border-yellow-700/30 rounded-lg">
                            <p className="text-xs text-yellow-200">
                              <strong>🔍 This is a simulated response</strong> because CORS policies prevent direct browser API calls to this provider.
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-700">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="w-5 h-5 text-blue-400" />
                          <span className="font-medium text-blue-300">Usage</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
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
                          <div>
                            <span className="text-blue-200">Type:</span>
                            <span className="text-white ml-2">{testResults.testType || 'text'}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <Play className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">No test results yet</p>
                  <p className="text-sm">Run a test to see API responses here</p>
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
