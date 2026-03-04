import mongoose, { Schema, Document } from 'mongoose';

export interface IForumPost extends Document {
    author_id: mongoose.Types.ObjectId;
    author_name?: string;
    author_avatar?: string;
    title: string;
    content: string;
    likes: number;
    likedBy: mongoose.Types.ObjectId[];
    comments_count: number;
    tags: string[];
    is_flagged: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ForumPostSchema: Schema = new Schema({
    author_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    author_name: { type: String },
    author_avatar: { type: String },
    title: { type: String, required: true },
    content: { type: String, required: true },
    likes: { type: Number, default: 0 },
    likedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    comments_count: { type: Number, default: 0 },
    tags: [{ type: String }],
    is_flagged: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model<IForumPost>('ForumPost', ForumPostSchema);
