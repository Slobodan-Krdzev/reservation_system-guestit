import { Schema, model, type Document } from 'mongoose';

export type SubscriptionTier = 'free' | 'premium';
export type SubscriptionStatus = 'inactive' | 'active' | 'past_due';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  passwordHash: string;
  avatarUrl?: string;
  isVerified: boolean;
  verificationToken?: string;
  subscription: {
    tier: SubscriptionTier;
    status: SubscriptionStatus;
    expiresAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema(
  {
    tier: { type: String, enum: ['free', 'premium'], default: 'free' },
    status: { type: String, enum: ['inactive', 'active', 'past_due'], default: 'inactive' },
    expiresAt: Date,
  },
  { _id: false },
);

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    avatarUrl: String,
    isVerified: { type: Boolean, default: false },
    verificationToken: String,
    subscription: { type: subscriptionSchema, default: () => ({}) },
  },
  { timestamps: true },
);

export const User = model<IUser>('User', userSchema);

