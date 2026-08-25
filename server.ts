import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes FIRST
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@blackouthockey.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin';

    if (email === adminEmail && password === adminPassword) {
      res.json({
        success: true,
        token: 'dummy-jwt-token',
        user: {
          id: 'admin-001',
          email: email,
          role: 'Admin',
          personId: 'person-admin-001',
        },
      });
    } else if (email === 'league@blackouthockey.com' && password === 'league') {
      res.json({
        success: true,
        token: 'dummy-jwt-token',
        user: {
          id: 'league-001',
          email: email,
          role: 'League Manager',
          personId: 'person-league-001',
        },
      });
    } else if (email === 'team@blackouthockey.com' && password === 'team') {
      res.json({
        success: true,
        token: 'dummy-jwt-token',
        user: {
          id: 'team-001',
          email: email,
          role: 'Team Manager',
          personId: 'person-team-001',
        },
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  });

  app.post('/api/signup', (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    res.json({
      success: true,
      token: 'dummy-jwt-token',
      user: {
        id: 'new-user-' + Date.now(),
        email: email,
        role: 'Player',
        personId: 'person-new-' + Date.now(),
      },
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
