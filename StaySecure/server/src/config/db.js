const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/stay-secure';

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.error('👉 If using MongoDB Atlas, make sure your current IP address is whitelisted in Atlas Network Access (or set to 0.0.0.0/0).');
    console.error('Retrying MongoDB connection in 10 seconds...');
    setTimeout(connectDB, 10000);
  }
};

module.exports = connectDB;
