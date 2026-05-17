import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error("✗ MONGODB_URI environment variable is not set!");
    console.error("  Set it in Render dashboard: Environment > Add Environment Variable");
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000, // 10 second timeout
    });
    console.log("✓ Connected to MongoDB");
  } catch (err: any) {
    console.error("✗ MongoDB connection failed:", err.message);
    console.error("  Check that:");
    console.error("  1. MONGODB_URI is correctly set in Render environment variables");
    console.error("  2. MongoDB Atlas Network Access allows 0.0.0.0/0");
    console.error("  3. The database user credentials are correct");
    process.exit(1);
  }

  mongoose.connection.on("error", (err) => {
    console.error("MongoDB runtime error:", err);
  });
}
