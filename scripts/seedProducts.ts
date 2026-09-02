import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import { Product } from "../src/models/Product.js";
import { loadEnv } from "../src/config/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seedProducts() {
  try {
    // Load environment
    dotenv.config();
    loadEnv();

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI environment variable not set");
    }

    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    // Read products JSON
    const dataPath = path.join(__dirname, "vandrichh_products.json");
    console.log(`📂 Reading products from ${dataPath}`);

    const fileContent = await fs.readFile(dataPath, "utf-8");
    const products = JSON.parse(fileContent);

    if (!Array.isArray(products)) {
      throw new Error("Products data must be an array");
    }

    console.log(`📦 Found ${products.length} products to import`);

    let insertedCount = 0;
    let updatedCount = 0;
    let failedCount = 0;

    // Process each product
    for (const productData of products) {
      try {
        const result = await Product.updateOne(
          { sku: productData.sku.toUpperCase() },
          {
            ...productData,
            sku: productData.sku.toUpperCase(),
          },
          { upsert: true }
        );

        if (result.upsertedId) {
          insertedCount++;
          console.log(`✅ Inserted: ${productData.productName} (SKU: ${productData.sku})`);
        } else if (result.modifiedCount > 0) {
          updatedCount++;
          console.log(`🔄 Updated: ${productData.productName} (SKU: ${productData.sku})`);
        }
      } catch (error) {
        failedCount++;
        console.error(`❌ Failed: ${productData.productName}`, error);
      }
    }

    console.log("\n📊 Seeding Summary:");
    console.log(`✅ Inserted: ${insertedCount}`);
    console.log(`🔄 Updated: ${updatedCount}`);
    console.log(`❌ Failed: ${failedCount}`);
    console.log(`📈 Total: ${insertedCount + updatedCount + failedCount}`);

    // Verify
    const total = await Product.countDocuments();
    console.log(`\n🔍 Total products in database: ${total}`);

    await mongoose.disconnect();
    console.log("✅ Database disconnected");
    console.log("✅ Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seedProducts();
