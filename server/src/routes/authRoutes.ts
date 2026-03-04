import express from 'express';
import { register, login, forgotPassword, updatePassword, getProfile, updateProfile } from '../controllers/authController';
import { authenticateUser, requireAdmin, AuthRequest } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/update-password', updatePassword);

// Example protected routes
// Example protected routes
router.get('/profile', authenticateUser, getProfile);
router.put('/profile', authenticateUser, updateProfile);

router.get('/admin-dashboard', authenticateUser, requireAdmin, (req: AuthRequest, res) => {
    res.json({ message: 'Welcome Admin', user: req.user });
});

export default router;
