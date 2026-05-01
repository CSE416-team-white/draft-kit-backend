import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import {
  CreateNotebookSchema,
  NotebookFiltersSchema,
} from '@/features/Notebooks/types/notebooks.types';
import { notebooksService } from '@/features/Notebooks/server/notebooks.service';
import { connectDb } from '@/shared/server/connect-db';
import { getUserId } from '@/shared/server/get-user-id';
import { HttpError } from '@/shared/server/http-errors';

export async function GET(request: Request) {
  try {
    await connectDb();
    const userId = getUserId(request);

    const filters = NotebookFiltersSchema.parse(
      Object.fromEntries(new URL(request.url).searchParams.entries()),
    );
    const notebooks = await notebooksService.listNotebooks(userId, filters);

    return NextResponse.json({
      success: true,
      data: notebooks,
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
      error instanceof Error ? error.message : 'Failed to fetch notebooks';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDb();
    const userId = getUserId(request);

    const payload = CreateNotebookSchema.parse(await request.json());
    const notebook = await notebooksService.createNotebook(userId, payload);

    return NextResponse.json(
      {
        success: true,
        data: notebook,
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

    if (error instanceof HttpError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.status },
      );
    }

    const message =
      error instanceof Error ? error.message : 'Failed to save notebook';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
