import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readData, writeData } from "../src/utils/jsonDatabase.js";

const directory = path.dirname(fileURLToPath(import.meta.url));

async function seedProducts() {
  try {
    const fixturePath = path.resolve(directory, "../data/vandrichh_products.json");
    const fixture = JSON.parse(await fs.readFile(fixturePath, "utf8"));
    if (!Array.isArray(fixture)) throw new Error("Products data must be an array");

    const products = await readData<Record<string, any>>("products");
    const now = new Date().toISOString();
    let inserted = 0;
    let updated = 0;
    const usedIds = new Set<string>();
    let nextId = products.reduce((highest, product) => {
      const match = String(product._id || "").match(/^prod_(\d+)$/);
      return match ? Math.max(highest, Number(match[1])) : highest;
    }, 0);

    for (const source of fixture) {
      const sku = String(source.sku).toUpperCase();
      const index = products.findIndex((product) => product.sku === sku);
      const current = index >= 0 ? products[index] : undefined;
      let id = current?._id;
      if (!id || usedIds.has(id)) id = `prod_${String(++nextId).padStart(3, "0")}`;
      usedIds.add(id);
      const product = {
        _id: id,
        ...source,
        sku,
        subcategory: source.subcategory || "",
        material: source.material || "",
        availableSizes: source.availableSizes || [],
        colours: source.colours || [],
        images: source.images || [],
        isActive: source.isActive ?? true,
        isFeatured: source.isFeatured ?? false,
        isTrending: source.isTrending ?? false,
        isNew: source.isNew ?? false,
        createdAt: current?.createdAt || now,
        updatedAt: now,
      };

      if (index >= 0) {
        products[index] = product;
        updated++;
      } else {
        products.push(product);
        inserted++;
      }
    }

    await writeData("products", products);
    console.log(`Seeded local products: ${inserted} inserted, ${updated} updated, ${products.length} total`);
  } catch (error) {
    console.error("Product seeding failed:", error);
    process.exitCode = 1;
  }
}

await seedProducts();