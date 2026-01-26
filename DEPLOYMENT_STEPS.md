# 🚀 Quick Deployment Steps (দ্রুত Deploy করার গাইড)

## Option 1: Vercel (সবচেয়ে সহজ - 5 মিনিটে Deploy!)

### Step 1: Vercel এ Account তৈরি করুন
1. https://vercel.com এ যান
2. "Sign Up" button click করুন
3. GitHub account দিয়ে sign in করুন

### Step 2: Project Import করুন
1. Vercel Dashboard এ "Add New..." > "Project" click করুন
2. GitHub repository select করুন: `interactive-narrative-engine`
3. "Import" button click করুন

### Step 3: Configuration
1. Framework Preset: Next.js (auto-detected)
2. Build Command: `npm run build` (default)
3. Output Directory: `.next` (default)
4. Install Command: `npm install` (default)

### Step 4: Environment Variables যোগ করুন (যদি প্রয়োজন হয়)
1. "Environment Variables" section এ যান
2. Variables যোগ করুন:
   - `NEXT_PUBLIC_APP_URL` = আপনার domain URL
   - `NEXT_PUBLIC_PREMIUM_CHAPTER_PRICE` = 10

### Step 5: Deploy!
1. "Deploy" button click করুন
2. 2-3 মিনিট অপেক্ষা করুন
3. ✅ Deployment complete!

### Step 6: Custom Domain Setup (Optional)
1. Project Settings > Domains
2. Domain যোগ করুন
3. DNS settings follow করুন

---

## Option 2: Netlify (Alternative)

### Step 1: Netlify Account
1. https://netlify.com এ যান
2. Sign up করুন (GitHub দিয়ে)

### Step 2: New Site from Git
1. "Add new site" > "Import an existing project"
2. GitHub repository connect করুন

### Step 3: Build Settings
```
Build command: npm run build
Publish directory: .next
```

### Step 4: Environment Variables
- Site settings > Environment variables
- Variables যোগ করুন

### Step 5: Deploy
- "Deploy site" button click করুন

---

## Option 3: Manual VPS Deployment

### Step 1: Server Setup (DigitalOcean/AWS)
```bash
# Ubuntu server এ Node.js install করুন
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs npm

# PM2 install করুন (process manager)
sudo npm install -g pm2
```

### Step 2: Project Clone করুন
```bash
cd /var/www
git clone https://github.com/naimprince010-ship-it/interactive-narrative-engine.git
cd interactive-narrative-engine
npm install
```

### Step 3: Environment Variables
```bash
nano .env.production
# Variables যোগ করুন
```

### Step 4: Build & Start
```bash
npm run build
pm2 start npm --name "narrative-engine" -- start
pm2 save
pm2 startup
```

### Step 5: Nginx Setup
```bash
sudo apt install nginx
sudo nano /etc/nginx/sites-available/narrative-engine
```

Nginx config:
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

```bash
sudo ln -s /etc/nginx/sites-available/narrative-engine /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 6: SSL Certificate
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## ✅ Post-Deployment Checklist

1. ✅ Website load হচ্ছে কিনা check করুন
2. ✅ All pages working test করুন
3. ✅ Payment flow test করুন (test mode এ)
4. ✅ Mobile responsive check করুন
5. ✅ Performance test করুন (PageSpeed Insights)
6. ✅ SSL certificate working কিনা verify করুন

---

## 🔗 Quick Links

- **Vercel:** https://vercel.com
- **Netlify:** https://netlify.com
- **DigitalOcean:** https://digitalocean.com
- **AWS:** https://aws.amazon.com

---

## 💡 Tips

- ✅ Vercel সবচেয়ে সহজ এবং Next.js এর জন্য optimized
- ✅ Automatic deployments GitHub push হলে
- ✅ Free SSL certificate
- ✅ CDN included
- ✅ Zero configuration needed

---

**Recommended:** Vercel deployment সবচেয়ে সহজ এবং reliable! 🚀
