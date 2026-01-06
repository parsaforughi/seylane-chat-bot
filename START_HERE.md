# 👋 Welcome to Seylane Chat Bot!

## 🚀 Get Started in 3 Steps

### Step 1: Create Your .env File

Run this command to create your `.env` file:

```bash
./create-env.sh
```

Or manually:

```bash
cd "/Users/parsa/Desktop/seylane ai/ai-instagram-woocommerce-bot"
cp ENV_TEMPLATE.txt .env
```

### Step 2: Add Your API Keys

Open the `.env` file and fill in your credentials:

```bash
# Use any text editor
nano .env
# or
code .env
# or
open .env
```

**You need to add:**
- ✅ Database URL (get free from https://neon.tech)
- ✅ Instagram credentials (from developers.facebook.com)
- ✅ OpenAI API key (from platform.openai.com)
- ✅ WooCommerce keys (from your store admin)
- ✅ Session secret (any random string)

### Step 3: Start the Bot

```bash
# Install and setup
npm run setup

# Start everything
./start.sh
```

**Or manually start:**

```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Dashboard
cd client && npm run dev
```

## 🎯 Access Your Bot

- **Dashboard**: http://localhost:5000
- **API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

## 📚 Documentation

- **[QUICK_START.md](QUICK_START.md)** - Fast setup guide
- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Detailed setup with screenshots
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deploy to production
- **[README.md](README.md)** - Full project overview

## ❓ Need Help?

1. Check if `.env` file exists and is filled
2. Run `npm run setup` to install dependencies
3. Check logs in terminal for errors
4. Test connections in Dashboard → Settings

## 🎉 What You Get

- ✅ AI-powered Instagram chatbot
- ✅ GPT-4 natural language understanding
- ✅ WooCommerce product search
- ✅ Beautiful admin dashboard
- ✅ Real-time analytics
- ✅ Easy setup (just 11 config values!)

---

**Ready? Run `./create-env.sh` to get started!** 🚀

