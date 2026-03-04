import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
    user_id: mongoose.Types.ObjectId;
    type: 'income' | 'expense';
    category: string;
    amount: number;
    description?: string;
    date: Date;
    createdAt: Date;
}

const TransactionSchema: Schema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['income', 'expense'], required: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    description: { type: String },
    date: { type: Date, default: Date.now },
}, { timestamps: { createdAt: true, updatedAt: false } });

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);
