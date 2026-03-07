import mongoose, { Document, Schema } from 'mongoose';

export interface IQuizAttempt extends Document {
    user_id: mongoose.Types.ObjectId;
    quiz_id: string; // The specific quiz or generated topic
    quiz_title: string;
    score: number;
    total: number;
    percentage: number;
    answers: number[];
    questions: { text: string; options: string[]; correctAnswer: number }[];
    taken_at: Date;
}

const QuizAttemptSchema: Schema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    quiz_id: { type: String, required: true },
    quiz_title: { type: String, required: true },
    score: { type: Number, required: true },
    total: { type: Number, required: true },
    percentage: { type: Number, required: true },
    answers: [{ type: Number }],
    questions: [{
        text: { type: String },
        options: [{ type: String }],
        correctAnswer: { type: Number }
    }],
    taken_at: { type: Date, default: Date.now }
});

export default mongoose.model<IQuizAttempt>('QuizAttempt', QuizAttemptSchema);
