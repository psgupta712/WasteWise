// Import mongoose
const mongoose = require('mongoose');

// Function to connect to MongoDB
const connectDB = async () => {
  try {
    console.log('🔄 Attempting to connect to MongoDB...');
    console.log('📝 MONGO_URI exists:', process.env.MONGO_URI ? 'YES' : 'NO');
    
    // Connect to MongoDB using connection string from .env
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database Name: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB:`);
    console.error(error.message);
    console.error('Full error:', error);
    // Exit process with failure
    process.exit(1);
  }
};

// Export the function
module.exports = connectDB;