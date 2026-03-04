import mongoose, { Schema, Document } from 'mongoose';

export interface IQuizQuestion {
    text: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
}

export interface IQuiz extends Document {
    module_id: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    questions: IQuizQuestion[];
    created_by: mongoose.Types.ObjectId;
    createdAt: Date;
}

const QuestionSchema = new Schema({
    text: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: Number, required: true },
    explanation: { type: String }
});

const QuizSchema: Schema = new Schema({
    module_id: { type: Schema.Types.ObjectId, ref: 'Module', required: false },
    title: { type: String, required: true },
    description: { type: String },
    questions: [QuestionSchema],
    created_by: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: { createdAt: true, updatedAt: false } });

export default mongoose.model<IQuiz>('Quiz', QuizSchema);
