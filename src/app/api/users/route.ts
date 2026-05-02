import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { CreateUserSchema } from '@/features/Users/types/users.types';
import { usersService } from '@/features/Users/server/users.service';
import { connectDb } from '@/shared/server/connect-db';

export async function POST(request: Request) {
  try {
    await connectDb();

    const payload = CreateUserSchema.parse(await request.json());
    const user = await usersService.getOrCreateUser(payload);

    return NextResponse.json(
      {
        success: true,
        data: user,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 },
      );
    }

    const message =
      error instanceof Error ? error.message : 'Failed to create user';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
