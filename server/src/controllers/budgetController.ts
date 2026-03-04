import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Transaction from '../models/Transaction';
import SavingsGoal from '../models/SavingsGoal';

// --- Transactions ---

export const getTransactions = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;

        const transactions = await Transaction.find({ user_id: userId }).sort({ date: -1 });

        // Map _id to id to match what the frontend expects from Supabase
        const mappedData = transactions.map(t => ({
            ...t.toObject(),
            id: t._id
        }));

        res.json(mappedData);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

import { awardBadgeByName } from '../services/badgeAwardService';

export const addTransaction = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const { type, category, amount, description, date } = req.body;

        const newTransaction = new Transaction({
            user_id: userId,
            type,
            category,
            amount,
            description,
            date: date || new Date()
        });

        await newTransaction.save();

        // Check for badge earning
        const transactionCount = await Transaction.countDocuments({ user_id: userId });
        if (transactionCount >= 5) {
            await awardBadgeByName(userId, 'Budget Beginner');
        }

        res.status(201).json({ ...newTransaction.toObject(), id: newTransaction._id });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteTransaction = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const result = await Transaction.findOneAndDelete({ _id: id, user_id: userId });

        if (!result) {
            return res.status(404).json({ error: 'Transaction not found or not authorized to delete' });
        }

        res.json({ message: 'Transaction deleted' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// --- Savings Goals ---

export const getSavingsGoals = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;

        const goals = await SavingsGoal.find({ user_id: userId });

        const mappedData = goals.map(g => ({
            ...g.toObject(),
            id: g._id
        }));

        res.json(mappedData);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const addSavingsGoal = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const { name, target_amount, current_amount } = req.body;

        const newGoal = new SavingsGoal({
            user_id: userId,
            name,
            target_amount,
            current_amount: current_amount || 0
        });

        await newGoal.save();

        res.status(201).json({ ...newGoal.toObject(), id: newGoal._id });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateSavingsGoal = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { name, target_amount, current_amount } = req.body;

        const updatedGoal = await SavingsGoal.findOneAndUpdate(
            { _id: id, user_id: userId },
            { name, target_amount, current_amount },
            { new: true }
        );

        if (!updatedGoal) {
            return res.status(404).json({ error: 'Savings goal not found or not authorized to update' });
        }

        res.json({ ...updatedGoal.toObject(), id: updatedGoal._id });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
