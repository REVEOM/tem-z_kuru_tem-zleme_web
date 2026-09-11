import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI ortam değişkeni tanımlanmamış.');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Global cache to reuse connection across serverless invocations
const globalWithMongoose = global as typeof globalThis & { mongoose?: MongooseCache };

let cached: MongooseCache = globalWithMongoose.mongoose ?? { conn: null, promise: null };
if (!globalWithMongoose.mongoose) {
  globalWithMongoose.mongoose = cached;
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}
