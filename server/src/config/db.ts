import mongoose from 'mongoose';
import { env } from './env';

export const connectDb = async (): Promise<typeof mongoose> => {
  try {
    const conn = await mongoose.connect(env.mongoUri);
    // eslint-disable-next-line no-console
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Mongo connection error', error);
    throw error;
  }
};

