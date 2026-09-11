require('dotenv').config();
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
