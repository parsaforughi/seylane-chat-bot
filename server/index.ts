import express from 'express';
import session from 'express-session';
import passport from 'passport';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import ConnectPgSimple from 'connect-pg-simple';
import { Pool } from '@neondatabase/serverless';
import authRoutes from './routes/auth.routes.js';
import apiRoutes from './routes/api.routes.js';
import webhookRoutes from './routes/webhook.routes.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Create session store
const PgSession = ConnectPgSimple(session);
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5000',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(
  session({
    store: new PgSession({
      pool: pool as any,
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || 'change-this-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    },
  })
);

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);
app.use('/webhook', webhookRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'Seylane Chat Bot',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      auth: {
        login: 'POST /auth/login',
        logout: 'POST /auth/logout',
        me: 'GET /auth/me',
        setup: 'POST /auth/setup',
      },
      api: {
        conversations: 'GET /api/conversations',
        conversation: 'GET /api/conversations/:id',
        analyticsOverview: 'GET /api/analytics/overview',
        messagesOverTime: 'GET /api/analytics/messages-over-time',
        intentDistribution: 'GET /api/analytics/intent-distribution',
        settings: 'GET /api/settings',
        updateSettings: 'POST /api/settings',
        logs: 'GET /api/logs',
      },
      webhook: {
        instagram: 'GET/POST /webhook',
      },
    },
  });
});

// Serve static files from Next.js build in production
if (process.env.NODE_ENV === 'production') {
  const clientOutPath = path.join(__dirname, '../../client/out');
  
  console.log('📦 Serving frontend from:', clientOutPath);
  
  // Serve static files
  app.use(express.static(clientOutPath));
  
  // Serve Next.js app for all non-API routes
  app.get('*', (req, res, next) => {
    // Skip API, auth, and webhook routes
    if (req.path.startsWith('/api') || 
        req.path.startsWith('/auth') || 
        req.path.startsWith('/webhook') ||
        req.path.startsWith('/health')) {
      return next();
    }
    
    // Serve index.html for all other routes (SPA routing)
    res.sendFile(path.join(clientOutPath, 'index.html'), (err) => {
      if (err) {
        console.error('Error serving index.html:', err);
        res.status(500).send('Error loading application');
      }
    });
  });
}

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API available at http://localhost:${PORT}`);
  if (process.env.NODE_ENV === 'production') {
    console.log(`🎨 Dashboard available at http://localhost:${PORT}`);
  }
  console.log(`💬 Ready to receive Instagram messages!`);
});

export default app;

