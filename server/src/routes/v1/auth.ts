import { Router } from 'express';
import { logger } from '../../services/logger';

const router = Router();

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    // Mock authentication
    const user = {
      id: '1',
      email,
      name: 'John Doe',
      role: 'user',
      avatar: null,
      createdAt: new Date().toISOString(),
    };

    const token = 'mock-jwt-token-' + Date.now();

    logger.info('User logged in', { userId: user.id, email });

    res.json({
      success: true,
      data: {
        token,
        user,
      },
    });
  } catch (error) {
    logger.error('Login failed', error as Error, { email: req.body.email });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: User registration
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               role:
 *                 type: string
 *                 enum: [user, agent, admin]
 *                 default: user
 *     responses:
 *       201:
 *         description: Registration successful
 *       400:
 *         description: Invalid input or user already exists
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'user' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and password are required',
      });
    }

    // Mock user creation
    const user = {
      id: Date.now().toString(),
      name,
      email,
      role,
      avatar: null,
      createdAt: new Date().toISOString(),
    };

    const token = 'mock-jwt-token-' + Date.now();

    logger.info('User registered', { userId: user.id, email, role });

    res.status(201).json({
      success: true,
      data: {
        token,
        user,
      },
    });
  } catch (error) {
    logger.error('Registration failed', error as Error, { email: req.body.email });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: User logout
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post('/logout', async (req, res) => {
  try {
    // In a real implementation, you would invalidate the token
    logger.info('User logged out');

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    logger.error('Logout failed', error as Error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post('/refresh', async (req, res) => {
  try {
    const token = 'mock-jwt-token-' + Date.now();

    logger.info('Token refreshed');

    res.json({
      success: true,
      data: {
        token,
      },
    });
  } catch (error) {
    logger.error('Token refresh failed', error as Error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
router.get('/me', async (req, res) => {
  try {
    // Mock user data
    const user = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'user',
      avatar: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    logger.info('User profile retrieved', { userId: user.id });

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    logger.error('Failed to retrieve user profile', error as Error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export { router as authRoutes };