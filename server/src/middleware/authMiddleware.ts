import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

export interface AuthRequest extends Request {
    user?: any;
}

export const authenticateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        const user = await User.findById(decoded.id).select('-passwordHash');

        if (!user) {
            return res.status(401).json({ error: 'Invalid token, user not found' });
        }

        // Auto-downgrade expired premium accounts
        if (user.isPremium && user.premiumExpiresAt && new Date(user.premiumExpiresAt) < new Date()) {
            user.isPremium = false;
            await user.save();
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ error: 'Authentication failed' });
    }
};

export const requireAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || (!req.user._id && !req.user.id)) {
        return res.status(401).json({ error: 'User not authenticated' });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied: Admins only' });
    }

    next();
};
