import { NextResponse } from 'next/server';
import { leaguesService } from '@/features/Leagues/server/leagues.service';
import { connectDb } from '@/shared/server/connect-db';

type RouteContext = {
  params: Promise<{ leagueId: string }>;
};

function isObjectId(value: string): boolean {
  return /^[a-f0-9]{24}$/i.test(value);
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    await connectDb();
    const { leagueId } = await context.params;

    const league = isObjectId(leagueId)
      ? await leaguesService.getLeagueById(leagueId)
      : await leaguesService.getLeagueByExternalId(leagueId);

    if (!league) {
      return NextResponse.json(
        { success: false, message: 'League not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: league });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch league';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await connectDb();
    const { leagueId } = await context.params;

    const existingLeague = isObjectId(leagueId)
      ? await leaguesService.getLeagueById(leagueId)
      : await leaguesService.getLeagueByExternalId(leagueId);

    if (!existingLeague) {
      return NextResponse.json(
        { success: false, message: 'League not found' },
        { status: 404 },
      );
    }

    const deletedLeague = await leaguesService.deleteLeagueById(
      existingLeague._id,
    );

    return NextResponse.json({ success: true, data: deletedLeague });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to delete league';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
