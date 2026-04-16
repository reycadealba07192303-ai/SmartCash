import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../middleware/authMiddleware';
import User from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

const generateToken = (userId: string, role: string) => {
    return jwt.sign({ id: userId, role }, JWT_SECRET, { expiresIn: '7d' });
};

import admin from '../config/firebase-admin';

export const register = async (req: Request, res: Response) => {
    const { email, password, fullName, role, schoolId, gradeLevel, strand } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists with this email' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Optional: Also register user in Firebase Authentication so Reset Password emails work.
        let firebaseUid = null;
        if (admin.app()) {
            try {
                const authRecord = await admin.auth().createUser({
                    email,
                    password,
                    displayName: fullName,
                });
                firebaseUid = authRecord.uid;
            } catch (fbError: any) {
                console.warn("Firebase Auth Error (Dual-registration failed):", fbError.message);
                // Even if Firebase fails (e.g., config missing, duplicate), we usually want
                // to proceed with our primary DB, but warning the admin.
            }
        }

        const newUser = new User({
            email,
            passwordHash,
            full_name: fullName,
            role: role || 'student',
            school_id: schoolId,
            grade_level: gradeLevel,
            strand: strand,
        });

        await newUser.save();

        const token = generateToken(newUser.id, newUser.role);

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: newUser.id,
                email: newUser.email,
                role: newUser.role,
                full_name: newUser.full_name,
                school_id: newUser.school_id,
                grade_level: newUser.grade_level,
                strand: newUser.strand,
                isPremium: newUser.isPremium
            },
            firebaseUid // Usually not returned but good for debugging our new system
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user || !user.passwordHash) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Update last active
        user.last_active = new Date();
        await user.save();

        const token = generateToken(user.id, user.role);

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                full_name: user.full_name,
                school_id: user.school_id,
                grade_level: user.grade_level,
                strand: user.strand,
                isPremium: user.isPremium
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

export const forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            // Return success even if not found to prevent email enumeration
            return res.json({ message: 'If an account exists, a password reset link has been sent.' });
        }

        // Generate a temporary token for password reset
        const resetToken = jwt.sign({ id: user.id, purpose: 'reset-password' }, JWT_SECRET, { expiresIn: '15m' });
        const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;

        console.log('\n==================================================');
        console.log('PASSWORD RESET LINK (Dev Only):');
        console.log(resetLink);
        console.log('==================================================\n');

        res.json({ message: 'Password reset link sent (Check server console for link)' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

export const updatePassword = async (req: Request, res: Response) => {
    const { password } = req.body;
    let token = req.headers.authorization?.split(' ')[1];

    // Check if token was passed in body (from reset link)
    if (!token && req.body.token) {
        token = req.body.token;
    }

    if (!token) return res.status(401).json({ error: 'Missing token' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        await User.findByIdAndUpdate(decoded.id, { passwordHash });

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        res.json(req.user);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const { fullName, email, avatar } = req.body;

        const updates: any = {};
        if (fullName) updates.full_name = fullName;
        if (email) updates.email = email;
        if (avatar) updates.avatar_url = avatar;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updates },
            { new: true }
        ).select('-passwordHash');

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'Profile updated successfully', user: updatedUser });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

export const upgradeAccount = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const plan = req.body.plan || 'monthly'; // Expected 'monthly' or 'yearly'
        
        const addition = plan === 'yearly' ? 365 : 30;
        const newExpiry = new Date();
        newExpiry.setDate(newExpiry.getDate() + addition);
        
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: { isPremium: true, premiumExpiresAt: newExpiry } },
            { new: true }
        ).select('-passwordHash');

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'Successfully upgraded to Premium!', user: updatedUser });
    } catch (error) {
        console.error('Upgrade account error:', error);
        res.status(500).json({ error: 'Server error during upgrade' });
    }
};
