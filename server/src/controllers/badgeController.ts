import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { Badge, UserBadge } from '../models/Badge';
import User from '../models/User';

// Get badges for the current user
export const getBadges = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;

        // Fetch all badges
        const allBadges = await Badge.find({});

        // Fetch user's earned badges
        const userBadges = await UserBadge.find({ user_id: userId });

        // Map badges to include 'unlocked' status
        const earnedBadgeIds = new Set(userBadges.map(ub => ub.badge_id.toString()));

        const badgesWithStatus = allBadges.map(badge => {
            const unlocked = earnedBadgeIds.has(badge._id.toString());
            const userBadgeEntry = userBadges.find(ub => ub.badge_id.toString() === badge._id.toString());
            return {
                ...badge.toObject(),
                id: badge._id,
                unlocked: unlocked,
                earned_at: userBadgeEntry ? userBadgeEntry.earned_at : null
            };
        });

        res.json(badgesWithStatus);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

import UserLessonProgress from '../models/UserLessonProgress';

export const getLeaderboard = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;

        // Fetch all students
        const students = await User.find({ role: 'student' }).select('_id full_name');

        // Fetch all earned badges and completed lessons
        const allBadges = await UserBadge.find({});
        const allProgress = await UserLessonProgress.find({ completed: true });

        // Calculate points for each student
        const leaderboard = students.map(student => {
            const studentId = student._id.toString();
            // Count their items
            const badgeCount = allBadges.filter(b => b.user_id.toString() === studentId).length;
            const lessonCount = allProgress.filter(p => p.user_id.toString() === studentId).length;

            // Scoring System: 100 XP per badge, 50 XP per completed lesson
            const points = (badgeCount * 100) + (lessonCount * 50);

            return {
                id: studentId,
                name: student.full_name,
                points: points,
                isMe: studentId === userId
            };
        });

        // Sort descending by points
        leaderboard.sort((a, b) => b.points - a.points);

        // Assign ranks
        const rankedUsers = leaderboard.map((user, index) => ({
            ...user,
            rank: index + 1
        })).slice(0, 50); // Optional: Limit to top 50, but typically class leaderboards might show all

        res.json(rankedUsers);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
