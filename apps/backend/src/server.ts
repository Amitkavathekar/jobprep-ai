import app from './app.js';
import { connectDatabase } from './config/database.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';

const startServer = async () => {
  try {
    // 1. Connect to MongoDB
    await connectDatabase();

    // 2. Start Listening on HTTP Port
    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 JobPrep AI Backend Server running on http://localhost:${env.PORT}`);
      logger.info(`🌍 Environment: ${env.NODE_ENV}`);
    });

    // Unhandled Rejection & Uncaught Exception Handlers
    process.on('unhandledRejection', (reason: Error) => {
      logger.error('💥 Unhandled Rejection:', reason);
      server.close(() => process.exit(1));
    });

    process.on('uncaughtException', (error: Error) => {
      logger.error('💥 Uncaught Exception:', error);
      process.exit(1);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
