require("dotenv").config();
const mongoose = require('mongoose');

const connectDB = async (uri) => {
  // Use the URI from parameter or environment variable
  let mongoUri = uri || process.env.MONGODB_URI;
  
  // If no URI provided, try to read from .env file directly
  if (!mongoUri) {
    try {
      const fs = require('fs');
      const path = require('path');
      const envPath = path.join(__dirname, '..', '.env');
      const envContent = fs.readFileSync(envPath, 'utf16le');
      const envLines = envContent.split('\n');
      
      for (const line of envLines) {
        const cleanLine = line.trim();
        if (cleanLine.startsWith('MONGODB_URI=')) {
          // Split only on the first '=' to preserve the full URL
          const parts = cleanLine.split('=');
          if (parts.length > 1) {
            mongoUri = parts.slice(1).join('=').trim();
          }
          break;
        }
      }
    } catch (error) {
      console.error("❌ Could not read .env file:", error.message);
    }
  }
  
  if (!mongoUri) {
    console.error("❌ MongoDB URI not found in environment variables or .env file");
    return;
  }
  
  // console.log("Attempting to connect to MongoDB...");
  // console.log("MongoDB URI:", mongoUri.replace(/\/\/.*@/, "//***:***@")); // Hide credentials in logs
  
  try {
    await mongoose.connect(mongoUri);
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    // console.log("Please make sure MongoDB is running on your system");
    // console.log("You can start MongoDB with: mongod");
    // No process.exit here, so process continues running
  }
};

module.exports = connectDB;
