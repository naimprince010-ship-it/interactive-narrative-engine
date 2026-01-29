# ✅ OpenAI API Key Verification Guide

## 🔍 Vercel এ Check করার উপায়:

### **Method 1: Vercel Dashboard (সবচেয়ে সহজ)**

1. **Vercel Dashboard** → https://vercel.com/dashboard
2. আপনার **project** select করুন
3. **Settings** → **Environment Variables**
4. **Check করুন:**
   - `OPENAI_API_KEY` আছে কিনা
   - Value-তে `sk-` দিয়ে শুরু হচ্ছে কিনা
   - **Environment** সব select করা আছে কিনা (Production, Preview, Development)

### **Method 2: Vercel Logs (Runtime Check)**

1. **Vercel Dashboard** → Your Project
2. **Deployments** tab
3. Latest deployment click করুন
4. **Functions** → **View Function Logs**
5. Chat message send করার পর logs এ দেখুন:
   - ✅ `[aiBotBrain] Generated response for...` = API key কাজ করছে
   - ⚠️ `[aiBotBrain] No OPENAI_API_KEY found, using fallback responses` = API key নেই

### **Method 3: Test in Browser**

1. Multiverse story join করুন
2. Chat এ message send করুন
3. Bot reply করলে:
   - **Intelligent response** (context-aware) = ✅ API key কাজ করছে
   - **Simple response** ("I see...", "Interesting...") = ⚠️ Fallback (API key নেই)

---

## 🧪 Quick Test:

### **Test 1: Check Environment Variable**
Vercel Dashboard → Settings → Environment Variables:
- [ ] `OPENAI_API_KEY` exists
- [ ] Value starts with `sk-`
- [ ] All environments selected

### **Test 2: Check Deployment**
Vercel Dashboard → Deployments:
- [ ] Latest deployment is successful
- [ ] Deployment happened AFTER adding the key
- [ ] If not, click **Redeploy**

### **Test 3: Test Bot Response**
1. Join a multiverse story
2. Send a chat message: "What should we do?"
3. Wait 3-5 seconds
4. Bot should reply with intelligent, context-aware response

---

## 🐛 Common Issues:

### **Issue 1: API Key Added But Not Working**
**Solution:**
- Redeploy your project (Settings → Redeploy)
- Environment variables only apply to NEW deployments

### **Issue 2: Still Getting Fallback Responses**
**Check:**
- API key format: `sk-...` (correct)
- All environments selected (Production, Preview, Development)
- Redeployed after adding key

### **Issue 3: API Key Invalid**
**Solution:**
- Check OpenAI dashboard: https://platform.openai.com/api-keys
- Verify key is active
- Create new key if needed

---

## ✅ Success Indicators:

**API Key Working:**
- Bot responses are intelligent and context-aware
- Different characters respond differently
- Responses relate to story context
- Logs show: `[aiBotBrain] Generated response for...`

**API Key Not Working:**
- Bot responses are generic ("I see...", "Interesting...")
- All bots respond similarly
- Logs show: `[aiBotBrain] No OPENAI_API_KEY found`

---

## 📝 Next Steps:

1. **Verify in Vercel Dashboard** (Method 1)
2. **Redeploy** if key was added recently
3. **Test in browser** (Method 3)
4. **Check logs** if still not working (Method 2)
