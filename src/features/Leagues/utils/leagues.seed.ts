import type { LeagueInput } from '../types/leagues.types';
import { leaguesService } from '../server/leagues.service';
import { defaultLeagues } from '../server/default-leagues';

export async function seedDefaultLeagues(): Promise<void> {
  try {
    console.log('Seeding default leagues...');
    const count = await leaguesService.upsertLeagues(
      defaultLeagues as Omit<LeagueInput, '_id' | 'createdAt' | 'updatedAt'>[],
    );
    console.log(`✓ Seeded ${count} default leagues`);
  } catch (error) {
    console.error('Failed to seed default leagues:', error);
  }
}
