import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { AuthRequest } from '../middleware/authMiddleware';
import User from '../models/User';
import Module from '../models/Module';
import Lesson from '../models/Lesson';
import Quiz from '../models/Quiz';
import Transaction from '../models/Transaction';
import SavingsGoal from '../models/SavingsGoal';
import UserLessonProgress from '../models/UserLessonProgress';
import { UserBadge } from '../models/Badge';
import admin from '../config/firebase-admin';

// Get Admin Dashboard Stats
export const getAdminStats = async (req: AuthRequest, res: Response) => {
    try {
        const profiles = await User.find({}).select('role createdAt last_active status');

        const totalUsers = profiles.length;

        // Role Distribution
        let studentCount = 0;
        let teacherCount = 0;
        let adminCount = 0;

        profiles.forEach(p => {
            if (p.role === 'student') studentCount++;
            else if (p.role === 'teacher') teacherCount++;
            else if (p.role === 'admin') adminCount++;
        });

        const roleDistribution = [
            { name: 'Students', value: studentCount, color: '#10b981' }, // Emerald
            { name: 'Teachers', value: teacherCount, color: '#3b82f6' }, // Blue
            { name: 'Admins', value: adminCount, color: '#8b5cf6' },    // Purple
        ];

        // 7-day Activity array
        const activityData = [];
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        let dailyActiveToday = 0;

        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            d.setHours(0, 0, 0, 0);

            const nextD = new Date(d);
            nextD.setDate(nextD.getDate() + 1);

            let newUsers = 0;
            let activeUsers = 0;

            profiles.forEach(p => {
                // @ts-ignore
                const created = new Date(p.createdAt);
                if (created >= d && created < nextD) newUsers++;

                if (p.last_active) {
                    const active = new Date(p.last_active);
                    if (active >= d && active < nextD) activeUsers++;
                }
            });

            if (i === 0) dailyActiveToday = activeUsers;

            activityData.push({
                name: days[d.getDay()],
                active: activeUsers,
                new: newUsers
            });
        }

        let flags = profiles.filter(p => p.status === 'Suspended').length;

        res.json({
            totalUsers: totalUsers,
            serverStatus: '99.9%', // Mock for now
            securityFlags: flags,
            dailyActive: dailyActiveToday,
            roleDistribution,
            activityData
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// Add a new user from Admin Dashboard
export const addUser = async (req: AuthRequest, res: Response) => {
    try {
        const { email, password, fullName, role, idNumber, gradeSection, status } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        let grade_level = null;
        let strand = null;
        if (gradeSection) {
            const parts = gradeSection.split('-');
            if (parts.length > 0) grade_level = parts[0].trim();
            if (parts.length > 1) strand = parts[1].trim();
        }

        const newUser = new User({
            email,
            passwordHash,
            full_name: fullName,
            role,
            school_id: idNumber,
            grade_level,
            strand,
            status: status || 'Active'
        });

        await newUser.save();

        res.status(201).json({
            message: 'User created successfully',
            user: { ...newUser.toObject(), id: newUser._id }
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// Fetch all users (profiles)
export const getAllUsers = async (req: AuthRequest, res: Response) => {
    try {
        const users = await User.find({}).sort({ createdAt: -1 }).select('-passwordHash');

        const mappedUsers = users.map(u => ({
            ...u.toObject(),
            id: u._id
        }));

        res.json(mappedUsers);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// Update user status (Approve, Suspend, Reactivate)
export const updateUserStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['Active', 'Suspended', 'Pending'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        ).select('-passwordHash');

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ ...updatedUser.toObject(), id: updatedUser._id });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// Delete user
export const deleteUser = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        // Find the user first so we can get their email for Firebase lookup
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Attempt to delete from Firebase Auth (by email)
        try {
            const firebaseUser = await admin.auth().getUserByEmail(user.email);
            await admin.auth().deleteUser(firebaseUser.uid);
            console.log('Firebase user deleted: ' + user.email);
        } catch (fbError: any) {
            // auth/user-not-found is fine — account may be local-only
            if (fbError.code !== 'auth/user-not-found') {
                console.warn('Could not delete Firebase user for ' + user.email + ':', fbError.message);
            }
        }

        // Cascade delete: faculty content AND student data
        await Promise.all([
            // Faculty content (if teacher/admin)
            Module.deleteMany({ created_by: id }),
            Lesson.deleteMany({ created_by: id }),
            Quiz.deleteMany({ created_by: id }),
            // Student data
            Transaction.deleteMany({ user_id: id }),
            SavingsGoal.deleteMany({ user_id: id }),
            UserLessonProgress.deleteMany({ user_id: id }),
            UserBadge.deleteMany({ user_id: id }),
        ]);

        // Delete from MongoDB
        await User.findByIdAndDelete(id);

        res.json({ message: 'User deleted successfully from system and Firebase.' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
