import { isValidObjectId } from 'mongoose';
import { ForbiddenError } from '@/shared/server/http-errors';
import { NotebookModel } from './notebooks.model';
import type {
  CreateNotebookInput,
  Notebook,
  NotebookFilters,
  UpdateNotebookInput,
} from '../types/notebooks.types';

export class NotebooksService {
  async listNotebooks(
    userId: string,
    filters: NotebookFilters = {},
  ): Promise<Notebook[]> {
    const query: Record<string, unknown> = {
      userId,
    };

    if (filters.kind) {
      query.kind = filters.kind;
    }

    if (filters.playerName) {
      query.playerName = filters.playerName;
    }

    if (filters.playerId) {
      query.playerId = filters.playerId;
    }

    return (await NotebookModel.find(query)
      .sort({ updatedAt: -1 })
      .lean()) as unknown as Notebook[];
  }

  async getNotebookById(id: string, userId: string): Promise<Notebook | null> {
    if (!isValidObjectId(id)) {
      return null;
    }

    const notebook = (await NotebookModel.findOne({
      _id: id,
      userId,
    }).lean()) as unknown as Notebook | null;

    if (notebook) {
      return notebook;
    }

    const existingNotebook = await NotebookModel.exists({ _id: id });

    if (existingNotebook) {
      throw new ForbiddenError('Notebook does not belong to user');
    }

    return null;
  }

  async createNotebook(
    userId: string,
    input: CreateNotebookInput,
  ): Promise<Notebook> {
    if (input.kind === 'player' && input.playerId) {
      const existing = (await NotebookModel.findOneAndUpdate(
        {
          userId,
          kind: 'player',
          $or: [
            { playerId: input.playerId },
            { playerId: { $exists: false }, playerName: input.playerName },
          ],
        },
        {
          $set: {
            userId,
            name: input.name,
            content: input.content ?? '',
            playerName: input.playerName,
            playerId: input.playerId,
          },
        },
        {
          new: true,
        },
      ).lean()) as unknown as Notebook | null;

      if (existing) {
        return existing;
      }
    }

    const notebook = await NotebookModel.create({
      userId,
      kind: input.kind,
      name: input.name,
      content: input.content ?? '',
      playerName: input.playerName,
      playerId: input.playerId,
    });

    return notebook.toObject() as unknown as Notebook;
  }

  async updateNotebook(
    id: string,
    userId: string,
    updates: UpdateNotebookInput,
  ): Promise<Notebook | null> {
    if (!isValidObjectId(id)) {
      return null;
    }

    const notebook = (await NotebookModel.findOneAndUpdate(
      {
        _id: id,
        userId,
      },
      {
        $set: updates,
      },
      {
        new: true,
        runValidators: true,
      },
    ).lean()) as unknown as Notebook | null;

    if (notebook) {
      return notebook;
    }

    const existingNotebook = await NotebookModel.exists({ _id: id });

    if (existingNotebook) {
      throw new ForbiddenError('Notebook does not belong to user');
    }

    return null;
  }

  async deleteNotebook(id: string, userId: string): Promise<Notebook | null> {
    if (!isValidObjectId(id)) {
      return null;
    }

    const notebook = (await NotebookModel.findOneAndDelete({
      _id: id,
      userId,
    }).lean()) as unknown as Notebook | null;

    if (notebook) {
      return notebook;
    }

    const existingNotebook = await NotebookModel.exists({ _id: id });

    if (existingNotebook) {
      throw new ForbiddenError('Notebook does not belong to user');
    }

    return null;
  }
}

export const notebooksService = new NotebooksService();
