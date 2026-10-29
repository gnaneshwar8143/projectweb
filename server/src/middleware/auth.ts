import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

export interface AuthRequest extends Request {
  user?: { _id: string; email: string; name: string };
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'No token provided' });
      return;
    }
    const token = authHeader.slice(7);
    const secret = process.env.JWT_SECRET || 'dev-secret-change-in-production';
    const decoded = jwt.verify(token, secret) as { userId: string };
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      res.status(401).json({ success: false, error: 'User not found' });
      return;
    }
    req.user = { _id: user._id.toString(), email: user.email, name: user.name };
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}
