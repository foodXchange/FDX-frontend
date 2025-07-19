import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = process.env.API_PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// In-memory database (replace with real database in production)
interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'supplier' | 'buyer' | 'viewer' | 'agent';
  company: string;
  permissions: string[];
  avatar?: string;
  lastLogin?: Date;
  preferences?: {
    theme?: 'light' | 'dark';
    language?: string;
    notifications?: boolean;
  };
  isAgent?: boolean;
  agentProfile?: {
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
    specializations: string[];
    territories: string[];
    verified: boolean;
  };
}

const users: Map<string, User> = new Map();

// Seed with some default users
const seedUsers = async () => {
  const defaultUsers = [
    {
      email: 'admin@foodxchange.com',
      password: 'Admin123!',
      name: 'Admin User',
      role: 'admin' as const,
      company: 'FoodXchange',
      permissions: ['all'],
    },
    {
      email: 'buyer@example.com',
      password: 'Buyer123!',
      name: 'John Buyer',
      role: 'buyer' as const,
      company: 'Restaurant Chain Ltd',
      permissions: ['view_products', 'create_rfq', 'manage_orders'],
    },
    {
      email: 'supplier@example.com',
      password: 'Supplier123!',
      name: 'Sarah Supplier',
      role: 'supplier' as const,
      company: 'Fresh Produce Co',
      permissions: ['manage_products', 'view_rfq', 'manage_orders'],
    },
    {
      email: 'agent@example.com',
      password: 'Agent123!',
      name: 'Alex Agent',
      role: 'agent' as const,
      company: 'Global Trade Partners',
      permissions: ['view_leads', 'manage_relationships', 'view_analytics'],
      isAgent: true,
      agentProfile: {
        tier: 'gold',
        specializations: ['Fresh Produce', 'Dairy', 'Seafood'],
        territories: ['North America', 'Europe'],
        verified: true,
      },
    },
  ];

  for (const userData of defaultUsers) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user: User = {
      id: uuidv4(),
      ...userData,
      password: hashedPassword,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random`,
      lastLogin: new Date(),
      preferences: {
        theme: 'light',
        language: 'en',
        notifications: true,
      },
    };
    users.set(user.email, user);
  }
};

// Initialize seed data
seedUsers();

// Helper functions
const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
};

const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId, type: 'refresh' }, JWT_SECRET, { expiresIn: '7d' });
};

const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// Middleware to verify JWT token
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required',
      errors: ['No token provided'],
    });
  }

  try {
    const decoded = verifyToken(token);
    (req as any).userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token',
      errors: ['Token verification failed'],
    });
  }
};

// Routes
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Login
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
        errors: ['Missing credentials'],
      });
    }

    const user = users.get(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        errors: ['Authentication failed'],
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        errors: ['Authentication failed'],
      });
    }

    // Update last login
    user.lastLogin = new Date();

    // Generate tokens
    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token,
        refreshToken,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      errors: ['Server error occurred'],
    });
  }
});

// Register
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name, company, role = 'buyer' } = req.body;

    if (!email || !password || !name || !company) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
        errors: ['Missing required fields'],
      });
    }

    if (users.has(email)) {
      return res.status(409).json({
        success: false,
        message: 'User already exists',
        errors: ['Email already registered'],
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser: User = {
      id: uuidv4(),
      email,
      password: hashedPassword,
      name,
      role,
      company,
      permissions: role === 'supplier' 
        ? ['manage_products', 'view_rfq', 'manage_orders']
        : ['view_products', 'create_rfq', 'manage_orders'],
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
      lastLogin: new Date(),
      preferences: {
        theme: 'light',
        language: 'en',
        notifications: true,
      },
    };

    users.set(email, newUser);

    const token = generateToken(newUser.id);
    const refreshToken = generateRefreshToken(newUser.id);

    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      success: true,
      data: {
        user: userWithoutPassword,
        token,
        refreshToken,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      errors: ['Server error occurred'],
    });
  }
});

// Logout
app.post('/api/auth/logout', authenticateToken, (req: Request, res: Response) => {
  // In a real app, you might want to invalidate the token
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

// Validate token
app.get('/api/auth/validate', authenticateToken, (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const user = Array.from(users.values()).find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
      errors: ['User does not exist'],
    });
  }

  const { password: _, ...userWithoutPassword } = user;

  res.json({
    success: true,
    data: {
      user: userWithoutPassword,
    },
  });
});

// Refresh token
app.post('/api/auth/refresh', (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token required',
        errors: ['No token provided'],
      });
    }

    const decoded = verifyToken(token);
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    const user = Array.from(users.values()).find(u => u.id === decoded.userId);
    if (!user) {
      throw new Error('User not found');
    }

    const newToken = generateToken(user.id);
    const newRefreshToken = generateRefreshToken(user.id);

    res.json({
      success: true,
      data: {
        token: newToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token',
      errors: ['Token refresh failed'],
    });
  }
});

// Update profile
app.patch('/api/auth/users/:userId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    const user = Array.from(users.values()).find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        errors: ['User does not exist'],
      });
    }

    // Update user fields (except password and email)
    Object.keys(updates).forEach(key => {
      if (key !== 'password' && key !== 'email' && key !== 'id') {
        (user as any)[key] = updates[key];
      }
    });

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: userWithoutPassword,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Profile update failed',
      errors: ['Server error occurred'],
    });
  }
});

// Reset password request
app.post('/api/auth/reset-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
        errors: ['Missing email'],
      });
    }

    const user = users.get(email);
    if (!user) {
      // Don't reveal if user exists or not
      return res.json({
        success: true,
        message: 'If the email exists, a reset link has been sent',
      });
    }

    // In a real app, send email with reset token
    console.log(`Password reset requested for: ${email}`);

    res.json({
      success: true,
      message: 'If the email exists, a reset link has been sent',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Password reset request failed',
      errors: ['Server error occurred'],
    });
  }
});

// Change password
app.post('/api/auth/change-password', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId, oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Old and new passwords are required',
        errors: ['Missing password fields'],
      });
    }

    const user = Array.from(users.values()).find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        errors: ['User does not exist'],
      });
    }

    const isValidPassword = await bcrypt.compare(oldPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
        errors: ['Invalid current password'],
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Password change failed',
      errors: ['Server error occurred'],
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`API Server running on http://localhost:${PORT}`);
  console.log('\nDefault users:');
  console.log('- admin@foodxchange.com / Admin123!');
  console.log('- buyer@example.com / Buyer123!');
  console.log('- supplier@example.com / Supplier123!');
  console.log('- agent@example.com / Agent123!');
});