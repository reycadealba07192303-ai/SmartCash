import mongoose, { Schema, Document } from 'mongoose';

export interface IBadge extends Document {
    name: string;
    description: string;
    icon: string;
    color?: string;
    bg_color?: string;
    criteria?: any;
    createdAt: Date;
}

const BadgeSchema: Schema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
    color: { type: String },
    bg_color: { type: String },
    criteria: { type: Schema.Types.Mixed },
}, { timestamps: { createdAt: true, updatedAt: false } });

export const Badge = mongoose.model<IBadge>('Badge', BadgeSchema);

export interface IUserBadge extends Document {
    user_id: mongoose.Types.ObjectId;
    badge_id: mongoose.Types.ObjectId;
    earned_at: Date;
}

const UserBadgeSchema: Schema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    badge_id: { type: Schema.Types.ObjectId, ref: 'Badge', required: true },
    earned_at: { type: Date, default: Date.now },
});

// Ensure uniqueness of user_id and badge_id combination
UserBadgeSchema.index({ user_id: 1, badge_id: 1 }, { unique: true });

export const UserBadge = mongoose.model<IUserBadge>('UserBadge', UserBadgeSchema);
