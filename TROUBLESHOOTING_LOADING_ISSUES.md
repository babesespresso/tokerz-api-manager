# 🚨 App Loading Issues - Troubleshooting Guide

## 🆘 **URGENT: 431 Request Header Fields Too Large Error**

If you're getting a **431 error** in normal browser mode but it works in **incognito mode**, this is a browser storage issue. Follow these steps:

### **Step 0: Clear Browser Storage (IMMEDIATE FIX)**
Open browser DevTools (F12) → Console tab → Run:
```javascript
// Clear all storage immediately
localStorage.clear();
sessionStorage.clear();
// Clear cookies
document.cookie.split(";").forEach(c => {
  const eq = c.indexOf("=");
  const name = eq > -1 ? c.substr(0, eq).trim() : c.trim();
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
});
console.log("All browser storage cleared - refresh page now");
```

After running this, **refresh the page** - the 431 error should be resolved.

## 🔍 **Quick Diagnostics:**

Your app is currently running on: `http://localhost:5174/`

### **Step 1: Check the Correct URL**
Make sure you're accessing: **`http://localhost:5174/`** (not 5173 or 5176)

### **Step 2: Clear Browser Cache**
1. **Hard Refresh**: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
2. **Clear Cache**: Developer Tools → Network tab → "Disable cache" checkbox
3. **Incognito Mode**: Try opening in private/incognito browser window

### **Step 3: Check Terminal Output**
Your dev server should show:
```
  VITE v5.4.20  ready in 103 ms
  ➜  Local:   http://localhost:5174/
```

### **Step 4: Restart Development Server**
If still not loading, restart the server:

```bash
# Stop current server (Ctrl+C)
npm run dev
```

### **Step 5: Check for Port Conflicts**
If port 5174 is busy:
```bash
# Kill any process on port 5174
lsof -ti:5174 | xargs kill -9
npm run dev
```

## 🐛 **Specific Loading Issues:**

### **White/Blank Screen:**
- Check browser console for JavaScript errors
- Verify all dependencies installed: `npm install`
- Try: `rm -rf node_modules package-lock.json && npm install`

### **Authentication Loop:**
- Clear localStorage: `localStorage.clear()` in browser console
- Check `.env.local` file exists with correct Supabase credentials

### **Database Connection Issues:**
- Verify Supabase project is active
- Check if you applied the schema correctly
- Test connection in Supabase dashboard

## ✅ **Expected Working State:**

When working correctly, you should see:
- **Dashboard**: "Welcome back, demo@example.com!"
- **Header**: "Demo User" with profile icon
- **Navigation**: Hamburger menu with all pages
- **Console**: Mock authentication messages (normal)

## 🚀 **Quick Fix Commands:**

```bash
# Complete reset (if nothing else works)
npm run dev

# If that doesn't work:
rm -rf node_modules package-lock.json
npm install
npm run dev

# If still issues:
rm -rf .next .vite dist
npm run dev
```

## 🆘 **Still Not Working?**

Share these details:
1. **URL you're trying**: `http://localhost:____/`
2. **Browser console errors**: Press F12 → Console tab
3. **Terminal output**: What does `npm run dev` show?
4. **Browser/OS**: What browser and operating system?

The profile image upload functionality is ready - we just need to get your app loading properly first! 🎯
