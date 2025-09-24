const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 3001;

// Enable CORS for your frontend
app.use(cors({
  origin: 'http://localhost:5173', // Your Vite dev server
  credentials: true
}));

app.use(express.json());

// ElevenLabs TTS endpoint
app.post('/api/elevenlabs/text-to-speech', async (req, res) => {
  try {
    const { text, apiKey, voiceId = '21m00Tcm4TlvDq8ikWAM' } = req.body;

    console.log('🎵 Making real ElevenLabs API call...');
    
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
          style: 0.0,
          use_speaker_boost: true
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('ElevenLabs API error:', error);
      return res.status(response.status).json({ 
        error: `ElevenLabs API error: ${response.status} - ${error}` 
      });
    }

    // Get the audio blob and convert to base64
    const audioBuffer = await response.buffer();
    const audioBase64 = audioBuffer.toString('base64');

    res.json({
      success: true,
      audioBase64: audioBase64,
      contentType: 'audio/mpeg',
      message: `✅ Real ElevenLabs audio generated for: "${text}"`
    });

  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: `Proxy server error: ${error.message}` 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🎵 ElevenLabs proxy server running on http://localhost:${PORT}`);
  console.log('📡 Ready to make real ElevenLabs API calls!');
});
