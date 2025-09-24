# API Tester Setup Instructions

## CORS Issue Fix for API Testing

The API Tester was experiencing CORS (Cross-Origin Resource Sharing) errors when trying to call external APIs directly from the browser. This is a security feature that prevents websites from making direct API calls to external services.

## Solution: Proxy Server

I've created a simple Node.js proxy server that handles the API calls server-side, bypassing CORS restrictions.

## Quick Setup

### 1. Install Proxy Server Dependencies

```bash
# In your project root directory, install proxy server dependencies
npm install express cors node-fetch@2.6.7
```

### 2. Start the Proxy Server

```bash
# Start the proxy server (runs on port 3001)
node proxy-server.js
```

You should see:
```
🚀 API Proxy Server running on port 3001
📋 Available endpoints:
   POST http://localhost:3001/api/claude
   POST http://localhost:3001/api/openai
   POST http://localhost:3001/api/deepseek
   POST http://localhost:3001/api/gemini
   GET  http://localhost:3001/health
```

### 3. Test Your API Keys

1. **Start your main app** (if not already running):
   ```bash
   npm run dev
   ```

2. **Go to the API Tester page** in your app

3. **Select your Claude API key** (or any other)

4. **Enter a test prompt** (e.g., "Hello, how are you?")

5. **Click "Run Real Test"**

## What's Fixed

✅ **Claude API**: Now works via proxy server (no more CORS errors)
✅ **Real API Calls**: All providers make actual API calls to their endpoints
✅ **Error Handling**: Better error messages and logging
✅ **Usage Tracking**: Token counts and cost calculations
✅ **Test History**: Keep track of all your API tests

## Supported Providers in API Tester

- ✅ **Claude** (via proxy)
- ✅ **OpenAI** (direct)
- ✅ **DeepSeek** (direct) 
- ✅ **Gemini** (direct)
- ✅ **THUDM/GLM** (direct)
- ✅ **Z.ai** (direct)

## Troubleshooting

### Proxy Server Not Starting?
```bash
# Make sure you have the dependencies installed
npm install express cors node-fetch@2.6.7

# Then start the server
node proxy-server.js
```

### API Test Failing?
1. **Check if proxy server is running** (should show "API Proxy Server running on port 3001")
2. **Verify your API key is correct**
3. **Check browser console** for detailed error messages
4. **Ensure your API key has sufficient balance** (for paid providers)

### Port Already in Use?
If port 3001 is already used, you can change it:
```bash
# Set a different port
PORT=3002 node proxy-server.js
```
Then update the API Tester URL from `localhost:3001` to `localhost:3002`.

## Development Mode (Optional)

For development with auto-restart:

```bash
# Install nodemon globally (if not already)
npm install -g nodemon

# Start in development mode
nodemon proxy-server.js
```

## Security Note

This proxy server is for **development/testing purposes only**. In production, you would:
- Add authentication
- Rate limiting
- API key validation
- HTTPS support
- Error handling improvements

## Files Created

- `proxy-server.js` - Main proxy server
- `proxy-package.json` - Dependencies for proxy server
- `API_TESTER_SETUP.md` - These instructions

## Next Steps

1. **Start the proxy server** (`node proxy-server.js`)
2. **Test your Claude API key** in the API Tester
3. **Verify real responses** are being returned
4. **Check usage and cost calculations**

Your API Tester should now work perfectly with all supported providers!
