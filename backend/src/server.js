const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from backend/.env and root .env fallback
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;

// Start Server
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`[Vehicomp Backend] Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`[Vehicomp Backend] Health check: http://localhost:${PORT}/api/health`);
  });
};

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
