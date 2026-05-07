import { NextResponse } from 'next/server';
import { usersService } from '@/features/Users/server/users.service';
import { connectDb } from '@/shared/server/connect-db';
import { getAuthenticatedUserId } from '@/shared/server/get-user-id';
import { HttpError } from '@/shared/server/http-errors';

export async function GET(request: Request) {
  try {
    await connectDb();

    const userId = getAuthenticatedUserId(request);
    const user = await usersService.getUserById(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.status },
      );
    }

    const message =
      error instanceof Error ? error.message : 'Failed to fetch user';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
