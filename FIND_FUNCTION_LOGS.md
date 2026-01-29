# 🔍 Vercel Function Logs খুঁজে বের করার Guide

## ❌ আপনি এখন General Logs দেখছেন

**Current Location:** Project → **Logs** tab
- এখানে শুধু HTTP requests দেখা যায়
- Function internal `console.log` দেখা যায় না

---

## ✅ Function Logs কোথায় পাবেন:

### **Method 1: Deployments Tab (Recommended)**

1. **Vercel Dashboard** → Your Project
2. **Deployments** tab click করুন (top menu)
3. **Latest deployment** click করুন (সবচেয়ে উপরে)
4. Scroll down করুন
5. **"Functions"** section দেখবেন
6. `/api/multiverse/instances/[instanceId]/chat` function খুঁজুন
7. **"View Function Logs"** বা **"Logs"** button click করুন

### **Method 2: Direct URL**

```
https://vercel.com/[your-team]/narrative-engine/[deployment-id]/functions
```

---

## 🧪 Test করার Steps:

### **Step 1: Browser এ Message Send করুন**
1. Multiverse story page open করুন
2. Chat এ message type করুন: **"test"**
3. **Send** click করুন

### **Step 2: Browser Network Tab Check করুন**
1. **F12** press করুন
2. **Network** tab open করুন
3. **POST** request খুঁজুন: `/api/multiverse/instances/[id]/chat`
4. Status check করুন: `200` হওয়া উচিত

### **Step 3: Vercel Function Logs Check করুন**
1. **Deployments** → Latest → **Functions**
2. `/api/.../chat` function → **Logs**
3. **Wait 10-15 seconds** (logs delay হতে পারে)
4. **Refresh** করুন
5. দেখুন:
   - `[chat] Triggering bot chat...`
   - `[botChat] Processing bot chat...`

---

## 🐛 যদি Function Logs না দেখেন:

### **Issue 1: POST Request হচ্ছে না**
**Check:**
- Browser Network tab → POST request আছে?
- Status `200`?
- Error আছে?

**Solution:**
- Frontend code check করুন
- API endpoint correct আছে?

### **Issue 2: Function Logs Empty**
**Possible Causes:**
- Function execute হয়নি
- Logs delay (10-30 seconds wait করুন)
- Wrong deployment check করছেন

**Solution:**
- Latest deployment check করুন
- Wait and refresh করুন

### **Issue 3: Function Not Found**
**Check:**
- Deployment successful হয়েছে?
- Function build হয়েছে?

**Solution:**
- Redeploy করুন
- Build logs check করুন

---

## 📝 Expected Logs:

**When Message Sent:**
```
[chat] Triggering bot chat for instance aab6232a-8069-4ebb-9690-8d1035757393 after 4234ms delay
```

**When Bot Processing:**
```
[botChat] Processing bot chat for instance aab6232a-8069-4ebb-9690-8d1035757393
[botChat] Found 2 bot(s) in instance aab6232a-8069-4ebb-9690-8d1035757393
```

**When AI Generating:**
```
[aiBotBrain] Generated response for আবির: I think we should investigate this call...
```

**When Bot Message Saved:**
```
[botChat] ✅ Bot bot_123 (আবির) sent: I think we should investigate this call...
```

---

## 🎯 Quick Checklist:

- [ ] Browser এ message send করা হয়েছে
- [ ] Network tab → POST request `200` status
- [ ] Vercel → Deployments tab open করা হয়েছে
- [ ] Latest deployment click করা হয়েছে
- [ ] Functions section scroll down করা হয়েছে
- [ ] `/api/.../chat` function খুঁজে পাওয়া গেছে
- [ ] Function Logs open করা হয়েছে
- [ ] 10-15 seconds wait করা হয়েছে
- [ ] Logs refresh করা হয়েছে
- [ ] `[botChat]` বা `[aiBotBrain]` messages দেখা যাচ্ছে

---

## 🔧 Alternative: Vercel CLI

Real-time logs এর জন্য:

```bash
npm i -g vercel
vercel login
vercel logs --follow
```

এটা real-time সব logs দেখাবে।

---

**Most Important:** 
1. **Deployments** tab use করুন (NOT Logs tab)
2. **Functions** section → specific function → **Logs**
3. **Wait 10-15 seconds** before checking
