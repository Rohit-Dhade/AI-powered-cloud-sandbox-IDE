import mongoose from "mongoose";

async function connectDB() {
  try {
    await mongoose.connect(process.env.AUTH_MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

export default connectDB;