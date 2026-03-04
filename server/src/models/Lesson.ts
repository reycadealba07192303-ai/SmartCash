import mongoose, { Schema, Document } from 'mongoose';

export interface ILesson extends Document {
    module_id: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    content: string;
    video_url?: string;
    type: 'video' | 'article';
    duration: string;
    order_index: number;
    created_by: mongoose.Types.ObjectId;
    createdAt: Date;
}

const LessonSchema: Schema = new Schema({
    module_id: { type: Schema.Types.ObjectId, ref: 'Module', required: true },
    title: { type: String, required: true },
    description: { type: String },
    content: { type: String, required: true },
    video_url: { type: String },
    type: { type: String, enum: ['video', 'article'], required: true },
    duration: { type: String, required: true },
    order_index: { type: Number, default: 0 },
    created_by: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: { createdAt: true, updatedAt: false } });

export default mongoose.model<ILesson>('Lesson', LessonSchema);
