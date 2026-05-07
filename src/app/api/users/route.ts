import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { UpsertProviderUserSchema } from '@/features/Users/types/users.types';
import { usersService } from '@/features/Users/server/users.service';
import { connectDb } from '@/shared/server/connect-db';
import {
  assertInternalAuth,
} from '@/shared/server/get-user-id';
import { HttpError } from '@/shared/server/http-errors';

export async function POST(request: Request) {
  try {
    await connectDb();
    assertInternalAuth(request);

    const payload = UpsertProviderUserSchema.parse(await request.json());
    const user = await usersService.upsertProviderUser(payload);

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 },
      );
    }

    if (error instanceof HttpError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.status },
      );
    }

    const message =
      error instanceof Error ? error.message : 'Failed to sync user';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
