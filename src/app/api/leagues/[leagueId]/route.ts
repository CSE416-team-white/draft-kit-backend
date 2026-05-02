import { NextResponse } from 'next/server';
import { leaguesService } from '@/features/Leagues/server/leagues.service';
import { connectDb } from '@/shared/server/connect-db';
import { getUserId } from '@/shared/server/get-user-id';
import { HttpError } from '@/shared/server/http-errors';

type RouteContext = {
  params: Promise<{ leagueId: string }>;
};

function isObjectId(value: string): boolean {
  return /^[a-f0-9]{24}$/i.test(value);
}

export async function GET(request: Request, context: RouteContext) {
  try {
    await connectDb();
    const userId = getUserId(request);
    const { leagueId } = await context.params;

    const league = isObjectId(leagueId)
      ? await leaguesService.getLeagueById(leagueId, userId)
      : await leaguesService.getLeagueByExternalId(leagueId, userId);

    if (!league) {
      return NextResponse.json(
        { success: false, message: 'League not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: league });
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.status },
      );
    }

    const message =
      error instanceof Error ? error.message : 'Failed to fetch league';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    await connectDb();
    const userId = getUserId(request);
    const { leagueId } = await context.params;

    const existingLeague = isObjectId(leagueId)
      ? await leaguesService.getLeagueById(leagueId, userId)
      : await leaguesService.getLeagueByExternalId(leagueId, userId);

    if (!existingLeague) {
      return NextResponse.json(
        { success: false, message: 'League not found' },
        { status: 404 },
      );
    }

    const deletedLeague = await leaguesService.deleteLeagueById(
      existingLeague._id,
      userId,
    );

    return NextResponse.json({ success: true, data: deletedLeague });
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.status },
      );
    }

    const message =
      error instanceof Error ? error.message : 'Failed to delete league';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
