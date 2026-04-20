import { NextResponse } from 'next/server';
import {
  LeagueFiltersSchema,
  LeagueSchema,
} from '@/features/Leagues/types/leagues.types';
import { leaguesService } from '@/features/Leagues/server/leagues.service';
import { seedDefaultLeagues } from '@/features/Leagues/utils/leagues.seed';
import { connectDb } from '@/shared/server/connect-db';

export async function GET(request: Request) {
  try {
    await connectDb();
    await seedDefaultLeagues();

    const filters = LeagueFiltersSchema.parse(
      Object.fromEntries(new URL(request.url).searchParams.entries()),
    );
    const { leagues, pagination } = await leaguesService.getLeagues(filters);

    return NextResponse.json({
      success: true,
      data: leagues,
      pagination: {
        total: pagination.total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.max(1, Math.ceil(pagination.total / pagination.limit)),
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch leagues';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDb();

    const payload = LeagueSchema.parse(await request.json());
    const league = await leaguesService.upsertLeague(payload);

    return NextResponse.json({ success: true, data: league });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to save league';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
