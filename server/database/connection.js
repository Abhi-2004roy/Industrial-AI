import mongoose from 'mongoose';
import config from '../config/index.js';
import { logger } from '../utils/index.js';

export const connectDB = async () => {
  try {
    await mongoose.connect(config.mongodb.uri);
    logger.info(`MongoDB connected: ${mongoose.connection.host}`);
    
    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err}`);
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });
  } catch (err) {
    logger.error(`Failed to connect to MongoDB: ${err}`);
    logger.error(`Please make sure MongoDB is running locally at ${config.mongodb.uri} or update the MONGODB_URI in .env`);
    process.exit(1);
  }
};

export default connectDB;
