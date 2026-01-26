# 🚀 Production Deployment Guide
## প্রোডাকশনে Deploy করার সম্পূর্ণ গাইড

---

## 📋 Pre-Deployment Checklist (Deploy এর আগে যা করতে হবে)

### ✅ 1. Environment Variables সেটআপ

Production এর জন্য environment variables তৈরি করুন:

```bash
# .env.production
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_PAYMENT_GATEWAY_URL=https://api.paymentgateway.com
```

### ✅ 2. Payment Gateway Integration

Payment gateway API integrate করুন:
- bKash API
- Nagad API  
- Rocket API

---

## 🌐 Deployment Options (Deploy করার বিভিন্ন উপায়)

### Option 1: Vercel (সবচেয়ে সহজ - Next.js এর জন্য Recommended)

#### Steps:

1. **Vercel Account তৈরি করুন:**
   - https://vercel.com এ যান
   - GitHub account দিয়ে sign in করুন

2. **Project Import করুন:**
   ```bash
   # Vercel CLI দিয়ে deploy:
   npm i -g vercel
   vercel login
   vercel
   ```

   অথবা

   - Vercel Dashboard এ যান
   - "New Project" click করুন
   - GitHub repository select করুন
   - "Import" button click করুন

3. **Environment Variables সেট করুন:**
   - Project Settings > Environment Variables
   - Production variables যোগ করুন

4. **Deploy করুন:**
   - "Deploy" button click করুন
   - Automatic deployment হবে

**Advantages:**
- ✅ Automatic deployments from GitHub
- ✅ Free tier available
- ✅ SSL certificate automatic
- ✅ Custom domain support
- ✅ CDN included

---

### Option 2: Netlify

#### Steps:

1. **Netlify Account তৈরি করুন:**
   - https://netlify.com এ যান
   - Sign up করুন

2. **Build Settings:**
   ```bash
   Build command: npm run build
   Publish directory: .next
   ```

3. **Environment Variables:**
   - Site Settings > Environment Variables
   - Variables যোগ করুন

4. **Deploy:**
   - GitHub repository connect করুন
   - Auto-deploy enable করুন

---

### Option 3: Traditional VPS (DigitalOcean, AWS EC2)

#### Steps:

1. **Server Setup:**
   ```bash
   # Ubuntu/Debian server এ Node.js install করুন
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Project Clone করুন:**
   ```bash
   git clone https://github.com/naimprince010-ship-it/interactive-narrative-engine.git
   cd interactive-narrative-engine
   npm install
   npm run build
   ```

3. **PM2 দিয়ে Run করুন:**
   ```bash
   npm install -g pm2
   pm2 start npm --name "narrative-engine" -- start
   pm2 save
   pm2 startup
   ```

4. **Nginx Setup:**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

5. **SSL Certificate (Let's Encrypt):**
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

---

## 🔧 Production Build (Production Build তৈরি করা)

### Build Command:

```bash
# Production build তৈরি করুন
npm run build

# Build check করুন
npm start
```

### Build Optimization:

1. **Image Optimization:**
   - Next.js Image component ব্যবহার করুন
   - Images compress করুন

2. **Code Splitting:**
   - Automatic code splitting (Next.js default)
   - Dynamic imports ব্যবহার করুন

3. **Environment Variables:**
   - `.env.production` file তৈরি করুন
   - Sensitive data hide করুন

---

## 🔐 Security Checklist (Security এর জন্য)

### ✅ Security Best Practices:

1. **Environment Variables:**
   - `.env` files never commit করুন
   - Production variables secure রাখুন

2. **API Keys:**
   - Payment gateway keys environment variables এ রাখুন
   - Never expose in client-side code

3. **HTTPS:**
   - Always use HTTPS in production
   - SSL certificate install করুন

4. **CORS:**
   - API endpoints এ CORS properly configure করুন

---

## 📊 Monitoring & Analytics

### Recommended Tools:

1. **Vercel Analytics** (if using Vercel)
2. **Google Analytics**
3. **Sentry** (Error tracking)
4. **LogRocket** (User session replay)

---

## 🔄 CI/CD Setup (Continuous Deployment)

### GitHub Actions Example:

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: npm run start
```

---

## 🌍 Domain Setup (Custom Domain)

### Steps:

1. **Domain Purchase:**
   - Namecheap, GoDaddy, etc. থেকে domain কিনুন

2. **DNS Configuration:**
   ```
   Type: A Record
   Name: @
   Value: VPS IP (or Vercel/Netlify IP)
   ```

3. **SSL Certificate:**
   - Vercel/Netlify: Automatic
   - VPS: Let's Encrypt ব্যবহার করুন

---

## 💳 Payment Gateway Setup (Production এর জন্য)

### bKash API Integration:

```typescript
// lib/payment/bkash.ts
export async function processBkashPayment(amount: number, transactionId: string) {
  const response = await fetch(process.env.NEXT_PUBLIC_BKASH_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.BKASH_SECRET_KEY}`
    },
    body: JSON.stringify({
      amount,
      transactionId,
      // other required fields
    })
  })
  return response.json()
}
```

### Environment Variables:

```env
BKASH_SECRET_KEY=your_secret_key
BKASH_MERCHANT_NUMBER=your_merchant_number
NAGAD_SECRET_KEY=your_secret_key
ROCKET_SECRET_KEY=your_secret_key
```

---

## 📝 Post-Deployment Checklist

### ✅ After Deploying:

1. ✅ Website load হচ্ছে কিনা check করুন
2. ✅ All routes working কিনা test করুন
3. ✅ Payment flow test করুন
4. ✅ Mobile responsive check করুন
5. ✅ Performance test করুন
6. ✅ SSL certificate working কিনা verify করুন
7. ✅ Environment variables properly set আছে কিনা check করুন

---

## 🐛 Troubleshooting (সমস্যা সমাধান)

### Common Issues:

1. **Build Errors:**
   ```bash
   npm run build
   # Errors fix করুন
   ```

2. **Port Already in Use:**
   ```bash
   # Port 3000 kill করুন
   lsof -ti:3000 | xargs kill
   ```

3. **Environment Variables Not Working:**
   - `.env` file path check করুন
   - Variable names `NEXT_PUBLIC_` prefix আছে কিনা verify করুন

---

## 📚 Resources (উপযোগী লিংক)

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Deployment:** https://nextjs.org/docs/deployment
- **bKash API:** https://developer.bka.sh/
- **Let's Encrypt:** https://letsencrypt.org/

---

## 🎯 Recommended: Vercel Deployment (সবচেয়ে সহজ)

```bash
# Quick Deploy Steps:
1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "New Project"
4. Import repository
5. Click "Deploy"
6. Done! 🎉
```

---

**Status:** ✅ Ready for Production Deployment  
**Last Updated:** 2026-01-18
