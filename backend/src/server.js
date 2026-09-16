const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  if (process.env.MONGODB_URI) {
    if (typeof connectDB === 'function') {
      await connectDB();
    } else if (connectDB.connectDB) {
      await connectDB.connectDB();
    }
  } else {
    console.warn('WARNING: MONGODB_URI is not defined in environment variables.');
  }

  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  });

  return server;
};

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
