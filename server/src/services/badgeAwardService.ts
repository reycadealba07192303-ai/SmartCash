import { Badge, UserBadge } from '../models/Badge';
import { getIO } from '../socket';

export const awardBadgeByName = async (userId: string, badgeName: string) => {
    try {
        const badge = await Badge.findOne({ name: badgeName });
        if (!badge) return;

        const existing = await UserBadge.findOne({ user_id: userId, badge_id: badge._id });
        if (existing) return;

        const newBadge = new UserBadge({
            user_id: userId,
            badge_id: badge._id
        });

        await newBadge.save();
        console.log(`Successfully awarded badge: ${badgeName} to user: ${userId}`);

        try {
            const io = getIO();
            io.emit('leaderboard_update');
        } catch (err) {
            console.warn('Socket emit failed', err);
        }
    } catch (error) {
        console.error(`Error awarding badge ${badgeName}:`, error);
    }
};
