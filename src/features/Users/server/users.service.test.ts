import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { connectDb } from '@/shared/server/connect-db';
import { UserModel } from './users.model';
import { UsersService } from './users.service';

const envPath = path.resolve(process.cwd(), '.env.local');
const envTextForCheck = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
const hasMongoConfig =
  Boolean(process.env.MONGODB_URI) ||
  /(^|\n)\s*MONGODB_URI\s*=/.test(envTextForCheck);
const describeWithMongo = hasMongoConfig ? describe : describe.skip;

function loadLocalMongoEnv() {
  if (process.env.MONGODB_URI) {
    return;
  }

  const envText = fs.readFileSync(envPath, 'utf8');

  for (const line of envText.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const equalsIndex = trimmed.indexOf('=');
    if (equalsIndex === -1) continue;

    const key = trimmed.slice(0, equalsIndex);
    const value = trimmed.slice(equalsIndex + 1);

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

describeWithMongo('UsersService', () => {
  const service = new UsersService();
  const testPrefix = 'vitest-user-service';

  beforeAll(async () => {
    loadLocalMongoEnv();
    await connectDb();
  });

  beforeEach(async () => {
    await UserModel.deleteMany({
      $or: [
        { externalId: { $regex: `^${testPrefix}` } },
        { providerSubject: { $regex: `^${testPrefix}` } },
        { name: { $regex: `^${testPrefix}` } },
      ],
    });
  });

  afterAll(async () => {
    await UserModel.deleteMany({
      $or: [
        { externalId: { $regex: `^${testPrefix}` } },
        { providerSubject: { $regex: `^${testPrefix}` } },
        { name: { $regex: `^${testPrefix}` } },
      ],
    });
    await mongoose.disconnect();
  });

  it('creates a user and loads it by id', async () => {
    const created = await service.getOrCreateUser({
      name: `${testPrefix}-created`,
    });

    const loaded = await service.getUserById(created._id);

    expect(loaded?._id.toString()).toBe(created._id.toString());
    expect(loaded?.name).toBe(`${testPrefix}-created`);
  });

  it('reuses the same user for a repeated externalId', async () => {
    const created = await service.getOrCreateUser({
      name: `${testPrefix}-original`,
      externalId: `${testPrefix}-external`,
    });

    const reused = await service.getOrCreateUser({
      name: `${testPrefix}-updated`,
      externalId: `${testPrefix}-external`,
    });

    expect(reused._id.toString()).toBe(created._id.toString());
    expect(reused.name).toBe(`${testPrefix}-updated`);
  });

  it('deletes a user', async () => {
    const created = await service.getOrCreateUser({
      name: `${testPrefix}-delete`,
      externalId: `${testPrefix}-delete-external`,
    });

    const deleted = await service.deleteUser(created._id);
    const loaded = await service.getUserById(created._id);

    expect(deleted?._id.toString()).toBe(created._id.toString());
    expect(loaded).toBeNull();
  });

  it('reuses the same Google user for a repeated provider subject', async () => {
    const created = await service.upsertProviderUser({
      authProvider: 'google',
      providerSubject: `${testPrefix}-google-subject`,
      email: 'first@example.com',
      name: `${testPrefix}-google-user`,
      avatarUrl: 'https://example.com/avatar-1.png',
    });

    const reused = await service.upsertProviderUser({
      authProvider: 'google',
      providerSubject: `${testPrefix}-google-subject`,
      email: 'updated@example.com',
      name: `${testPrefix}-google-user-updated`,
      avatarUrl: 'https://example.com/avatar-2.png',
    });

    expect(reused._id.toString()).toBe(created._id.toString());
    expect(reused.name).toBe(`${testPrefix}-google-user-updated`);
    expect(reused.email).toBe('updated@example.com');
    expect(reused.avatarUrl).toBe('https://example.com/avatar-2.png');
  });
});
