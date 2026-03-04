import mongoose, { Schema, Document } from 'mongoose';

export interface IForumComment extends Document {
    post_id: mongoose.Types.ObjectId;
    author_id: mongoose.Types.ObjectId;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

const ForumCommentSchema: Schema = new Schema({
    post_id: { type: Schema.Types.ObjectId, ref: 'ForumPost', required: true },
    author_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model<IForumComment>('ForumComment', ForumCommentSchema);
