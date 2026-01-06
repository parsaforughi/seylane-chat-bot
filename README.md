# Seylane Chat Bot

An intelligent Instagram chatbot powered by GPT that understands natural language and helps customers find products from your WooCommerce store.

## Features

- 🤖 **AI-Powered Conversations**: Uses GPT-4 for natural language understanding
- 🛍️ **Smart Product Search**: Automatically searches your WooCommerce store based on user queries
- 📊 **Admin Dashboard**: Full-featured dashboard with analytics and conversation management
- 💬 **Context-Aware**: Maintains conversation history for contextual responses
- 📈 **Analytics**: Track conversations, product searches, and bot performance

## Easy Setup - No Complex Authentication

### Instagram (5 minutes)
1. Create a Facebook App at developers.facebook.com
2. Add Instagram product and link your Instagram Business Account
3. Generate a permanent access token
4. Set webhook URL and verification token
5. Done! No session IDs or browser automation needed

### WooCommerce (2 minutes)
1. Go to WooCommerce > Settings > Advanced > REST API
2. Click "Add Key" and select "Read" permissions
3. Copy Consumer Key and Consumer Secret
4. Done!

### OpenAI (1 minute)
1. Get API key from platform.openai.com
2. Paste into bot settings
3. Done!

## Installation

```bash
# Install dependencies
npm run setup

# Set up environment variables
./create-env.sh
# Edit .env with your credentials

# Start development (backend + dashboard)
npm run dev:all

# Or start separately:
npm run dev          # Backend only
npm run dev:client   # Dashboard only
```

## Production Build & Deploy

```bash
# Build everything (backend + frontend)
npm run build

# Start production server (serves both on one URL)
npm start

# Access at: http://localhost:3000
# - Dashboard: http://localhost:3000
# - API: http://localhost:3000/api
# - Webhook: http://localhost:3000/webhook
```

## Environment Variables

See `.env.example` for all required variables:
- Instagram Graph API credentials
- OpenAI API key
- WooCommerce store URL and API keys
- Database connection string
- Session secret

## Project Structure

```
ai-instagram-woocommerce-bot/
├── server/
│   ├── index.ts                 # Main server entry point
│   ├── db/
│   │   ├── schema.ts            # Database schema
│   │   └── index.ts             # Database connection
│   ├── services/
│   │   ├── instagram.service.ts # Instagram API integration
│   │   ├── gpt.service.ts       # GPT intent analysis
│   │   └── woocommerce.service.ts # WooCommerce API
│   └── routes/
│       ├── webhook.routes.ts    # Instagram webhooks
│       ├── api.routes.ts        # Dashboard API
│       └── auth.routes.ts       # Authentication
├── client/                      # Next.js dashboard (coming soon)
└── package.json
```

## Development

```bash
# Start backend server
npm run dev

# Generate database migrations
npm run db:generate

# Push database changes
npm run db:push

# Open database studio
npm run db:studio
```

## How It Works

1. User sends a message on Instagram
2. Instagram sends webhook to your server
3. GPT analyzes the message intent
4. If it's a product search, query WooCommerce API
5. GPT generates a natural response with products
6. Bot sends reply back to user
7. Everything is logged in the database

## Tech Stack

- **Backend**: Node.js/TypeScript with Express
- **AI**: OpenAI GPT-4
- **Database**: PostgreSQL with Drizzle ORM
- **Instagram**: Graph API (official)
- **E-commerce**: WooCommerce REST API
- **Frontend**: Next.js 14+ (dashboard)

## License

MIT

