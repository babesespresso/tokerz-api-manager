# 🎵 ElevenLabs Proxy Server Setup Guide

## ⚡ Quick Setup (3 steps)

### Step 1: Install Dependencies
```bash
npm install express cors node-fetch
```

### Step 2: Start the Proxy Server
```bash
node elevenlabs-proxy.js
```

**✅ Success:** You should see:
```
🎵 ElevenLabs proxy server running on http://localhost:3001
📡 Ready to make real ElevenLabs API calls!
```

### Step 3: Test ElevenLabs in Your App
1. **Keep the proxy server running** (don't close the terminal)
2. **Go to your API Tester page** (localhost:5173 or localhost:5175)
3. **Select ElevenLabs API key**
4. **Choose "Audio" test type**
5. **Enter text**: "Hello, this is a test!"
6. **Click "Run Test"**
7. **✅ Get real ElevenLabs audio!**

## 🚨 Important Notes

### ❌ localhost:3001 Won't Show a Website
- **This is normal!** The proxy server is an API, not a website
- **Don't open localhost:3001 in browser** - it's just an API endpoint
- **The magic happens** when your API Tester calls the proxy

### ✅ How to Know It's Working
**In Terminal (where proxy runs):**
```
🎵 ElevenLabs proxy server running on http://localhost:3001
📡 Ready to make real ElevenLabs API calls!
🎵 Making real ElevenLabs API call...  // <- When you test
```

**In Your API Tester:**
- **Green "Real API" badge** (instead of yellow "Simulated")
- **Actual audio player** with ElevenLabs generated voice
- **Success message**: "✅ REAL ElevenLabs audio generated!"

## 🔧 Troubleshooting

### Problem: "npm install" fails
**Solution:**
```bash
# Try with --legacy-peer-deps
npm install express cors node-fetch --legacy-peer-deps

# Or use yarn
yarn add express cors node-fetch
```

### Problem: Port 3001 already in use
**Error:** `EADDRINUSE: address already in use`

**Solution:**
```bash
# Check what's using port 3001
lsof -i :3001

# Kill the process (replace PID with actual number)
kill -9 PID

# Or change port in elevenlabs-proxy.js
const PORT = 3002; // Change this line
```

### Problem: CORS still blocking
**Check:** Is your Vite dev server on port 5173 or 5175?

**Fix:** Update elevenlabs-proxy.js:
```javascript
app.use(cors({
  origin: 'http://localhost:5175', // <- Change to match your port
  credentials: true
}));
```

### Problem: ElevenLabs API key invalid
**Error:** "API error: 401 Unauthorized"

**Check:**
1. **API key format**: Should start with your ElevenLabs API key format
2. **API key permissions**: Ensure it has TTS access
3. **Account balance**: Check ElevenLabs dashboard for credits

## 📁 File Structure
```
your-project/
├── elevenlabs-proxy.js          # <- Proxy server
├── src/pages/ApiTester.tsx      # <- Your API tester
└── package.json                 # <- Add dependencies here
```

## 🎯 Complete Workflow

1. **Terminal 1** (Proxy Server):
   ```bash
   node elevenlabs-proxy.js
   # Keep this running!
   ```

2. **Terminal 2** (Your App):
   ```bash
   npm run dev
   # Your normal dev server
   ```

3. **Browser**:
   - Go to your API Tester page
   - Test ElevenLabs with real audio generation!

## 💡 Pro Tips

- **Keep proxy running** - Don't close the terminal
- **Check console logs** - Both proxy and browser show helpful debug info
- **Test with short text first** - "Hello world" works great
- **Real costs apply** - ElevenLabs charges per character when using real API

## 🎵 Expected Result

When working correctly, you'll get:
- **Real ElevenLabs voice** in your browser's audio player
- **Green "Real API" badge** in the results
- **Audio file you can play/download**
- **Actual API costs** (very small for testing)

---

**🚀 Ready to test? Start the proxy server and enjoy real ElevenLabs voice generation!**
