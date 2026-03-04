import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import http from 'http';
import { initSocket } from './socket';
import authRoutes from './routes/authRoutes';
import { getTransactions, addTransaction, deleteTransaction, getSavingsGoals, addSavingsGoal, updateSavingsGoal } from './controllers/budgetController';
import { getBadges, getLeaderboard } from './controllers/badgeController';
import { authenticateUser } from './middleware/authMiddleware';
import { connectDB } from './db/mongoose';

// Connect to MongoDB
connectDB();

import { seedBadges } from './db/seedBadges';
seedBadges();

const app = express();
const port = process.env.PORT || 5000;

const server = http.createServer(app);
const io = initSocket(server);

app.use(cors());
app.use(express.json());

import aiRoutes from './routes/aiRoutes';

app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);

// Budget Routes
const budgetRouter = express.Router();
budgetRouter.use(authenticateUser);
budgetRouter.get('/transactions', getTransactions);
budgetRouter.post('/transactions', addTransaction);
budgetRouter.delete('/transactions/:id', deleteTransaction);
budgetRouter.get('/savings', getSavingsGoals);
budgetRouter.post('/savings', addSavingsGoal);
budgetRouter.patch('/savings/:id', updateSavingsGoal);
app.use('/api/budget', budgetRouter);

// Badge Routes
const badgeRouter = express.Router();
badgeRouter.use(authenticateUser);
badgeRouter.get('/', getBadges);
badgeRouter.get('/leaderboard', getLeaderboard);
app.use('/api/badges', badgeRouter);

// Admin Routes
import { getAllUsers, updateUserStatus, deleteUser, getAdminStats, addUser } from './controllers/adminController';
import { requireAdmin } from './middleware/authMiddleware';

const adminRouter = express.Router();
adminRouter.use(authenticateUser);
adminRouter.use(requireAdmin); // Protect all admin routes
adminRouter.get('/stats', getAdminStats);
adminRouter.get('/users', getAllUsers);
adminRouter.post('/users', addUser);
adminRouter.patch('/users/:id/status', updateUserStatus);
adminRouter.delete('/users/:id', deleteUser);
app.use('/api/admin', adminRouter);

// Faculty Routes
import { getFacultyStats, getStudents, getModules, createModule, deleteModule, getQuizzes, createQuiz, deleteQuiz, getDiscussions, flagDiscussion, deleteDiscussion, createLesson, deleteLesson, getStudentProgress } from './controllers/facultyController';

const facultyRouter = express.Router();
facultyRouter.use(authenticateUser);
facultyRouter.get('/stats', getFacultyStats);

// Student listing
facultyRouter.get('/students', getStudents);

// Content Management
facultyRouter.get('/modules', getModules);
facultyRouter.post('/modules', createModule);
facultyRouter.delete('/modules/:id', deleteModule);

facultyRouter.post('/lessons', createLesson);
facultyRouter.delete('/lessons/:id', deleteLesson);

facultyRouter.get('/quizzes', getQuizzes);
facultyRouter.post('/quizzes', createQuiz);
facultyRouter.delete('/quizzes/:id', deleteQuiz);

// Discussions
facultyRouter.get('/discussions', getDiscussions);
facultyRouter.patch('/discussions/:id/flag', flagDiscussion);
facultyRouter.delete('/discussions/:id', deleteDiscussion);

facultyRouter.get('/student-progress', getStudentProgress);

app.use('/api/faculty', facultyRouter);

// Student Routes
import { getStudentStats, getModulesWithProgress, getLesson, markLessonComplete, getFinancialTip, submitQuizResult, downloadTemplate, submitForumPost, getForumPosts, getBlogPosts, getLatestQuizzes, getQuiz, getQuizByModule, deleteOwnAccount, likeForumPost, addForumComment, getForumComments } from './controllers/studentController';

const studentRouter = express.Router();
studentRouter.use(authenticateUser);
studentRouter.get('/dashboard', getStudentStats);
studentRouter.get('/modules', getModulesWithProgress);
studentRouter.get('/lessons/:id', getLesson);
studentRouter.post('/lessons/:id/complete', markLessonComplete);
studentRouter.get('/financial-tips', getFinancialTip);
studentRouter.post('/quizzes/complete', submitQuizResult);
studentRouter.get('/quizzes/latest', getLatestQuizzes);
studentRouter.get('/quizzes/module/:moduleId', getQuizByModule);
studentRouter.get('/quizzes/:id', getQuiz);
studentRouter.post('/templates/download', downloadTemplate);
studentRouter.get('/forum/posts', getForumPosts);
studentRouter.get('/blog/posts', getBlogPosts);
studentRouter.post('/forum/post', submitForumPost);
studentRouter.put('/forum/posts/:id/like', likeForumPost);
studentRouter.post('/forum/posts/:id/comments', addForumComment);
studentRouter.get('/forum/posts/:id/comments', getForumComments);
studentRouter.delete('/account', deleteOwnAccount);
app.use('/api/student', studentRouter);


app.get('/', (req, res) => {
    res.send('SmartCash Backend is running!');
});

server.listen(port, () => {
    console.log(`Server is running on port ${port} with WebSockets enabled`);
});
