import mongoose, { Schema, Document } from 'mongoose';

export interface IUserLessonProgress extends Document {
    user_id: mongoose.Types.ObjectId;
    lesson_id: mongoose.Types.ObjectId;
    completed: boolean;
    completed_at: Date;
}

const UserLessonProgressSchema: Schema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    lesson_id: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true },
    completed: { type: Boolean, default: true },
    completed_at: { type: Date, default: Date.now }
});

// A user can only have one progress record per lesson
UserLessonProgressSchema.index({ user_id: 1, lesson_id: 1 }, { unique: true });

export default mongoose.model<IUserLessonProgress>('UserLessonProgress', UserLessonProgressSchema);
