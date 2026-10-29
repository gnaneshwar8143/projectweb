import { Router, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

const router = Router();

function generateToken(userId: string): string {
  const secret = process.env.JWT_SECRET || 'dev-secret-change-in-production';
  return jwt.sign({ userId }, secret, { expiresIn: '30d' });
}

// POST /api/auth/register
router.post('/register', async (req, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' });
      return;
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(409).json({ success: false, error: 'An account with this email already exists.' });
      return;
    }
    const user = await User.create({ name: name.trim(), email: email.toLowerCase().trim(), password });
    const token = generateToken(user._id.toString());
    res.status(201).json({
      success: true,
      data: { user: user.toJSON(), token },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Email and password are required.' });
      return;
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      res.status(401).json({ success: false, error: 'Invalid email or password.' });
      return;
    }
    const valid = await user.comparePassword(password);
    if (!valid) {
      res.status(401).json({ success: false, error: 'Invalid email or password.' });
      return;
    }
    const token = generateToken(user._id.toString());
    res.json({
      success: true,
      data: { user: user.toJSON(), token },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /api/auth/me  
router.get('/me', async (req, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) { res.status(401).json({ success: false }); return; }
    const token = authHeader.slice(7);
    const secret = process.env.JWT_SECRET || 'dev-secret-change-in-production';
    const decoded = jwt.verify(token, secret) as { userId: string };
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) { res.status(401).json({ success: false }); return; }
    res.json({ success: true, data: { user } });
  } catch {
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
});

export default router;
