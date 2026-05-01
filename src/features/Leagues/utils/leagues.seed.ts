import type { LeagueInput } from '../types/leagues.types';
import { leaguesService } from '../server/leagues.service';
import { defaultLeagues } from '../server/default-leagues';
import { usersService } from '@/features/Users/server/users.service';

export async function seedDefaultLeagues(): Promise<void> {
  try {
    console.log('Seeding default leagues...');
    const systemUser = await usersService.getSystemUser();
    const count = await leaguesService.upsertLeagues(
      systemUser._id,
      defaultLeagues as LeagueInput[],
    );
    console.log(`✓ Seeded ${count} default leagues`);
  } catch (error) {
    console.error('Failed to seed default leagues:', error);
  }
}
