const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from root .env or server .env
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas
if (process.env.MONGODB_URI) {
  connectDB();
} else {
  console.warn('WARNING: MONGODB_URI is not defined in environment variables.');
}

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // server.close(() => process.exit(1));
});
