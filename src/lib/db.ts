import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };

    cached.promise = connectWithRetry(MONGODB_URI!, opts);
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

async function connectWithRetry(
  uri: string,
  opts: mongoose.ConnectOptions,
  retries = MAX_RETRIES
): Promise<typeof mongoose> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(uri, opts);
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ MongoDB connected successfully');
      }
      return conn;
    } catch (error) {
      if (attempt === retries) {
        console.error(`❌ MongoDB connection failed after ${retries} attempts`);
        throw error;
      }
      if (process.env.NODE_ENV === 'development') {
        console.warn(`⚠️ MongoDB connection attempt ${attempt}/${retries} failed. Retrying in ${RETRY_DELAY_MS}ms...`);
      }
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS * attempt));
    }
  }
  throw new Error('MongoDB connection failed');
}

export default connectToDatabase;
