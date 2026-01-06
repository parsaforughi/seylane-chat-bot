# 🚀 Seylane Chat Bot - Quick Start

## Step 1: Create .env File

Copy the template to create your `.env` file:

```bash
cd "/Users/parsa/Desktop/seylane ai/ai-instagram-woocommerce-bot"
cp ENV_TEMPLATE.txt .env
```

Or manually create `.env` file and copy the contents from `ENV_TEMPLATE.txt`

## Step 2: Add Your API Keys

Open `.env` and fill in your credentials:

### Required Keys:

1. **DATABASE_URL** - Get free from https://neon.tech
   ```
   DATABASE_URL=postgresql://username:password@host/database
   ```

2. **INSTAGRAM_APP_ID** & **INSTAGRAM_APP_SECRET** & **INSTAGRAM_PAGE_ACCESS_TOKEN**
   - Go to https://developers.facebook.com
   - Create an app
   - Add Instagram product
   - Get your credentials

3. **OPENAI_API_KEY** - Get from https://platform.openai.com
   ```
   OPENAI_API_KEY=sk-...
   ```

4. **WOOCOMMERCE_URL** - Your store URL
   ```
   WOOCOMMERCE_URL=https://yourstore.com
   ```

5. **WOOCOMMERCE_CONSUMER_KEY** & **WOOCOMMERCE_CONSUMER_SECRET**
   - Go to: Your Store > WooCommerce > Settings > Advanced > REST API
   - Click "Add Key"
   - Copy the keys

6. **SESSION_SECRET** - Change to any random string
   ```
   SESSION_SECRET=your_very_long_random_secret_string_here_12345
   ```

## Step 3: Install & Setup

```bash
# Install all dependencies and setup database
npm run setup
```

## Step 4: Start the Bot

### Option A: Use startup script
```bash
chmod +x start.sh
./start.sh
```

### Option B: Manual start
```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Dashboard (new terminal)
cd client
npm run dev
```

## Step 5: Create Admin Account

```bash
curl -X POST http://localhost:3000/auth/setup \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "your_secure_password"}'
```

## Step 6: Access Dashboard

Open http://localhost:5000 and login with your admin credentials.

## Step 7: Test Connections

1. Go to Settings page
2. Click "Test Connection" for each service
3. All should show green checkmarks ✅

## Step 8: Setup Instagram Webhook

In your Facebook App settings:
- Webhook URL: `https://your-domain.com/webhook`
- Verify Token: (same as INSTAGRAM_VERIFY_TOKEN in .env)
- Subscribe to: `messages`

## Done! 🎉

Send a message to your Instagram Business Account and watch the bot respond!

---

## Access Points

- **Backend API**: http://localhost:3000
- **Dashboard**: http://localhost:5000
- **Health Check**: http://localhost:3000/health

## Need Help?

Read the detailed guides:
- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Complete setup
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deploy to production
- [README.md](README.md) - Project overview

