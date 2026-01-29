# 🔍 Vercel Logs Check Guide

## ❌ Problem: Logs এ `[botChat]` messages দেখা যাচ্ছে না

## 🔍 Important: Function Logs vs General Logs

Vercel এ **দুই ধরনের logs** আছে:

### **1. General Logs (যা আপনি দেখছেন):**
- **Location**: Project → Logs tab
- **Shows**: HTTP requests (GET, POST)
- **Doesn't Show**: Function internal `console.log` statements

### **2. Function Logs (যেখানে bot chat logs থাকবে):**
- **Location**: Deployments → Specific Deployment → Functions → View Function Logs
- **Shows**: All `console.log` from API routes
- **This is where you'll see**: `[botChat]`, `[aiBotBrain]` messages

---

## ✅ Correct Way to Check Bot Chat Logs:

### **Step 1: Go to Deployments**
1. Vercel Dashboard → Your Project
2. **Deployments** tab (NOT Logs tab)
3. Click on **latest deployment** (most recent one)

### **Step 2: View Function Logs**
1. Scroll down to **"Functions"** section
2. Find: `/api/multiverse/instances/[instanceId]/chat`
3. Click **"View Function Logs"** or **"Logs"** button

### **Step 3: Send Message and Check**
1. Browser এ message send করুন
2. Function logs এ refresh করুন
3. দেখুন:
   - `[chat] Triggering bot chat...`
   - `[botChat] Processing bot chat...`
   - `[aiBotBrain] Generated response...`

---

## 🎯 Alternative: Real-time Logs

### **Method 1: Vercel CLI (Best for Real-time)**
```bash
npm i -g vercel
vercel logs --follow
```

### **Method 2: Deployment Logs**
1. Deployments → Latest deployment
2. Click on deployment
3. **"Logs"** tab
4. Filter by: `/api/multiverse/instances`

---

## 🐛 Why Logs Might Not Show:

### **Issue 1: Wrong Logs Tab**
- ❌ Using "Logs" tab (general logs)
- ✅ Use "Deployments" → Function logs

### **Issue 2: Function Not Called**
- Check Network tab in browser
- Verify POST request to `/api/multiverse/instances/[id]/chat`
- Status should be `200`

### **Issue 3: Logs Delayed**
- Vercel logs can take 10-30 seconds
- Wait and refresh

### **Issue 4: Function Failed Early**
- Check for errors in deployment
- Check function status

---

## ✅ Quick Test:

1. **Browser**: Send a chat message
2. **Network Tab**: Verify POST request succeeded
3. **Vercel**: Deployments → Latest → Functions → `/api/.../chat` → Logs
4. **Wait 10 seconds**: Refresh logs
5. **Look for**: `[botChat]` or `[aiBotBrain]` messages

---

## 📝 What to Look For:

**✅ Good Logs:**
```
[chat] Triggering bot chat for instance aab6232a-8069-4ebb-9690-8d1035757393
[botChat] Processing bot chat for instance aab6232a-8069-4ebb-9690-8d1035757393
[botChat] Found 2 bot(s) in instance...
[aiBotBrain] Generated response for আবির: ...
[botChat] ✅ Bot bot_123 (আবির) sent: ...
```

**❌ Bad Logs:**
```
[botChat] No bots found in instance...
[aiBotBrain] No OPENAI_API_KEY found
[botChat] Failed to save bot chat message...
```

---

## 🔧 If Still No Logs:

1. **Check Function Status**: Deployments → Functions → Status
2. **Check Deployment Time**: Make sure latest deployment has your changes
3. **Redeploy**: Force a new deployment
4. **Check Environment**: Make sure you're checking Production logs

---

**Most Important:** Use **Deployments → Functions → Logs**, NOT the general "Logs" tab!
