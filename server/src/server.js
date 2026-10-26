import app from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import User from './models/User.js';
import { seedDatabase } from '../scripts/seed.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed development accounts if running in non-production with an empty database
    if (process.env.NODE_ENV !== 'production') {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log('[Server] Development mode & empty database detected. Auto-seeding initial demo accounts...');
        await seedDatabase();
      }
    }

    const server = app.listen(PORT, () => {
      console.log(`==============================================`);
      console.log(` StaffSync Backend API Server Running`);
      console.log(` Port: ${PORT}`);
      console.log(` Mode: ${process.env.NODE_ENV || 'development'}`);
      console.log(` URL:  http://localhost:${PORT}`);
      console.log(`==============================================`);
    });

    const shutdown = async (signal) => {
      console.log(`\n[Server] Received ${signal}. Gracefully shutting down...`);
      server.close(async () => {
        await disconnectDB();
        console.log('[Server] MongoDB disconnected and server closed cleanly.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('[Server] Fatal startup error:', error.message);
    process.exit(1);
  }
};

startServer();
