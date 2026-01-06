import { Router } from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { db, adminUsers, selectAdminUserSchema } from '../db/index.js';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

const router = Router();

// Hash password utility
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Configure passport local strategy
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const [user] = await db
        .select()
        .from(adminUsers)
        .where(eq(adminUsers.username, username))
        .limit(1);

      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }

      const hashedPassword = hashPassword(password);
      if (user.password !== hashedPassword) {
        return done(null, false, { message: 'Incorrect password.' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  })
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const [user] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.id, id))
      .limit(1);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Login route
router.post('/login', passport.authenticate('local'), (req, res) => {
  res.json({ success: true, user: { username: (req.user as any).username } });
});

// Logout route
router.post('/logout', (req, res) => {
  req.logout(() => {
    res.json({ success: true });
  });
});

// Check auth status
router.get('/me', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ authenticated: true, user: { username: (req.user as any).username } });
  } else {
    res.json({ authenticated: false });
  }
});

// Create first admin user (only if no users exist)
router.post('/setup', async (req, res) => {
  try {
    const existingUsers = await db.select().from(adminUsers).limit(1);
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Admin user already exists' });
    }

    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const hashedPassword = hashPassword(password);
    
    const [newUser] = await db
      .insert(adminUsers)
      .values({ username, password: hashedPassword })
      .returning();

    res.json({ success: true, username: newUser.username });
  } catch (error) {
    console.error('Error creating admin user:', error);
    res.status(500).json({ error: 'Failed to create admin user' });
  }
});

export default router;

