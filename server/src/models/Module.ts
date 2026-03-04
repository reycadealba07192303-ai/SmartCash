import mongoose, { Schema, Document } from 'mongoose';

export interface IModule extends Document {
    title: string;
    description?: string;
    category: 'Financial Literacy' | 'Entrepreneurship' | 'Investing';
    image_url?: string;
    created_by: mongoose.Types.ObjectId;
    createdAt: Date;
}

const ModuleSchema: Schema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    category: {
        type: String,
        enum: ['Financial Literacy', 'Entrepreneurship', 'Investing'],
        required: true
    },
    image_url: { type: String },
    created_by: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: { createdAt: true, updatedAt: false } });

export default mongoose.model<IModule>('Module', ModuleSchema);
