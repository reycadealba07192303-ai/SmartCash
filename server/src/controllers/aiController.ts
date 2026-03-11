import { Request, Response } from 'express';
import { generateLessonContent, generateQuizQuestions, generateBlogPostsAI, generateLessonsForModule } from '../services/aiService';
import { BlogPost } from '../models/BlogPost';
import Lesson from '../models/Lesson';

export const generateLesson = async (req: Request, res: Response) => {
    const { topic, description } = req.body;

    if (!topic) {
        return res.status(400).json({ error: 'Topic is required' });
    }

    try {
        const content = await generateLessonContent(topic, description || '');
        res.json({ content });
    } catch (error: any) {
        console.error('Error generating lesson:', error);
        res.status(500).json({ error: 'Failed to generate lesson content via AI.' });
    }
};

export const generateQuiz = async (req: Request, res: Response) => {
    const { lessonContent, numQuestions } = req.body;

    if (!lessonContent) {
        return res.status(400).json({ error: 'Lesson content is required' });
    }

    try {
        const questions = await generateQuizQuestions(lessonContent, numQuestions || 5);
        res.json({ questions });
    } catch (error: any) {
        console.error('Error generating quiz:', error);
        res.status(500).json({ error: 'Failed to generate quiz questions via AI.' });
    }
};

export const generateAndSeedBlogPosts = async (req: Request, res: Response) => {
    try {
        const existing = await BlogPost.find().sort({ createdAt: -1 });

        // If posts exist, check if the newest one is less than 1 hour old
        if (existing.length > 0) {
            const newestPost = existing[0];
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

            if (newestPost.createdAt > oneHourAgo) {
                // Posts are fresh enough, return them
                return res.json(existing);
            } else {
                // Posts are older than 1 hour, delete them and generate new ones
                await BlogPost.deleteMany({});
            }
        }

        const posts = await generateBlogPostsAI();

        const saved = await BlogPost.insertMany(posts.map((p: any) => ({
            title: p.title,
            category: p.category,
            excerpt: p.excerpt,
            content: p.content,
            author_name: 'SmartCash AI',
        })));

        res.json(saved);
    } catch (error: any) {
        console.error('Error generating blog posts:', error);
        res.status(500).json({ error: 'Failed to generate blog posts via AI.' });
    }
};

export const generateAndSaveModuleLessons = async (req: Request, res: Response) => {
    const { moduleId, moduleTitle, category } = req.body;
    if (!moduleId || !moduleTitle || !category) {
        return res.status(400).json({ error: 'moduleId, moduleTitle, and category are required.' });
    }

    try {
        const lessons = await generateLessonsForModule(moduleTitle, category);

        // Save all generated lessons to MongoDB
        const savedLessons = await Promise.all(
            lessons.map((lesson, idx) =>
                new Lesson({
                    module_id: moduleId,
                    title: lesson.title,
                    description: lesson.description,
                    content: lesson.content,
                    type: 'article',
                    duration: '10-15 min',
                    order_index: idx + 1,
                }).save()
            )
        );

        res.status(201).json({ message: `Generated ${savedLessons.length} lessons successfully.`, lessons: savedLessons });
    } catch (error: any) {
        console.error('Error generating module lessons:', error);
        res.status(500).json({ error: 'Failed to generate lessons via AI.' });
    }
};

export const generateModuleQuiz = async (req: Request, res: Response) => {
    const { moduleId, moduleTitle } = req.body;
    if (!moduleId || !moduleTitle) {
        return res.status(400).json({ error: 'moduleId and moduleTitle are required.' });
    }

    try {
        // Fetch all lessons for this module
        const lessons = await Lesson.find({ module_id: moduleId }).sort({ order_index: 1 });

        // Build context from lessons (fall back to titles if content is empty)
        let quizContext: string;
        if (lessons.length === 0) {
            // No lessons yet — generate from module title alone
            quizContext = `Module: "${moduleTitle}"\nThis is a financial literacy module for Senior High School ABM students in the Philippines.`;
        } else {
            const hasContent = lessons.some(l => l.content && l.content.trim().length > 50);
            if (hasContent) {
                quizContext = lessons
                    .map(l => `## ${l.title}\n${l.content || '(No content)'}`)
                    .join('\n\n---\n\n');
            } else {
                // Lessons exist but no content — use titles + module title as context
                const lessonTitles = lessons.map(l => `- ${l.title}`).join('\n');
                quizContext = `Module: "${moduleTitle}"\nLessons covered:\n${lessonTitles}\n\nGenerate 5 multiple-choice questions about these financial literacy topics for Senior High School ABM students in the Philippines.`;
            }
        }

        // Generate quiz questions
        const questions = await generateQuizQuestions(quizContext, 5);

        res.json({
            title: `${moduleTitle} Quiz`,
            description: `A quiz covering the key concepts of ${moduleTitle}. Designed for Senior High School ABM students.`,
            questions
        });
    } catch (error: any) {
        console.error('Error generating module quiz — real error:', error?.message || error);
        res.status(500).json({ error: `Failed to generate quiz via AI: ${error?.message || 'Unknown error'}` });
    }
};
