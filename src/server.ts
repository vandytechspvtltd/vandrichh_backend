import dotenv from "dotenv";

// Load .env before importing modules that depend on environment variables
dotenv.config();

import { loadEnv, getEnv } from "./config/env.js";
import { connectDatabase } from "./config/database.js";

async function startServer() {
  try {
    // Validate environment before loading app
    loadEnv();
    const env = getEnv();

    // Import app only after environment has been loaded
    const { default: app } = await import("./app.js");

    console.log("🚀 Starting Vandrichh API server...");
    console.log(`📝 Environment: ${env.NODE_ENV}`);

    // Connect to MongoDB
    console.log("🔗 Connecting to MongoDB...");
    await connectDatabase();

    // Start HTTP server
    const server = app.listen(env.PORT, () => {
      console.log(`✅ Server running at http://localhost:${env.PORT}`);
      console.log(
        `📚 API Documentation at http://localhost:${env.PORT}/api-docs`
      );
      console.log(
        `🏥 Health check at http://localhost:${env.PORT}/api/v1/health`
      );
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      console.log(`\n⏱️ Received ${signal}. Shutting down gracefully...`);

      server.close(() => {
        console.log("🛑 Server closed");
        process.exit(0);
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();