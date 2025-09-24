// Simple proxy server for API testing
// This bypasses CORS by making API calls from the server instead of browser

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();

// Enable CORS for your frontend
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());

// Proxy endpoint for Claude API
app.post('/api/claude', async (req, res) => {
  try {
    console.log('🧪 Proxying Claude API request...');
    
    const { apiKey, ...requestBody } = req.body;
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📡 Claude response status:', response.status);

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Claude API error:', data);
      return res.status(response.status).json(data);
    }

    console.log('✅ Claude API success');
    res.json(data);
  } catch (error) {
    console.error('💥 Proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Proxy endpoint for OpenAI API
app.post('/api/openai', async (req, res) => {
  try {
    console.log('🧪 Proxying OpenAI API request...');
    
    const { apiKey, ...requestBody } = req.body;
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📡 OpenAI response status:', response.status);

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ OpenAI API error:', data);
      return res.status(response.status).json(data);
    }

    console.log('✅ OpenAI API success');
    res.json(data);
  } catch (error) {
    console.error('💥 Proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Proxy endpoint for DeepSeek API
app.post('/api/deepseek', async (req, res) => {
  try {
    console.log('🧪 Proxying DeepSeek API request...');
    
    const { apiKey, ...requestBody } = req.body;
    
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📡 DeepSeek response status:', response.status);

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ DeepSeek API error:', data);
      return res.status(response.status).json(data);
    }

    console.log('✅ DeepSeek API success');
    res.json(data);
  } catch (error) {
    console.error('💥 Proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Proxy endpoint for Gemini API
app.post('/api/gemini', async (req, res) => {
  try {
    console.log('🧪 Proxying Gemini API request...');
    
    const { apiKey, ...requestBody } = req.body;
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📡 Gemini response status:', response.status);

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Gemini API error:', data);
      return res.status(response.status).json(data);
    }

    console.log('✅ Gemini API success');
    res.json(data);
  } catch (error) {
    console.error('💥 Proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'API Proxy Server is running' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 API Proxy Server running on port ${PORT}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   POST http://localhost:${PORT}/api/claude`);
  console.log(`   POST http://localhost:${PORT}/api/openai`);
  console.log(`   POST http://localhost:${PORT}/api/deepseek`);
  console.log(`   POST http://localhost:${PORT}/api/gemini`);
  console.log(`   GET  http://localhost:${PORT}/health`);
});
