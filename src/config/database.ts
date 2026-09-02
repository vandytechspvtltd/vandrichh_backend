import mongoose from "mongoose";
import { getEnv } from "./env.js";

export async function connectDatabase(): Promise<void> {
  const env = getEnv();

  try {
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log("✅ MongoDB connected successfully");
    console.log("📦 Database:", mongoose.connection.name);
    console.log("📚 Host:", mongoose.connection.host);

    const db = mongoose.connection.db;

    if (db) {
      const collections = await db
        .listCollections()
        .toArray();

      console.log(
        "📁 Collections:",
        collections.map((c) => c.name)
      );

      const productCount = await db
        .collection("products")
        .countDocuments();

      console.log(
        "🛍️ Products in DB:",
        productCount
      );
    }

    mongoose.connection.on("error", (err) => {
      console.error(
        "❌ MongoDB connection error:",
        err
      );
    });

    mongoose.connection.on("disconnected", () => {
      console.warn(
        "⚠️ MongoDB disconnected"
      );
    });
  } catch (error) {
    console.error(
      "❌ MongoDB connection failed:",
      error
    );

    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    await mongoose.disconnect();

    console.log(
      "✅ MongoDB disconnected successfully"
    );
  } catch (error) {
    console.error(
      "❌ Error disconnecting from MongoDB:",
      error
    );

    throw error;
  }
}

export function getDatabase() {
  return mongoose;
}