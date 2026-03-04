import mongoose, { Schema, Document } from 'mongoose';

export interface IBlogPost extends Document {
    author_id: mongoose.Types.ObjectId;
    author_name: string;
    title: string;
    excerpt: string;
    content: string;
    category: string;
    image_url?: string;
    read_time_minutes: number;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}

const BlogPostSchema: Schema = new Schema({
    author_id: { type: Schema.Types.ObjectId, ref: 'User' },
    author_name: { type: String, required: true },
    title: { type: String, required: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, required: true },
    image_url: { type: String },
    read_time_minutes: { type: Number, default: 5 },
    tags: [{ type: String }],
}, { timestamps: true });

export const BlogPost = mongoose.model<IBlogPost>('BlogPost', BlogPostSchema);
