import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { body, validationResult } from 'express-validator';
import { DatabaseService } from '../services/database';

const router = express.Router();
const db = new DatabaseService();

// Initialize database connection
db.initialize().catch(console.error);

// Generate CSRF token
const generateCSRFToken = () => {
  return uuidv4();
};

// Register endpoint
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').isLength({ min: 2 }).trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists',
      });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const userId = uuidv4();
    await db.createUser({
      id: userId,
      email,
      password_hash: passwordHash,
      name,
      role: 'agent',
    });

    // Create agent profile
    const agentId = uuidv4();
    await db.createAgent({
      id: agentId,
      user_id: userId,
      name,
      email,
      role: 'junior',
      department: 'sales',
      status: 'active',
    });

    // Generate tokens
    const token = jwt.sign(
      { userId, email, role: 'agent' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    const csrfToken = generateCSRFToken();

    // Save session
    await db.run(`
      INSERT INTO sessions (id, user_id, csrf_token, expires_at, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      uuidv4(),
      userId,
      csrfToken,
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      req.ip,
      req.get('User-Agent') || '',
    ]);

    res.json({
      success: true,
      data: {
        user: {
          id: userId,
          email,
          name,
          role: 'agent',
        },
        token,
        csrfToken,
        expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
      },
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Login endpoint
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 1 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    // Find user
    const user = await db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    // Generate tokens
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    const csrfToken = generateCSRFToken();

    // Save session
    await db.run(`
      INSERT INTO sessions (id, user_id, csrf_token, expires_at, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      uuidv4(),
      user.id,
      csrfToken,
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      req.ip,
      req.get('User-Agent') || '',
    ]);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
        csrfToken,
        expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
      },
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    const user = await db.getUserById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found',
      });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid token',
    });
  }
});

// Logout endpoint
router.post('/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
      
      // Remove session
      await db.run('DELETE FROM sessions WHERE user_id = ?', [decoded.userId]);
    }

    res.json({
      success: true,
      message: 'Logged out successfully',
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Get CSRF token
router.get('/csrf-token', (req, res) => {
  const csrfToken = generateCSRFToken();
  res.json({
    token: csrfToken,
    expiresIn: 3600, // 1 hour
  });
});

// Extend session
router.post('/extend-session', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    
    // Update session expiry
    await db.run(`
      UPDATE sessions SET expires_at = ? WHERE user_id = ?
    `, [
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      decoded.userId,
    ]);

    res.json({
      success: true,
      message: 'Session extended',
    });

  } catch (error) {
    console.error('Extend session error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;