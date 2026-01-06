# Setup Guide - Seylane Chat Bot

Complete step-by-step guide to get your bot running in under 15 minutes!

## Prerequisites

- Node.js 20+ installed
- PostgreSQL database (or Neon.tech free account)
- Instagram Business Account
- WooCommerce store
- OpenAI API account

## Quick Start

### 1. Clone and Install

```bash
cd ai-instagram-woocommerce-bot
npm install
cd client && npm install && cd ..
```

### 2. Database Setup

#### Option A: Neon.tech (Recommended - Free)
1. Go to https://neon.tech
2. Create a free account
3. Create a new project
4. Copy the connection string

#### Option B: Local PostgreSQL
```bash
createdb instagram_bot
```

### 3. Environment Configuration

Create `.env` file in the root directory:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Instagram (we'll set this up next)
INSTAGRAM_APP_ID=
INSTAGRAM_APP_SECRET=
INSTAGRAM_PAGE_ACCESS_TOKEN=
INSTAGRAM_VERIFY_TOKEN=my_random_verify_token_123

# OpenAI
OPENAI_API_KEY=

# WooCommerce
WOOCOMMERCE_URL=
WOOCOMMERCE_CONSUMER_KEY=
WOOCOMMERCE_CONSUMER_SECRET=

# Server
PORT=3000
SESSION_SECRET=your_random_secret_here
NODE_ENV=development
```

### 4. Push Database Schema

```bash
npm run db:push
```

### 5. Instagram Setup (5 minutes)

#### Step 1: Create Facebook App
1. Go to https://developers.facebook.com
2. Click "My Apps" > "Create App"
3. Choose "Business" as app type
4. Fill in app details

#### Step 2: Add Instagram Product
1. In your app dashboard, click "Add Product"
2. Find "Instagram" and click "Set Up"
3. Go to Instagram Basic Display

#### Step 3: Link Instagram Business Account
1. Click "Create New App"
2. Follow prompts to link your Instagram Business Account
3. Must be a Business or Creator account

#### Step 4: Get Access Token
1. Go to Graph API Explorer: https://developers.facebook.com/tools/explorer
2. Select your app
3. Get token with `instagram_basic`, `instagram_manage_messages` permissions
4. Generate long-lived token:

```bash
curl -X GET "https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=YOUR_APP_ID&client_secret=YOUR_APP_SECRET&fb_exchange_token=YOUR_SHORT_LIVED_TOKEN"
```

5. Copy the `INSTAGRAM_PAGE_ACCESS_TOKEN` to your `.env`

#### Step 5: Set Up Webhook
1. In app dashboard, go to "Webhooks"
2. Subscribe to Instagram
3. Callback URL: `https://your-domain.com/webhook`
4. Verify Token: Use the same as `INSTAGRAM_VERIFY_TOKEN` in `.env`
5. Subscribe to `messages` field

### 6. OpenAI Setup (1 minute)

1. Go to https://platform.openai.com
2. Create API key
3. Copy to `OPENAI_API_KEY` in `.env`

### 7. WooCommerce Setup (2 minutes)

1. Log into your WooCommerce admin: `yourstore.com/wp-admin`
2. Go to **WooCommerce > Settings > Advanced > REST API**
3. Click **"Add Key"**
4. Description: "Instagram Bot"
5. Permissions: **Read**
6. Click **"Generate API Key"**
7. Copy Consumer Key and Consumer Secret to `.env`

### 8. Start the Bot!

#### Terminal 1 - Backend
```bash
npm run dev
```

#### Terminal 2 - Dashboard
```bash
cd client
npm run dev
```

### 9. Create Admin Account

Open your browser to http://localhost:5000

First time setup - create admin account through the API:

```bash
curl -X POST http://localhost:3000/auth/setup \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "your_secure_password"}'
```

Then login at http://localhost:5000

### 10. Configure Settings

1. Go to Settings page in dashboard
2. Enter all API credentials
3. Test each connection (Instagram, OpenAI, WooCommerce)
4. All should show green checkmarks

## Deployment

### Option 1: Railway (Recommended)

1. Create account at https://railway.app
2. Create new project
3. Add PostgreSQL database
4. Deploy from GitHub:
   - Connect repository
   - Add environment variables
   - Deploy!

### Option 2: Render

1. Create account at https://render.com
2. Create Web Service from Git
3. Add environment variables
4. Deploy

### Option 3: VPS (DigitalOcean, AWS, etc.)

```bash
# Install Node.js and PM2
npm install -g pm2

# Build project
npm run build
cd client && npm run build && cd ..

# Start with PM2
pm2 start dist/index.js --name instagram-bot
pm2 startup
pm2 save
```

## Exposing Webhook for Testing

During development, use a tunnel to expose your local server:

### Using ngrok
```bash
ngrok http 3000
```

Copy the HTTPS URL and use it as your webhook URL in Facebook App settings.

## Testing the Bot

1. Send a message to your Instagram Business Account
2. Check dashboard logs to see the message
3. Bot should respond automatically!

Test messages:
- "Hello" - Should get a greeting
- "I'm looking for a red dress under $50" - Should search products
- "Help" - Should show available commands

## Troubleshooting

### Bot not responding?
1. Check logs in terminal
2. Verify webhook is set up correctly
3. Make sure Instagram access token has correct permissions

### Database errors?
```bash
npm run db:push
```

### WooCommerce not working?
1. Check API keys have "Read" permission
2. Verify store URL is correct (with https://)
3. Test connection in Settings page

### OpenAI errors?
1. Verify API key is correct
2. Check you have credits in OpenAI account

## Support

For issues:
1. Check logs in terminal
2. View Logs page in dashboard
3. Test connections in Settings page

## Next Steps

- Customize bot responses in `server/services/gpt.service.ts`
- Add more intent types
- Customize dashboard styling
- Add more analytics

Enjoy your AI-powered Instagram bot! 🎉

