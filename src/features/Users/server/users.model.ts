import mongoose, { Schema } from 'mongoose';
import type { User } from '../types/users.types';

const userSchema = new Schema<User>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    externalId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

export const UserModel: mongoose.Model<User> =
  mongoose.models.User || mongoose.model<User>('User', userSchema);
