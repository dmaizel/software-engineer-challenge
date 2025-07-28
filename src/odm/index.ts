import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export { Log, ILog } from './Logs/Logs';
export { getLogs, createLog } from './Logs/LogsRepository';
export { LogSearchQuery } from './Logs/types';

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env['MONGODB_URI'] || 'mongodb://admin:password123@localhost:27017/app_database?authSource=admin';
    
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('MongoDB disconnection error:', error);
  }
}; 