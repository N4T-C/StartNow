const mongoose = require("mongoose");
let { MongoMemoryServer } = require("mongodb-memory-server");

let isConnected = false;
let connectingPromise = null;
let memoryServer = null;

async function startMemoryServerFallback() {
  console.log("⚠️ Starting fallback in-memory MongoDB server...");
  memoryServer = await MongoMemoryServer.create();
  const uri = memoryServer.getUri();
  console.log(`✅ In-memory MongoDB started at: ${uri}`);
  return uri;
}

async function connectToDatabase() {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (connectingPromise) {
    return connectingPromise;
  }

  connectingPromise = (async () => {
    let mongoUri = process.env.MONGO_URI;

    try {
      if (!mongoUri) throw new Error("No MONGO_URI provided.");
      console.log(`🔄 Attempting to connect to: ${mongoUri}`);
      const connection = await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
      console.log("✅ Successfully connected to configured MongoDB.");
      isConnected = true;
      return connection;
    } catch (error) {
      console.error(`❌ Failed to connect to ${mongoUri}:`, error.message);
      
      // Fallback to in-memory server
      mongoUri = await startMemoryServerFallback();
      const connection = await mongoose.connect(mongoUri);
      isConnected = true;
      return connection;
    } finally {
      connectingPromise = null;
    }
  })();

  return connectingPromise;
}

module.exports = { connectToDatabase };
