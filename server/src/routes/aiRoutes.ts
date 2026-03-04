import express from 'express';
import { generateLesson, generateQuiz, generateAndSeedBlogPosts, generateAndSaveModuleLessons, generateModuleQuiz } from '../controllers/aiController';
import { authenticateUser } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/generate-lesson', authenticateUser, generateLesson);
router.post('/generate-quiz', authenticateUser, generateQuiz);
router.get('/blog-posts', authenticateUser, generateAndSeedBlogPosts);
router.post('/generate-module-lessons', authenticateUser, generateAndSaveModuleLessons);
router.post('/generate-module-quiz', authenticateUser, generateModuleQuiz);

export default router;
