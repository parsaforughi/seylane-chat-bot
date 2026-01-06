# 🚀 راهنمای دیپلوی یکپارچه - Seylane Chat Bot

## ✨ چی تغییر کرد؟

حالا Backend و Frontend **با هم** روی **یک URL** کار می‌کنن! 🎉

## 📍 یک سرویس - همه چیز:

```
https://your-app.railway.app
├── /                    → Dashboard UI
├── /dashboard          → Dashboard pages
├── /api/*              → Backend API
├── /auth/*             → Authentication
└── /webhook            → Instagram webhook
```

## 🛠️ دستورات جدید:

### Development (محلی):

```bash
# Backend + Frontend با هم
npm run dev:all

# یا جداگانه:
npm run dev          # فقط Backend
npm run dev:client   # فقط Frontend
```

### Production:

```bash
# Build همه چی
npm run build

# Start production
npm start

# یا مستقیم
NODE_ENV=production npm start
```

## 🚂 دیپلوی روی Railway:

### روش آسان - یه سرویس:

1. **New Project** → Deploy from GitHub
2. انتخاب repo: `parsaforughi/seylane-chat-bot`
3. **Build Command:**
   ```bash
   npm run build
   ```
4. **Start Command:**
   ```bash
   npm start
   ```
5. **Environment Variables** اضافه کن:
   ```bash
   NODE_ENV=production
   DATABASE_URL=postgresql://...
   INSTAGRAM_APP_ID=...
   INSTAGRAM_APP_SECRET=...
   INSTAGRAM_PAGE_ACCESS_TOKEN=...
   INSTAGRAM_VERIFY_TOKEN=...
   OPENAI_API_KEY=...
   WOOCOMMERCE_URL=...
   WOOCOMMERCE_CONSUMER_KEY=...
   WOOCOMMERCE_CONSUMER_SECRET=...
   SESSION_SECRET=...
   PORT=3000
   ```

6. **Deploy!** 🎉

### بعد از دیپلوی:

- برو به لینک Railway: `https://your-app.railway.app`
- باید داشبورد رو ببینی! 🎨
- API هم روی همون URL: `https://your-app.railway.app/api`
- Webhook: `https://your-app.railway.app/webhook`

## 🎯 چطور کار می‌کنه؟

### Production Mode:
1. Next.js به صورت **static export** build میشه
2. فایل‌های HTML/CSS/JS میرن توی `client/out/`
3. Express اون فایل‌ها رو serve می‌کنه
4. همه چی از یه port و یه URL

### Development Mode:
1. Backend روی port 3000
2. Next.js روی port 5000
3. با rewrites به هم وصلن

## 📦 ساختار Build:

```
dist/
└── server/         # Backend compiled
client/
└── out/           # Frontend static files
    ├── index.html
    ├── _next/
    └── ...
```

## 🔧 تست محلی Production Build:

```bash
# Build
npm run build

# Start (به عنوان production)
NODE_ENV=production npm start

# برو به: http://localhost:3000
```

## ✅ مزایا:

- ✅ یه URL - همه چی روش
- ✅ یه دیپلوی - یه سرویس
- ✅ ارزان‌تر (یه instance به جای دو تا)
- ✅ راحت‌تر برای مدیریت
- ✅ CORS problem نداری
- ✅ مناسب برای Railway free tier

## 🎨 دسترسی به Dashboard:

بعد از دیپلوی، فقط لینک Railway رو باز کن:
```
https://your-app.railway.app
```

می‌بینی: **Seylane Chat Bot Dashboard** 🎉

## 🐛 مشکل خوردی؟

### Dashboard نمیاد:
```bash
# مطمئن شو build شده:
npm run build:client

# چک کن فولدر out ساخته شده:
ls client/out/
```

### API کار نمی‌کنه:
```bash
# مطمئن شو NODE_ENV=production هست
echo $NODE_ENV

# چک کن logs:
railway logs
```

## 🚀 آماده دیپلوی!

حالا می‌تونی با یه کلیک روی Railway دیپلوی کنی و همه چی با هم کار کنه! 🎉

