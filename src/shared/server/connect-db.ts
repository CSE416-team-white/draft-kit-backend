import mongoose from 'mongoose';

declare global {
  var __draftkit_mongoose:
    | {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
      }
    | undefined;
}

const cached = global.__draftkit_mongoose ?? {
  conn: null,
  promise: null,
};

global.__draftkit_mongoose = cached;

export async function connectDb(): Promise<typeof mongoose> {
  const mongodbUri = process.env.MONGODB_URI;

  if (!mongodbUri) {
    throw new Error('MONGODB_URI is required');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(mongodbUri, {
      dbName: process.env.MONGODB_DB_NAME || 'draftkit',
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
