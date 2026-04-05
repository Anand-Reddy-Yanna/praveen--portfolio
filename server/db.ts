import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/praveen-portfolio";
  
  try {
    await mongoose.connect(uri);
    console.log("✓ Connected to MongoDB");
  } catch (err) {
    console.error("✗ MongoDB connection error:", err);
    process.exit(1);
  }

  mongoose.connection.on("error", (err) => {
    console.error("MongoDB error:", err);
  });
}
