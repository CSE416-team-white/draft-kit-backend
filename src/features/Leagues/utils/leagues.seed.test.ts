import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { beforeAll, beforeEach, afterAll, describe, expect, it } from 'vitest';
import { connectDb } from '@/shared/server/connect-db';
import { LeagueModel } from '../server/leagues.model';
import { seedDefaultLeagues } from './leagues.seed';

function loadLocalMongoEnv() {
  if (process.env.MONGODB_URI) {
    return;
  }

  const envPath = path.resolve(process.cwd(), '.env.local');
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

describe('seedDefaultLeagues', () => {
  beforeAll(async () => {
    loadLocalMongoEnv();
    await connectDb();
  });

  beforeEach(async () => {
    await LeagueModel.deleteMany({
      externalId: 'draft-kit-standard-auction',
    });
  });

  afterAll(async () => {
    await LeagueModel.deleteMany({
      externalId: 'draft-kit-standard-auction',
    });
    await mongoose.disconnect();
  });

  it('seeds the default league into the real database', async () => {
    await seedDefaultLeagues();

    const league = await LeagueModel.findOne({
      externalId: 'draft-kit-standard-auction',
    }).lean();

    expect(league).toBeTruthy();
    expect(league?.name).toBe('Draft Kit Standard Auction');
  });

  it('does not create duplicates on repeated seed runs', async () => {
    await seedDefaultLeagues();
    await seedDefaultLeagues();

    const count = await LeagueModel.countDocuments({
      externalId: 'draft-kit-standard-auction',
    });

    expect(count).toBe(1);
  });
});
