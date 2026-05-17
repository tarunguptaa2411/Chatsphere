const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  // Try connecting to the configured MongoDB URI first
  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000, // Fail fast if not available
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return;
  } catch (error) {
    console.log(`⚠️  Could not connect to MongoDB at ${mongoUri}`);
    console.log('🔄 Starting in-memory MongoDB for local development...\n');
  }

  // Fallback: Use in-memory MongoDB server
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    const memoryUri = mongod.getUri();

    const conn = await mongoose.connect(memoryUri);
    console.log(`✅ In-Memory MongoDB Connected: ${conn.connection.host}`);
    console.log('📝 Note: Data will be lost when the server stops.\n');
    console.log('💡 For persistent data, install MongoDB locally or use MongoDB Atlas (free).');
    console.log('   Set MONGO_URI in server/.env to your connection string.\n');
  } catch (memError) {
    console.error(`❌ Failed to start in-memory MongoDB: ${memError.message}`);
    console.error('Please install MongoDB or set a valid MONGO_URI in .env');
    process.exit(1);
  }
};

module.exports = connectDB;
