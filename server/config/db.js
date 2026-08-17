const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoMemoryServer = null;

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kaam_saathi';
  
  try {
    // Set connection timeout to 3 seconds for quick fallback check
    await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`[Database] Connected to primary MongoDB: ${mongoose.connection.host}`);
  } catch (err) {
    console.warn(`[Database] Could not connect to primary MongoDB (${err.message}). Falling back to In-Memory MongoDB...`);
    try {
      mongoMemoryServer = await MongoMemoryServer.create();
      const memoryUri = mongoMemoryServer.getUri();
      await mongoose.connect(memoryUri);
      console.log(`[Database] Successfully connected to MongoMemoryServer instance: ${memoryUri}`);
    } catch (memErr) {
      console.error(`[Database] Critical: In-memory MongoDB failed to start: ${memErr.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
