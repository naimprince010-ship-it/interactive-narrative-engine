# 🚀 Multiverse System Deployment Guide

## ✅ Status: All Changes Committed & Pushed

Latest commit: `feat: complete multiverse interactive storytelling system`

---

## 📋 Pre-Deployment Checklist

Before deploying, make sure:

- [x] ✅ All code committed and pushed to GitHub
- [ ] ⏳ Supabase database schema created (`multiverse_schema.sql` run)
- [ ] ⏳ Test data created (`test_data.sql` run)
- [ ] ⏳ Environment variables configured in Vercel

---

## 🚀 Deploy to Vercel

### **Method 1: Automatic Deploy (GitHub Integration)**

If your project is already connected to Vercel:

1. **Vercel will auto-deploy** when you push to `main` branch
2. Check deployment status: https://vercel.com/dashboard
3. Your project should auto-deploy from the latest commit

### **Method 2: Manual Deploy via Vercel CLI**

```bash
# Install Vercel CLI (if not installed)
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
cd C:\Users\User\itinteractive-narrative-engine
vercel --prod
```

### **Method 3: Deploy via Vercel Dashboard**

1. Go to https://vercel.com/dashboard
2. Click **"Add New Project"** (or select existing project)
3. **Import Git Repository**: `naimprince010-ship-it/interactive-narrative-engine`
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
5. Click **Deploy**

---

## 🔐 Environment Variables Setup

**Important:** Add these in Vercel Dashboard → Settings → Environment Variables:

### **Required Variables:**

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
DATABASE_URL=your_supabase_postgres_connection_string
```

### **How to Get Supabase Keys:**

1. Go to Supabase Dashboard → Your Project
2. **Settings** → **API**
3. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`
4. **Settings** → **Database** → **Connection string** → Copy → `DATABASE_URL`

---

## 📊 Post-Deployment Steps

### **1. Verify Database Schema**

After deployment, verify database is set up:

1. Go to Supabase SQL Editor
2. Run verification query:
   ```sql
   SELECT COUNT(*) FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('stories', 'character_templates', 'story_instances', 
                      'character_assignments', 'story_nodes', 'character_chat', 
                      'user_choices', 'story_state');
   ```
3. Should return: `8`

### **2. Create Test Data**

Run `supabase/test_data.sql` in Supabase SQL Editor to create test story.

### **3. Test Deployment**

1. Visit your Vercel URL: `https://your-project.vercel.app`
2. Go to `/multiverse` page
3. Try joining test story
4. Verify API endpoints work

---

## 🐛 Troubleshooting

### **Build Fails**

**Error:** `Module not found` or `Type errors`

**Solution:**
- Check all imports are correct
- Run `npm install` locally
- Check TypeScript errors: `npm run lint`

### **Runtime Errors**

**Error:** `Database connection failed`

**Solution:**
- Verify `DATABASE_URL` is set in Vercel
- Check Supabase project is active
- Verify RLS policies allow access

### **API Endpoints Not Working**

**Error:** `401 Unauthorized` or `403 Forbidden`

**Solution:**
- Check `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set
- Verify Supabase Auth is configured
- Check RLS policies in Supabase

---

## ✅ Deployment Verification

After deployment, test these:

1. **Homepage loads**: `https://your-project.vercel.app`
2. **Multiverse page**: `https://your-project.vercel.app/multiverse`
3. **API endpoints**: 
   - `POST /api/multiverse/stories/[storyId]/join`
   - `GET /api/multiverse/instances/[instanceId]`
4. **Database connection**: Check Supabase logs

---

## 📝 Quick Deploy Command

If Vercel CLI is installed and logged in:

```bash
cd C:\Users\User\itinteractive-narrative-engine
vercel --prod
```

This will:
- Build the project
- Deploy to production
- Give you the deployment URL

---

## 🎯 Next Steps After Deployment

1. ✅ Test all features
2. ✅ Create more stories
3. ✅ Add real-time sync (Socket.io)
4. ✅ Implement choice aggregation
5. ✅ Add character reveal feature

---

## 💡 Tips

- **Auto-deploy**: Vercel auto-deploys on every push to `main` branch
- **Preview deployments**: Every PR gets a preview URL
- **Environment variables**: Set once, works for all deployments
- **Rollback**: Easy rollback from Vercel dashboard if needed

---

## 📞 Support

If deployment fails:
1. Check Vercel build logs
2. Check Supabase connection
3. Verify environment variables
4. Check GitHub repository is connected
