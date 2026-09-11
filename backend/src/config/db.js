const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/vehicomp';
    const conn = await mongoose.connect(connUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}, database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    // If not in test environment, log clear message for Atlas/local setup
    if (process.env.NODE_ENV !== 'test') {
      console.warn('[MongoDB] Running without active database connection. Ensure MongoDB Atlas or local MongoDB is running.');
    }
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('[MongoDB] Connection closed.');
  } catch (error) {
    console.error(`[MongoDB] Error during disconnect: ${error.message}`);
  }
};

module.exports = { connectDB, disconnectDB };
