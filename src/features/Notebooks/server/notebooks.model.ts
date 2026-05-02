import mongoose, { Schema } from 'mongoose';
import type { Notebook } from '../types/notebooks.types';

type NotebookDocument = Omit<Notebook, 'userId'> & {
  userId: mongoose.Types.ObjectId | string;
};

const notebookSchema = new Schema<NotebookDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    kind: {
      type: String,
      required: true,
      enum: ['custom', 'player'],
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      default: '',
    },
    playerName: {
      type: String,
      trim: true,
    },
    playerId: {
      type: String,
      trim: true,
      index: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
  },
);

notebookSchema.index({ kind: 1, updatedAt: -1 });
notebookSchema.index({ playerName: 1 });
notebookSchema.index({ userId: 1, kind: 1, updatedAt: -1 });
notebookSchema.index({ userId: 1, playerId: 1 });

export const NotebookModel =
  mongoose.models.Notebook ||
  mongoose.model<NotebookDocument>('Notebook', notebookSchema);
