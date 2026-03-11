import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Badge } from '../models/Badge';

dotenv.config();

const defaultBadges = [
    {
        name: 'Financial Novice',
        description: 'Joined the platform and started the journey to financial literacy.',
        icon: 'Star',
        color: 'text-blue-600 dark:text-blue-400',
        bg_color: 'bg-blue-100 dark:bg-blue-900/30'
    },
    {
        name: 'Quiz Master',
        description: 'Scored 80% or higher on a financial literacy quiz.',
        icon: 'Award',
        color: 'text-amber-600 dark:text-amber-400',
        bg_color: 'bg-amber-100 dark:bg-amber-900/30'
    },
    {
        name: 'Budget Beginner',
        description: 'Logged at least 5 transactions in the budget tracker.',
        icon: 'Medal',
        color: 'text-emerald-600 dark:text-emerald-400',
        bg_color: 'bg-emerald-100 dark:bg-emerald-900/30'
    },
    {
        name: 'Community Contributor',
        description: 'Contributed to the community forum by starting a discussion.',
        icon: 'Trophy',
        color: 'text-purple-600 dark:text-purple-400',
        bg_color: 'bg-purple-100 dark:bg-purple-900/30'
    },
    {
        name: 'Resourceful Student',
        description: 'Downloaded a financial template from the resource library.',
        icon: 'Star',
        color: 'text-indigo-600 dark:text-indigo-400',
        bg_color: 'bg-indigo-100 dark:bg-indigo-900/30'
    },
    {
        name: 'Savings Star',
        description: 'Set your first savings goal and started building your financial future.',
        icon: 'Star',
        color: 'text-yellow-600 dark:text-yellow-400',
        bg_color: 'bg-yellow-100 dark:bg-yellow-900/30'
    },
    {
        name: 'Smart Spender',
        description: 'Stayed within your monthly budget for the first time.',
        icon: 'Award',
        color: 'text-teal-600 dark:text-teal-400',
        bg_color: 'bg-teal-100 dark:bg-teal-900/30'
    },
    {
        name: 'Goal Getter',
        description: 'Completed a financial goal you set for yourself.',
        icon: 'Trophy',
        color: 'text-rose-600 dark:text-rose-400',
        bg_color: 'bg-rose-100 dark:bg-rose-900/30'
    }
];

export const seedBadges = async () => {
    try {
        console.log('Checking for default badges...');
        let added = 0;
        for (const badge of defaultBadges) {
            const exists = await Badge.findOne({ name: badge.name });
            if (!exists) {
                await Badge.create(badge);
                added++;
                console.log(`  Added badge: ${badge.name}`);
            }
        }
        if (added > 0) {
            console.log(`Successfully seeded ${added} new badge(s).`);
        } else {
            console.log('All badges already exist. Skipping seed.');
        }
    } catch (error) {
        console.error('Error seeding badges:', error);
    }
};

// If run directly
if (require.main === module) {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        console.error('MONGODB_URI not found in env.');
        process.exit(1);
    }

    mongoose.connect(mongoUri).then(async () => {
        await seedBadges();
        mongoose.disconnect();
    });
}
