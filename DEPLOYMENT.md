# Deployment Guide - Seylane Chat Bot

## Production Checklist

Before deploying to production:

- [ ] Database is set up (PostgreSQL)
- [ ] All environment variables configured
- [ ] Instagram webhook verified
- [ ] OpenAI API key has sufficient credits
- [ ] WooCommerce API tested and working
- [ ] Admin account created
- [ ] SSL certificate configured (HTTPS required for webhooks)

## Environment Variables

Required for production:

```bash
DATABASE_URL=postgresql://...
INSTAGRAM_APP_ID=your_app_id
INSTAGRAM_APP_SECRET=your_app_secret
INSTAGRAM_PAGE_ACCESS_TOKEN=your_token
INSTAGRAM_VERIFY_TOKEN=your_verify_token
OPENAI_API_KEY=sk-...
WOOCOMMERCE_URL=https://yourstore.com
WOOCOMMERCE_CONSUMER_KEY=ck_...
WOOCOMMERCE_CONSUMER_SECRET=cs_...
SESSION_SECRET=long_random_string
PORT=3000
NODE_ENV=production
CLIENT_URL=https://your-dashboard-url.com
```

## Deployment Options

### 1. Railway.app (Easiest)

**Step 1: Database**
1. Go to https://railway.app
2. Create new project
3. Add PostgreSQL plugin
4. Copy `DATABASE_URL`

**Step 2: Backend Service**
1. New service > Deploy from GitHub
2. Connect your repository
3. Root directory: `/`
4. Build command: `npm install && npm run build`
5. Start command: `npm start`
6. Add all environment variables
7. Deploy!

**Step 3: Frontend Service**
1. New service > Deploy from GitHub
2. Same repository
3. Root directory: `/client`
4. Build command: `npm install && npm run build`
5. Start command: `npm start`
6. Add `NEXT_PUBLIC_API_URL` pointing to backend URL
7. Deploy!

**Step 4: Configure Webhook**
1. Get your Railway backend URL
2. Update Instagram webhook to: `https://your-backend.railway.app/webhook`

### 2. Render.com

Create `render.yaml`:

```yaml
services:
  - type: web
    name: instagram-bot-backend
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: instagram-bot-db
          property: connectionString
      # Add other env vars in Render dashboard

  - type: web
    name: instagram-bot-dashboard
    env: node
    buildCommand: cd client && npm install && npm run build
    startCommand: cd client && npm start
    envVars:
      - key: NEXT_PUBLIC_API_URL
        value: https://instagram-bot-backend.onrender.com

databases:
  - name: instagram-bot-db
    plan: free
```

### 3. VPS (DigitalOcean, AWS, Linode, etc.)

**Requirements:**
- Ubuntu 22.04 or similar
- Node.js 20+
- PostgreSQL 14+
- Nginx (for reverse proxy)
- PM2 (process manager)

**Setup:**

```bash
# 1. Install dependencies
sudo apt update
sudo apt install -y nodejs npm postgresql nginx

# 2. Install PM2
sudo npm install -g pm2

# 3. Setup PostgreSQL
sudo -u postgres createdb instagram_bot

# 4. Clone and build
git clone your-repo
cd ai-instagram-woocommerce-bot
npm install
npm run build

cd client
npm install
npm run build
cd ..

# 5. Configure environment
nano .env
# Add all environment variables

# 6. Run database migrations
npm run db:push

# 7. Start services with PM2
pm2 start dist/index.js --name instagram-bot-backend
pm2 start client/npm --name instagram-bot-dashboard -- start
pm2 startup
pm2 save

# 8. Configure Nginx
sudo nano /etc/nginx/sites-available/instagram-bot
```

Nginx configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Backend API and Webhook
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /webhook {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # Dashboard
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site and SSL:

```bash
sudo ln -s /etc/nginx/sites-available/instagram-bot /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Install SSL with Certbot
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 4. Docker

Create `Dockerfile` in root:

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Build
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: instagram_bot
      POSTGRES_PASSWORD: your_password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:your_password@postgres:5432/instagram_bot
      - NODE_ENV=production
    depends_on:
      - postgres

  dashboard:
    build:
      context: ./client
    ports:
      - "5000:5000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:3000
    depends_on:
      - backend

volumes:
  postgres_data:
```

Run with:

```bash
docker-compose up -d
```

## Post-Deployment

### 1. Verify Webhook

Test webhook endpoint:

```bash
curl https://your-domain.com/webhook?hub.mode=subscribe&hub.verify_token=your_verify_token&hub.challenge=test
```

Should return "test"

### 2. Create Admin Account

```bash
curl -X POST https://your-domain.com/auth/setup \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "secure_password"}'
```

### 3. Test Bot

1. Send message on Instagram
2. Check dashboard logs
3. Verify response

## Monitoring

### PM2 Monitoring (VPS)

```bash
pm2 monit
pm2 logs
pm2 restart all
```

### Health Check Endpoint

```bash
curl https://your-domain.com/health
```

## Scaling

For high traffic:

1. **Use connection pooling**: Already configured in Drizzle ORM
2. **Add Redis caching**: Cache WooCommerce product queries
3. **Rate limiting**: Add rate limiting middleware
4. **Load balancing**: Use multiple instances behind a load balancer

## Backup

**Database Backups:**

```bash
# Export
pg_dump $DATABASE_URL > backup.sql

# Import
psql $DATABASE_URL < backup.sql
```

**Automated Backups:**
- Railway/Render: Built-in daily backups
- VPS: Set up cron job for daily pg_dump

## Security

1. **Use HTTPS**: Required for Instagram webhooks
2. **Secure environment variables**: Never commit `.env`
3. **Strong session secret**: Use long random string
4. **Rate limiting**: Add to prevent abuse
5. **Regular updates**: Keep dependencies updated

```bash
npm audit
npm update
```

## Troubleshooting

**Webhook not receiving messages:**
- Check URL is HTTPS
- Verify token matches
- Check Instagram app settings
- Review server logs

**Database connection issues:**
- Verify DATABASE_URL is correct
- Check database is accessible from server
- Ensure connection pool settings are appropriate

**Out of memory:**
- Increase Node.js memory: `NODE_OPTIONS=--max-old-space-size=2048`
- Scale to larger instance

## Cost Estimates

**Free Tier Options:**
- Railway: $5/month (after free credits)
- Render: Free tier available
- Neon.tech Database: Free tier (0.5GB)
- OpenAI: Pay per use (~$0.002 per conversation)

**Typical Monthly Costs:**
- 1000 conversations/month: ~$2-3 OpenAI
- Hosting: $5-15/month
- Total: ~$10-20/month

## Support

Need help? Check:
1. Server logs
2. Dashboard logs page
3. Instagram webhook settings
4. Connection tests in Settings

Happy deploying! 🚀

