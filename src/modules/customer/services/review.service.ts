import { readData, writeData } from "../../../utils/jsonDatabase.js";
import { Review } from "../models/review.model.js";

export const reviewService = {
  async list(productId?: string) {
    const records = await readData<any>("reviews");
    return productId ? records.filter((item) => String(item.productId) === String(productId)) : records;
  },

  async create(input: Record<string, any>) {
    const review = await Review.create({
      ...input,
      createdAt: new Date().toISOString(),
    });
    return review.toObject();
  },

  async update(id: string, updates: Record<string, any>) {
    const records = await readData<any>("reviews");
    const index = records.findIndex((item) => String(item._id) === String(id));
    if (index < 0) return null;
    const next = { ...records[index], ...updates, updatedAt: new Date().toISOString() };
    records[index] = next;
    await writeData("reviews", records);
    return next;
  },

  async remove(id: string) {
    const records = await readData<any>("reviews");
    const index = records.findIndex((item) => String(item._id) === String(id));
    if (index < 0) return null;
    const [removed] = records.splice(index, 1);
    await writeData("reviews", records);
    return removed;
  },
};
