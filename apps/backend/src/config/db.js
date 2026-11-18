const mongoose = require('mongoose');
const env = require('./env');

let memoryServerInstance = null;

async function connectDB() {
  try {
    mongoose.set('strictQuery', false);
    
    // Attempt standard connection to MONGODB_URI (e.g. Atlas or local)
    console.log(`Connecting to MongoDB at: ${env.MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}...`);
    
    // Use a short 2.5-second timeout so we don't hang if local mongod is absent
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 2500
    });

    console.log('MongoDB connected successfully to primary database.');
  } catch (err) {
    if (env.MONGODB_USE_MEMORY_FALLBACK && env.NODE_ENV !== 'production') {
      console.warn(`Primary MongoDB connection failed (${err.message}). Initializing in-memory MongoDB runner for zero-dependency local execution...`);
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        memoryServerInstance = await MongoMemoryServer.create();
        const memUri = memoryServerInstance.getUri();
        await mongoose.connect(memUri);
        console.log(`In-memory MongoDB initialized and connected successfully at: ${memUri}`);
      } catch (memErr) {
        console.error('Fatal: Failed to initialize in-memory MongoDB runner:', memErr.message);
        throw memErr;
      }
    } else {
      console.error('Fatal MongoDB connection error:', err.message);
      throw err;
    }
  }

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB runtime error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected.');
  });
}

async function disconnectDB() {
  await mongoose.disconnect();
  if (memoryServerInstance) {
    await memoryServerInstance.stop();
  }
}

module.exports = {
  connectDB,
  disconnectDB
};
