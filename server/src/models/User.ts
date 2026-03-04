import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    email: string;
    passwordHash?: string; // Add password hash since we are migrating from Supabase Auth
    full_name: string;
    role: 'student' | 'teacher' | 'admin';
    school_id?: string;
    grade_level?: string;
    strand?: string;
    avatar_url?: string;
    status: 'Active' | 'Pending' | 'Suspended' | 'Inactive';
    last_active: Date;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema({
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    full_name: { type: String, required: true },
    role: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' },
    school_id: { type: String },
    grade_level: { type: String },
    strand: { type: String },
    avatar_url: { type: String },
    status: { type: String, enum: ['Active', 'Pending', 'Suspended', 'Inactive'], default: 'Active' },
    last_active: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
