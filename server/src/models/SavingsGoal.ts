import mongoose, { Schema, Document } from 'mongoose';

export interface ISavingsGoal extends Document {
    user_id: mongoose.Types.ObjectId;
    name: string;
    target_amount: number;
    current_amount: number;
    createdAt: Date;
    updatedAt: Date;
}

const SavingsGoalSchema: Schema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    target_amount: { type: Number, required: true },
    current_amount: { type: Number, required: true, default: 0 },
}, { timestamps: true });

export default mongoose.model<ISavingsGoal>('SavingsGoal', SavingsGoalSchema);
