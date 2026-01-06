#!/bin/bash

echo "🔧 Creating .env file for Seylane Chat Bot..."
echo ""

# Check if .env already exists
if [ -f .env ]; then
    read -p "⚠️  .env file already exists. Overwrite? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Cancelled. Keeping existing .env file."
        exit 0
    fi
fi

# Create .env from template
cat > .env << 'EOF'
# =============================================
# SEYLANE CHAT BOT - CONFIGURATION
# =============================================
# Fill in your API keys and credentials below
# =============================================

# ============ DATABASE ============
# Get a free PostgreSQL database from: https://neon.tech
DATABASE_URL=

# ============ INSTAGRAM ============
# Get from: https://developers.facebook.com
INSTAGRAM_APP_ID=
INSTAGRAM_APP_SECRET=
INSTAGRAM_PAGE_ACCESS_TOKEN=
INSTAGRAM_VERIFY_TOKEN=my_random_verify_token_123

# ============ OPENAI ============
# Get from: https://platform.openai.com/api-keys
OPENAI_API_KEY=

# ============ WOOCOMMERCE ============
# Get from: Your Store > WooCommerce > Settings > Advanced > REST API
WOOCOMMERCE_URL=
WOOCOMMERCE_CONSUMER_KEY=
WOOCOMMERCE_CONSUMER_SECRET=

# ============ SERVER CONFIG ============
PORT=3000
SESSION_SECRET=change_this_to_a_random_long_string
NODE_ENV=development

# ============ DASHBOARD (Optional) ============
CLIENT_URL=http://localhost:5000
EOF

echo "✅ Created .env file!"
echo ""
echo "📝 Next steps:"
echo "1. Open .env in your text editor"
echo "2. Fill in your API keys and credentials"
echo "3. Save the file"
echo "4. Run: npm run setup"
echo ""
echo "Need help? Check QUICK_START.md for detailed instructions!"

