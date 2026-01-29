# 🧪 Bot Chat Test Guide

## ✅ Browser এ Test করার Steps:

### **Step 1: Multiverse Story Join করুন**
1. Browser এ যান: `https://narrativeengine.vercel.app/multiverse`
2. একটি story join করুন
3. Story play page এ যান

### **Step 2: Chat Message Send করুন**
1. Right side এ **Character Chat** panel দেখবেন
2. Input field এ message type করুন: **"What should we do?"**
3. **Send** button click করুন

### **Step 3: Bot Reply Check করুন**
1. **Wait 3-5 seconds** (bot response delay)
2. Chat panel এ scroll down করুন
3. Check করুন:
   - ✅ **Bot reply আছে** = Working!
   - ❌ **Bot reply নেই** = Issue আছে

---

## 🔍 Debugging Steps:

### **Method 1: Browser Console Check**

1. **F12** press করুন (Developer Tools)
2. **Console** tab open করুন
3. Message send করার পর দেখুন:
   - `[botChat] Processing bot chat for instance...` = Bot chat trigger হয়েছে
   - `[aiBotBrain] Generated response for...` = AI response generate হয়েছে
   - `[aiBotBrain] No OPENAI_API_KEY found` = API key নেই

### **Method 2: Network Tab Check**

1. **F12** → **Network** tab
2. Message send করুন
3. Look for:
   - `POST /api/multiverse/instances/[id]/chat` = Message sent
   - Status: `200` = Success
   - Response time দেখুন

### **Method 3: Vercel Logs Check**

1. **Vercel Dashboard** → Your Project
2. **Deployments** → Latest deployment
3. **Functions** → **View Function Logs**
4. Message send করার পর logs দেখুন:
   - `[botChat] Processing bot chat...`
   - `[aiBotBrain] Generated response...`
   - Errors থাকলে দেখবেন

---

## 🐛 Common Issues:

### **Issue 1: Bot Reply নেই**
**Possible Causes:**
- API key নেই (fallback responses use করছে)
- Bot chat trigger হয়নি
- Delay বেশি (5+ seconds wait করুন)

**Solution:**
1. Vercel logs check করুন
2. Console check করুন
3. 10 seconds wait করুন

### **Issue 2: Simple Responses পাচ্ছেন**
**Meaning:**
- API key নেই বা invalid
- Fallback responses use হচ্ছে

**Solution:**
1. Vercel → Settings → Environment Variables
2. `OPENAI_API_KEY` check করুন
3. Redeploy করুন

### **Issue 3: Chat Messages Load হচ্ছে না**
**Solution:**
1. Browser console check করুন
2. Network tab → Errors দেখুন
3. Refresh করুন

---

## ✅ Success Indicators:

**Bot Chat Working:**
- ✅ Bot replies within 3-5 seconds
- ✅ Responses are intelligent and context-aware
- ✅ Different characters respond differently
- ✅ Console shows: `[aiBotBrain] Generated response`

**Bot Chat Not Working:**
- ❌ No bot reply after 10 seconds
- ❌ Generic responses ("I see...", "Interesting...")
- ❌ Console shows: `[aiBotBrain] No OPENAI_API_KEY found`

---

## 📝 Quick Test Checklist:

1. [ ] Multiverse story join করা হয়েছে
2. [ ] Chat panel visible আছে
3. [ ] Message send করা হয়েছে
4. [ ] 5 seconds wait করা হয়েছে
5. [ ] Bot reply check করা হয়েছে
6. [ ] Console logs check করা হয়েছে
7. [ ] Vercel logs check করা হয়েছে (if needed)

---

## 🚀 Next Steps:

1. **Test করুন** browser এ
2. **Console check করুন** errors আছে কিনা
3. **Vercel logs check করুন** যদি issue থাকে
4. **API key verify করুন** যদি simple responses পাচ্ছেন
