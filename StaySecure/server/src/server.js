require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    // Start Express server
    app.listen(PORT, () => {
      console.log(`\n╔════════════════════════════════════════╗`);
      console.log(`║  StaySecure Backend Server Running     ║`);
      console.log(`║  Port: ${PORT}${' '.repeat(26 - PORT.toString().length)}║`);
      console.log(`║  Environment: ${process.env.NODE_ENV || 'development'}${' '.repeat(20 - (process.env.NODE_ENV || 'development').length)}║`);
      console.log(`╚════════════════════════════════════════╝\n`);
      console.log(`📍 Server URL: http://localhost:${PORT}`);
      console.log(`📍 Health Check: http://localhost:${PORT}/api/health\n`);
    });

    // Connect to MongoDB
    connectDB();
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
