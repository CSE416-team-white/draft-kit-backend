import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { UpdateNotebookSchema } from '@/features/Notebooks/types/notebooks.types';
import { notebooksService } from '@/features/Notebooks/server/notebooks.service';
import { connectDb } from '@/shared/server/connect-db';
import { getAuthenticatedUserId } from '@/shared/server/get-user-id';
import { HttpError } from '@/shared/server/http-errors';

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    await connectDb();
    const userId = getAuthenticatedUserId(request);

    const { id } = await context.params;
    const notebook = await notebooksService.getNotebookById(id, userId);

    if (!notebook) {
      return NextResponse.json(
        {
          success: false,
          message: 'Notebook not found',
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: notebook,
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.status },
      );
    }

    const message =
      error instanceof Error ? error.message : 'Failed to fetch notebook';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    await connectDb();
    const userId = getAuthenticatedUserId(request);

    const { id } = await context.params;
    const payload = UpdateNotebookSchema.parse(await request.json());
    const notebook = await notebooksService.updateNotebook(id, userId, payload);

    if (!notebook) {
      return NextResponse.json(
        {
          success: false,
          message: 'Notebook not found',
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: notebook,
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
      error instanceof Error ? error.message : 'Failed to update notebook';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    await connectDb();
    const userId = getAuthenticatedUserId(request);

    const { id } = await context.params;
    const notebook = await notebooksService.deleteNotebook(id, userId);

    if (!notebook) {
      return NextResponse.json(
        {
          success: false,
          message: 'Notebook not found',
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: notebook,
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.status },
      );
    }

    const message =
      error instanceof Error ? error.message : 'Failed to delete notebook';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
