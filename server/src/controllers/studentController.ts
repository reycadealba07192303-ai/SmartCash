import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { GoogleGenerativeAI } from '@google/generative-ai';
import User from '../models/User';
import Lesson from '../models/Lesson';
import Module from '../models/Module';
import UserLessonProgress from '../models/UserLessonProgress';
import SavingsGoal from '../models/SavingsGoal';
import { UserBadge } from '../models/Badge';
import ForumPost from '../models/ForumPost';
import ForumComment from '../models/ForumComment';
import { BlogPost } from '../models/BlogPost';
import Quiz from '../models/Quiz';
import { getIO } from '../socket';
import Transaction from '../models/Transaction';
import admin from '../config/firebase-admin';
import QuizAttempt from '../models/QuizAttempt';

// --- STUDENT DASHBOARD STATS ---
export const getStudentStats = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;

        const profile = await User.findById(userId).select('full_name');

        const lessonsCompleted = await UserLessonProgress.countDocuments({ user_id: userId, completed: true });
        const totalLessons = await Lesson.countDocuments({});
        const badgesEarned = await UserBadge.countDocuments({ user_id: userId });

        const savingsData = await SavingsGoal.find({ user_id: userId });

        let totalSavings = 0;
        let activeChallenge: any = null;

        if (savingsData) {
            savingsData.forEach(goal => {
                if (goal.name.startsWith('CHALLENGE:')) {
                    if (!activeChallenge) {
                        activeChallenge = {
                            name: goal.name.replace('CHALLENGE: ', ''),
                            current: Number(goal.current_amount || 0),
                            target: Number(goal.target_amount || 0)
                        };
                    }
                } else {
                    totalSavings += Number(goal.current_amount || 0);
                }
            });
        }

        // Find the next incomplete lesson
        const allLessons = await Lesson.find({}).sort({ order_index: 1 }).populate('module_id', 'title');
        const completedProgressData = await UserLessonProgress.find({ user_id: userId, completed: true });
        const completedIds = new Set(completedProgressData.map(p => p.lesson_id.toString()));

        const nextLessonDoc = allLessons.find(l => !completedIds.has(l._id.toString()));
        let nextLesson = null;
        if (nextLessonDoc) {
            nextLesson = {
                id: nextLessonDoc._id,
                title: nextLessonDoc.title,
                moduleTitle: (nextLessonDoc.module_id as any)?.title || 'Learning Module',
                duration: nextLessonDoc.duration,
                moduleId: (nextLessonDoc.module_id as any)?._id
            };
        }

        res.json({
            fullName: profile?.full_name || 'Student',
            lessonsCompleted: `${lessonsCompleted}/${totalLessons}`,
            currentStreak: '1 Day',
            totalSavings: `₱${totalSavings.toLocaleString()}`,
            badgesEarned: badgesEarned,
            activeChallenge: activeChallenge,
            nextLesson: nextLesson
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// --- STUDENT MODULES & LESSONS ---
export const getModulesWithProgress = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;

        const modulesData = await Module.find({}).sort({ createdAt: 1 });
        const lessonsData = await Lesson.find({}).select('_id module_id title type duration order_index').sort({ order_index: 1 });
        const progressData = await UserLessonProgress.find({ user_id: userId });

        const completedLessonIds = new Set(progressData.filter(p => p.completed).map(p => p.lesson_id.toString()));

        const formattedModules = modulesData.map(module => {
            const moduleLessons = lessonsData
                .filter(l => l.module_id && l.module_id.toString() === module._id.toString())
                .map(lesson => ({
                    ...lesson.toObject(),
                    id: lesson._id,
                    completed: completedLessonIds.has(lesson._id.toString())
                }));

            const completedCount = moduleLessons.filter(l => l.completed).length;
            const progress = moduleLessons.length > 0 ? (completedCount / moduleLessons.length) * 100 : 0;

            return {
                id: module._id,
                title: module.title,
                description: module.description,
                category: module.category,
                imageUrl: module.image_url,
                progress: progress,
                totalLessons: moduleLessons.length,
                completedCount: completedCount,
                lessons: moduleLessons
            };
        });

        res.json(formattedModules);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getLesson = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        const lesson = await Lesson.findById(id).populate('module_id', 'title');

        if (!lesson) {
            return res.status(404).json({ error: 'Lesson not found' });
        }

        const progress = await UserLessonProgress.findOne({ user_id: userId, lesson_id: id });

        res.json({
            ...lesson.toObject(),
            id: lesson._id,
            learning_modules: lesson.module_id,
            completed: progress?.completed || false
        });

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const markLessonComplete = async (req: AuthRequest, res: Response) => {
    try {
        const { id: lessonId } = req.params;
        const userId = req.user?.id;

        await UserLessonProgress.findOneAndUpdate(
            { user_id: userId, lesson_id: lessonId },
            { completed: true, completed_at: new Date() },
            { upsert: true, new: true }
        );

        try {
            const io = getIO();
            io.emit('leaderboard_update');
        } catch (err) {
            console.warn('Socket emit failed', err);
        }

        res.status(200).json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// --- AI FINANCIAL TIPS ---
export const getFinancialTip = async (req: AuthRequest, res: Response) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        const { totalSpent, savingsGoalName, savingsGoalCurrent, savingsGoalTarget, topCategories } = req.body || {};

        const fallbackTips = [
            "Saving even ₱20 a day adds up to ₱7,300 a year! Small habits make a big difference.",
            "Always pay yourself first. Set aside your savings before spending your allowance.",
            "Track every peso. Knowing where your money goes is the first step to financial freedom.",
            "Needs vs Wants: Before buying something, ask yourself if you really need it or just want it.",
            "The 50/30/20 rule: 50% for Needs, 30% for Wants, and 20% for Savings is a great starting point."
        ];

        if (!apiKey) {
            const randomTip = fallbackTips[Math.floor(Math.random() * fallbackTips.length)];
            return res.json({ tip: randomTip });
        }

        const genAI = new GoogleGenerativeAI(apiKey as string);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        let contextInfo = '';
        if (totalSpent) contextInfo += `The student spent ₱${totalSpent.toLocaleString()} this month. `;
        if (topCategories && topCategories.length > 0) contextInfo += `Their top spending categories are: ${topCategories.join(', ')}. `;
        if (savingsGoalName && savingsGoalTarget) {
            contextInfo += `They have a savings goal called "${savingsGoalName}" — saved ₱${savingsGoalCurrent || 0} out of ₱${savingsGoalTarget}. `;
        }

        const prompt = contextInfo
            ? `You are a friendly and encouraging financial advisor for Filipino high school and college students. Based on this student's financial situation: ${contextInfo}Give ONE short, specific, and practical money tip (max 2 sentences) tailored to their situation. Be warm and conversational. Do not use markdown formatting.`
            : `You are a friendly financial advisor for high school and college students in the Philippines. Give exactly ONE short, practical, and highly motivating financial tip (maximum 2 sentences) about saving money or budgeting. Do not use markdown like bold or bullet points.`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text().trim();

        res.json({ tip: responseText });
    } catch (error: any) {
        console.error("AI Tip Error:", error);
        res.json({ tip: "Always pay yourself first. Set aside your savings before spending your allowance." });
    }
};

// --- ACTION-BASED BADGES ---
import { awardBadgeByName } from '../services/badgeAwardService';

export const submitQuizResult = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { quizId, quizTitle, score, total, answers, questions } = req.body;

        const percentage = (score / total) * 100;
        if (percentage >= 80) {
            await awardBadgeByName(userId as string, 'Quiz Master');
        }

        // Save Attempt
        if (quizId && quizTitle) {
            const attempt = new QuizAttempt({
                user_id: userId,
                quiz_id: quizId,
                quiz_title: quizTitle,
                score,
                total,
                percentage,
                answers: answers || [],
                questions: questions || []
            });
            await attempt.save();
        }

        res.status(200).json({ success: true, awarded: percentage >= 80 });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getQuizHistory = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const history = await QuizAttempt.find({ user_id: userId }).sort({ taken_at: -1 });
        res.status(200).json(history);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const downloadTemplate = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        await awardBadgeByName(userId as string, 'Resourceful Student');
        res.status(200).json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getForumPosts = async (req: AuthRequest, res: Response) => {
    try {
        const posts = await ForumPost.find().sort({ createdAt: -1 }).limit(50);
        res.json(posts);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getBlogPosts = async (req: AuthRequest, res: Response) => {
    try {
        const posts = await BlogPost.find().sort({ createdAt: -1 });
        res.json(posts);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getLatestQuizzes = async (req: AuthRequest, res: Response) => {
    try {
        // Fetch top 5 latest quizzes
        const quizzes = await Quiz.find().sort({ createdAt: -1 }).limit(5);
        res.json(quizzes);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getQuiz = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const quiz = await Quiz.findById(id).populate('module_id', 'title');

        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }

        const mappedQuiz = {
            ...quiz.toObject(),
            id: quiz._id,
            category: 'Innovation', // Fallback
            learning_modules: quiz.module_id
        };

        res.json(mappedQuiz);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getQuizByModule = async (req: AuthRequest, res: Response) => {
    try {
        const { moduleId } = req.params;
        const quiz = await Quiz.findOne({ module_id: moduleId }).sort({ createdAt: -1 });
        if (!quiz) {
            return res.status(404).json({ error: 'No quiz found for this module' });
        }
        res.json({ id: quiz._id, title: quiz.title });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const submitForumPost = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const profile = await User.findById(userId).select('full_name avatar_url');
        const { title, content, tags } = req.body;

        const newPost = new ForumPost({
            author_id: userId,
            author_name: profile?.full_name || 'Student',
            author_avatar: profile?.avatar_url,
            title,
            content,
            tags: tags || ['General']
        });

        await newPost.save();

        await awardBadgeByName(userId as string, 'Community Contributor');

        try {
            const io = getIO();
            io.emit('new_forum_post', newPost);
        } catch (socketError) {
            console.warn("Socket.io emit failed", socketError);
        }

        res.status(201).json(newPost);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const likeForumPost = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const postId = req.params.id;

        const post = await ForumPost.findById(postId);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        // Check if user already liked it
        const hasLiked = post.likedBy && post.likedBy.includes(userId as any);

        if (hasLiked) {
            // Unlike
            post.likedBy = post.likedBy.filter(id => id.toString() !== userId);
            post.likes = Math.max(0, post.likes - 1);
        } else {
            // Like
            if (!post.likedBy) post.likedBy = [];
            post.likedBy.push(userId as any);
            post.likes += 1;
        }

        await post.save();

        res.json({ likes: post.likes, hasLiked: !hasLiked });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const addForumComment = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const postId = req.params.id;
        const { content } = req.body;

        const post = await ForumPost.findById(postId);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        const newComment = new ForumComment({
            post_id: postId,
            author_id: userId,
            content
        });

        await newComment.save();

        post.comments_count += 1;
        await post.save();

        const populatedComment = await newComment.populate('author_id', 'full_name avatar_url');

        try {
            const io = getIO();
            io.emit('new_forum_comment', populatedComment);
        } catch (socketError) {
            console.warn("Socket.io emit failed for comment", socketError);
        }

        res.status(201).json(populatedComment);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getForumComments = async (req: AuthRequest, res: Response) => {
    try {
        const postId = req.params.id;
        const comments = await ForumComment.find({ post_id: postId })
            .populate('author_id', 'full_name avatar_url')
            .sort({ createdAt: 1 });

        res.json(comments);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// --- DELETE OWN ACCOUNT ---
export const deleteOwnAccount = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Delete from Firebase Auth
        try {
            const firebaseUser = await admin.auth().getUserByEmail(user.email);
            await admin.auth().deleteUser(firebaseUser.uid);
        } catch (fbError: any) {
            if (fbError.code !== 'auth/user-not-found') {
                console.warn('Could not delete Firebase user for ' + user.email + ':', fbError.message);
            }
        }

        // Cascade delete all student data
        await Promise.all([
            Transaction.deleteMany({ user_id: userId }),
            SavingsGoal.deleteMany({ user_id: userId }),
            UserLessonProgress.deleteMany({ user_id: userId }),
            UserBadge.deleteMany({ user_id: userId }),
        ]);

        // Delete from MongoDB
        await User.findByIdAndDelete(userId);

        res.json({ message: 'Account deleted successfully.' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};