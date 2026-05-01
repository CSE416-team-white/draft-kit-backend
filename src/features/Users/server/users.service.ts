import { isValidObjectId } from 'mongoose';
import { UserModel } from './users.model';
import type { CreateUserInput, User } from '../types/users.types';

export const SYSTEM_USER_EXTERNAL_ID = 'system';
export const SYSTEM_USER_NAME = 'System';

export class UsersService {
  async getOrCreateUser(input: CreateUserInput): Promise<User> {
    if (input.externalId) {
      const user = await UserModel.findOneAndUpdate(
        { externalId: input.externalId },
        {
          $set: {
            name: input.name,
          },
          $setOnInsert: {
            externalId: input.externalId,
          },
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
        },
      ).lean();

      return user as User;
    }

    const user = await UserModel.create({
      name: input.name,
    });

    return user.toObject() as User;
  }

  async getSystemUser(): Promise<User> {
    return this.getOrCreateUser({
      name: SYSTEM_USER_NAME,
      externalId: SYSTEM_USER_EXTERNAL_ID,
    });
  }

  async getUserById(id: string): Promise<User | null> {
    if (!isValidObjectId(id)) {
      return null;
    }

    return (await UserModel.findById(id).lean()) as User | null;
  }

  async deleteUser(id: string): Promise<User | null> {
    if (!isValidObjectId(id)) {
      return null;
    }

    return (await UserModel.findByIdAndDelete(id).lean()) as User | null;
  }
}

export const usersService = new UsersService();
