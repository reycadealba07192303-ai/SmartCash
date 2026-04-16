import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Payment from '../models/Payment';
import User from '../models/User';
import { verifyReceiptImage } from '../services/aiService';

export const submitPayment = async (req: AuthRequest, res: Response) => {
    try {
        const { amount, receiptImage, senderNumber } = req.body;
        const userId = req.user._id || req.user.id;

        if (!amount || !receiptImage || !senderNumber) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Verify receipt via AI
        const verification = await verifyReceiptImage(receiptImage);
        if (!verification.isValid) {
            return res.status(400).json({ error: 'IMAGE_INVALID', message: 'The uploaded image does not appear to be a valid receipt. Please upload a clear photo of your payment or transaction slip.' });
        }

        // Verify if extracted amount matches the expected amount
        if (verification.amount !== undefined && verification.amount !== null) {
            const expectedAmount = Math.round(parseFloat(amount));
            const actualAmount = Math.round(verification.amount);
            
            if (actualAmount !== expectedAmount) {
                return res.status(400).json({ 
                    error: 'AMOUNT_MISMATCH', 
                    message: `The receipt shows a payment of ₱${actualAmount}, but the required subscription amount is ₱${expectedAmount}. Please upload the correct transaction slip.` 
                });
            }
        }

        const newPayment = new Payment({
            user: userId,
            amount: parseFloat(amount),
            extractedAmount: verification.amount,
            referenceNumber: verification.referenceNumber,
            senderNumber: senderNumber, // Use inputted number, not AI
            receiptImage,
            status: 'pending'
        });
        await newPayment.save();

        res.status(201).json({ message: 'Payment submitted successfully and is pending review.' });
    } catch (error) {
        console.error('Error submitting payment:', error);
        res.status(500).json({ error: 'Server error processing the payment.' });
    }
};

export const getPendingPayments = async (req: AuthRequest, res: Response) => {
    try {
        // Return all payments so history remains
        const payments = await Payment.find({})
             .populate('user', 'full_name email role school_id')
             .sort({ createdAt: -1 }); // Newest first
        res.json(payments);
    } catch (error) {
        res.status(500).json({ error: 'Server error fetching payments.' });
    }
};

export const getMyPayments = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user._id || req.user.id;
        const payments = await Payment.find({ user: userId })
             .sort({ createdAt: -1 });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ error: 'Server error fetching your payments.' });
    }
};

export const approvePayment = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const payment = await Payment.findById(id).populate('user');
        
        if (!payment) return res.status(404).json({ error: 'Payment not found' });
        if (payment.status !== 'pending') return res.status(400).json({ error: 'Payment is not pending' });

        payment.status = 'approved';
        await payment.save();

        // Upgrade user
        const addition = 30; // 30 days default
        const newExpiry = new Date();
        newExpiry.setDate(newExpiry.getDate() + addition);
        
        await User.findByIdAndUpdate(payment.user._id, { $set: { isPremium: true, premiumExpiresAt: newExpiry } });

        res.json({ message: 'Payment approved successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Server error approving payment.' });
    }
};

export const rejectPayment = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const payment = await Payment.findById(id);
        
        if (!payment) return res.status(404).json({ error: 'Payment not found' });
        
        payment.status = 'rejected';
        await payment.save();

        res.json({ message: 'Payment rejected.' });
    } catch (error) {
        res.status(500).json({ error: 'Server error rejecting payment.' });
    }
};
