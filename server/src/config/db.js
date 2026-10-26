import mongoose from 'mongoose';

let mongoMemoryServerInstance = null;

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // If in-memory server is already active in this process, connect to it
  if (mongoMemoryServerInstance) {
    const memUri = mongoMemoryServerInstance.getUri();
    const conn = await mongoose.connect(memUri);
    return conn;
  }

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/staffsync';
  
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.warn(`[MongoDB] Could not connect to primary URI (${uri}): ${err.message}`);
    console.log('[MongoDB] Attempting in-memory MongoDB fallback for testing & zero-config local evaluation...');

    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongoMemoryServerInstance = await MongoMemoryServer.create();
      const memUri = mongoMemoryServerInstance.getUri();
      const conn = await mongoose.connect(memUri);
      console.log(`[MongoDB] In-memory fallback connected successfully at ${memUri}`);
      return conn;
    } catch (memErr) {
      console.error('[MongoDB] In-memory server fallback failed:', memErr.message);
      throw err;
    }
  }
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServerInstance) {
    await mongoMemoryServerInstance.stop();
  }
};
