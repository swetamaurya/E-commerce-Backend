require("dotenv").config();
const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URL;
  if (!uri) {
    console.error("MongoDB URI not provided in environment variables");
    return;
  }
  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    // No process.exit here, so process continues running
  }
};

module.exports = connectDB;
