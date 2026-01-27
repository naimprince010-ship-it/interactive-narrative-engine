# AI Bot Brain Setup Guide

## 🤖 AI-Powered Bot Responses

The bot chat system now uses **OpenAI GPT-3.5-turbo** to generate intelligent, context-aware responses that feel like real human conversations.

---

## 🔑 Environment Variable Setup

### **Step 1: Get OpenAI API Key**

1. Go to: https://platform.openai.com/api-keys
2. Sign up or log in
3. Click **"Create new secret key"**
4. Copy the key (starts with `sk-...`)

### **Step 2: Add to Vercel**

1. Go to **Vercel Dashboard** → Your Project
2. **Settings** → **Environment Variables**
3. Add new variable:
   - **Name**: `OPENAI_API_KEY`
   - **Value**: `sk-...` (your API key)
   - **Environment**: Production, Preview, Development (select all)
4. **Save**
5. **Redeploy** your project

### **Step 3: Local Development (.env.local)**

Create `C:\Users\User\itinteractive-narrative-engine\.env.local`:

```env
OPENAI_API_KEY=sk-your-key-here
```

---

## 🧠 How It Works

### **AI Bot Brain Features:**

1. **Character-Aware**: Understands each character's personality and description
2. **Story Context**: Knows the current story scene and situation
3. **Conversation History**: Remembers recent messages for natural flow
4. **User Response**: Responds intelligently to user messages
5. **Natural Language**: Mix of English and Bengali, short and conversational

### **Example:**

**User says:** "What should we do?"

**Bot (আবির - tech-savvy):** "I think we should trace the number first. Something feels off about this call."

**Bot (নীলা - creative):** "There's a deeper meaning here. Let's think about what the caller really wants."

---

## 💰 Cost Considerations

- **Model**: GPT-3.5-turbo (cheap and fast)
- **Max Tokens**: 100 per response (keeps it short)
- **Estimated Cost**: ~$0.001-0.002 per bot message
- **Fallback**: If API key is missing, uses simple predefined responses

---

## 🔧 Configuration

### **Model Settings** (in `lib/multiverse/aiBotBrain.ts`):

```typescript
model: 'gpt-3.5-turbo',  // Can change to 'gpt-4' for better quality (more expensive)
max_tokens: 100,          // Response length
temperature: 0.8,         // Creativity (0-1)
```

### **Response Length:**
- Kept short (1-2 sentences) for natural chat feel
- Adjust `max_tokens` if needed

---

## ✅ Testing

1. **Without API Key**: Bots use fallback responses (still works)
2. **With API Key**: Bots generate intelligent, context-aware responses
3. **Check Logs**: Look for `[aiBotBrain]` in Vercel logs

---

## 🚀 Deployment

After adding `OPENAI_API_KEY` to Vercel:

1. **Redeploy** your project
2. Test in a multiverse story
3. Send a chat message
4. Bot should respond intelligently within 3-5 seconds

---

## 📝 Notes

- **Privacy**: Messages are sent to OpenAI API (check their privacy policy)
- **Rate Limits**: OpenAI has rate limits (usually fine for normal usage)
- **Error Handling**: Falls back to simple responses if AI fails
- **Cost**: Monitor usage in OpenAI dashboard

---

## 🆘 Troubleshooting

**Bot not responding intelligently?**
- Check if `OPENAI_API_KEY` is set in Vercel
- Check Vercel logs for errors
- Verify API key is valid in OpenAI dashboard

**Too expensive?**
- Use `gpt-3.5-turbo` (already set)
- Reduce `max_tokens` further
- Add more fallback responses

**Want better quality?**
- Change model to `gpt-4` (more expensive)
- Increase `max_tokens` to 150-200
- Adjust `temperature` to 0.7-0.9
