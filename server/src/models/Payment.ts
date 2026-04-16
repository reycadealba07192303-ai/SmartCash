import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
    user: mongoose.Types.ObjectId;
    amount: number;
    extractedAmount?: number;
    referenceNumber?: string;
    senderNumber?: string;
    receiptImage: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: Date;
}

const PaymentSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    extractedAmount: { type: Number },
    referenceNumber: { type: String },
    senderNumber: { type: String },
    receiptImage: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}, { timestamps: true });

export default mongoose.model<IPayment>('Payment', PaymentSchema);
