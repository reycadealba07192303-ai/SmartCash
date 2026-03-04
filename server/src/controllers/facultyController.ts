import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import User from '../models/User';
import Module from '../models/Module';
import Quiz from '../models/Quiz';
import ForumPost from '../models/ForumPost';
import Lesson from '../models/Lesson';
import UserLessonProgress from '../models/UserLessonProgress';

// Get Faculty Dashboard Stats
export const getFacultyStats = async (req: AuthRequest, res: Response) => {
    try {
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalLessons = await Lesson.countDocuments({});

        // Students who have not completed any lesson = needs attention
        const studentsWithProgress = await UserLessonProgress.distinct('user_id', { completed: true });
        const needsAttention = Math.max(0, totalStudents - studentsWithProgress.length);

        res.json({
            totalStudents: totalStudents || 0,
            totalLessons: totalLessons || 0,
            needsAttention
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// --- STUDENT MANAGEMENT ---
export const getStudents = async (req: AuthRequest, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = (req.query.search as string) || '';
        const skip = (page - 1) * limit;

        // Build search filter
        const searchFilter = search
            ? { role: 'student', $or: [{ full_name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] }
            : { role: 'student' };

        const [students, total] = await Promise.all([
            User.find(searchFilter).select('-passwordHash').skip(skip).limit(limit).lean(),
            User.countDocuments(searchFilter)
        ]);

        // Total lessons available in the system
        const totalLessons = await Lesson.countDocuments({});

        // Fetch completed lesson counts for all returned students at once
        const studentIds = students.map(s => s._id);
        const progressRecords = await UserLessonProgress.aggregate([
            { $match: { user_id: { $in: studentIds }, completed: true } },
            { $group: { _id: '$user_id', completedCount: { $sum: 1 } } }
        ]);
        const progressMap = new Map(progressRecords.map(r => [r._id.toString(), r.completedCount]));

        const enrichedStudents = students.map(s => {
            const completed = progressMap.get(s._id.toString()) || 0;
            const progress = totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0;
            const status = completed === 0 ? 'Inactive' : progress >= 30 ? 'Active' : 'At Risk';
            return {
                ...s,
                id: s._id,
                grade: 'Grade 12 - ABM',
                progress,
                lessonsCompleted: completed,
                totalLessons,
                status
            };
        });

        res.json({ students: enrichedStudents, total, page, limit });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// --- CONTENT MANAGEMENT (MODULES) ---
export const getModules = async (req: AuthRequest, res: Response) => {
    try {
        const modules = await Module.find({}).sort({ createdAt: -1 });

        const mappedModules = modules.map(m => ({ ...m.toObject(), id: m._id }));
        res.json(mappedModules);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createModule = async (req: AuthRequest, res: Response) => {
    try {
        const { title, description, category, imageUrl } = req.body;

        const newModule = new Module({
            title,
            description,
            category,
            image_url: imageUrl || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=800',
            created_by: req.user?.id
        });

        await newModule.save();

        res.status(201).json({ ...newModule.toObject(), id: newModule._id });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteModule = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        await Module.findByIdAndDelete(id);
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// --- CONTENT MANAGEMENT (QUIZZES) ---
export const getQuizzes = async (req: AuthRequest, res: Response) => {
    try {
        const quizzes = await Quiz.find({}).populate('module_id', 'title').sort({ createdAt: -1 });

        const mappedQuizzes = quizzes.map(q => ({
            ...q.toObject(),
            id: q._id,
            learning_modules: q.module_id // mimic supabase structure for frontend
        }));

        res.json(mappedQuizzes);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createQuiz = async (req: AuthRequest, res: Response) => {
    try {
        const { title, description, moduleId, questions } = req.body;

        // Remap questions: AI returns { question, options, correctAnswer }
        // but Quiz schema expects { text, options, correctAnswer }
        const mappedQuestions = (questions || []).map((q: any) => ({
            text: q.text || q.question || '',
            options: q.options || [],
            correctAnswer: q.correctAnswer ?? 0,
            explanation: q.explanation || ''
        }));

        const newQuiz = new Quiz({
            title,
            description,
            ...(moduleId ? { module_id: moduleId } : {}),
            questions: mappedQuestions,
            created_by: req.user?.id
        });

        await newQuiz.save();

        res.status(201).json({ ...newQuiz.toObject(), id: newQuiz._id });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteQuiz = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        await Quiz.findByIdAndDelete(id);
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// --- DISCUSSIONS (FORUM) ---
export const getDiscussions = async (req: AuthRequest, res: Response) => {
    try {
        const posts = await ForumPost.find({}).populate('author_id', 'full_name').sort({ createdAt: -1 });

        const mappedPosts = posts.map(p => ({
            ...p.toObject(),
            id: p._id,
            profiles: p.author_id // mimic supabase structure
        }));

        res.json(mappedPosts);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteDiscussion = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        await ForumPost.findByIdAndDelete(id);
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const flagDiscussion = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { isFlagged } = req.body;

        const updatedPost = await ForumPost.findByIdAndUpdate(
            id,
            { is_flagged: isFlagged },
            { new: true }
        );

        res.json({ ...updatedPost?.toObject(), id: updatedPost?._id });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// --- CONTENT MANAGEMENT (LESSONS) ---
export const createLesson = async (req: AuthRequest, res: Response) => {
    try {
        const { moduleId, title, description, content, videoUrl, type, duration } = req.body;

        const count = await Lesson.countDocuments({ module_id: moduleId });

        const newLesson = new Lesson({
            module_id: moduleId,
            title,
            description,
            content,
            video_url: videoUrl,
            type,
            duration,
            order_index: count || 0,
            created_by: req.user?.id
        });

        await newLesson.save();

        res.status(201).json({ ...newLesson.toObject(), id: newLesson._id });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteLesson = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        await Lesson.findByIdAndDelete(id);
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getStudentProgress = async (req: AuthRequest, res: Response) => {
    try {
        // Fetch the 10 most recent lesson completions across all students
        const progressRecords = await UserLessonProgress.find()
            .sort({ completed_at: -1, updatedAt: -1 })
            .limit(10)
            .populate('user_id', 'full_name')
            .populate({
                path: 'lesson_id',
                select: 'title module_id',
                populate: { path: 'module_id', select: 'title' }
            });

        const rows = progressRecords.map(p => {
            const user = p.user_id as any;
            const lesson = p.lesson_id as any;
            const module = lesson?.module_id as any;

            return {
                studentName: user?.full_name || 'Unknown Student',
                lessonTitle: lesson?.title || 'Unknown Lesson',
                moduleTitle: module?.title || 'Unknown Module',
                status: p.completed ? 'Completed' : 'In Progress',
                date: p.completed_at
                    ? new Date(p.completed_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
                    : new Date((p as any).updatedAt || Date.now()).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
            };
        });

        res.json(rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
