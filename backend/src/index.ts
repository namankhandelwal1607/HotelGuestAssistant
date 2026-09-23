import app from './app';
import { Logger } from './utils/logger';

const PORT = parseInt(process.env.PORT || '4000', 10);

// Start HTTP server only if not running in a serverless environment (like Vercel)
if (!process.env.VERCEL) {
  const server = app.listen(PORT, () => {
    Logger.info(`🏨 Hotel Guest Assistant Backend is running on port ${PORT}`);
    Logger.info(`Endpoints:`);
    Logger.info(`  - GET  http://localhost:${PORT}/api/health`);
    Logger.info(`  - POST http://localhost:${PORT}/api/chat`);
    Logger.info(`  - POST http://localhost:${PORT}/api/availability`);
  });

  // Graceful shutdown handling
  process.on('SIGTERM', () => {
    Logger.info('SIGTERM received, shutting down gracefully...');
    server.close(() => {
      Logger.info('Process terminated.');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    Logger.info('SIGINT received, shutting down gracefully...');
    server.close(() => {
      Logger.info('Process terminated.');
      process.exit(0);
    });
  });
}

export default app;
