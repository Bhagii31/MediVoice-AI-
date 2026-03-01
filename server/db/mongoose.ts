import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.warn("MONGODB_URI not set. App running without database connection.");
}

let isConnected = false;

export function isMongoConnected() {
  return isConnected;
}

export async function connectMongoDB() {
  if (isConnected) return;
  if (!MONGODB_URI) return;

  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    isConnected = true;
    console.log("Connected to MongoDB Atlas");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}

export { mongoose };
