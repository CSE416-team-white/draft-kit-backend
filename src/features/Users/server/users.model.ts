import mongoose, { Schema } from 'mongoose';
import type { User } from '../types/users.types';

const userSchema = new Schema<User>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    authProvider: {
      type: String,
      enum: ['google'],
      trim: true,
    },
    providerSubject: {
      type: String,
      trim: true,
    },
    avatarUrl: {
      type: String,
      trim: true,
    },
    externalId: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.index({ externalId: 1 }, { unique: true, sparse: true });
userSchema.index(
  { authProvider: 1, providerSubject: 1 },
  { unique: true, sparse: true },
);

export const UserModel: mongoose.Model<User> =
  mongoose.models.User || mongoose.model<User>('User', userSchema);
