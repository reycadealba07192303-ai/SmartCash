import express from 'express';
import { submitPayment, getPendingPayments, approvePayment, rejectPayment, getMyPayments } from '../controllers/paymentController';
import { authenticateUser, requireAdmin } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/submit', authenticateUser, submitPayment);
router.get('/me', authenticateUser, getMyPayments);
router.get('/pending', authenticateUser, requireAdmin, getPendingPayments);
router.post('/:id/approve', authenticateUser, requireAdmin, approvePayment);
router.post('/:id/reject', authenticateUser, requireAdmin, rejectPayment);

export default router;
