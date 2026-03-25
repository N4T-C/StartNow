const mongoose = require("mongoose");

let isConnected = false;
let connectingPromise = null;

async function connectToDatabase() {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (connectingPromise) {
    return connectingPromise;
  }

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("MONGO_URI is missing. Set it in .env.local");
  }

  connectingPromise = mongoose.connect(mongoUri).then((connection) => {
    isConnected = true;
    connectingPromise = null;
    return connection;
  }).catch((error) => {
    connectingPromise = null;
    throw error;
  });

  return connectingPromise;
}

module.exports = { connectToDatabase };
