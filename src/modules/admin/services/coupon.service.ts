import { readData, writeData } from "../../../utils/jsonDatabase.js";
import { Coupon } from "../models/coupon.model.js";

export const couponService = {
  async list() {
    return readData<any>("coupons");
  },

  async getById(id: string) {
    const records = await readData<any>("coupons");
    return records.find((item) => String(item._id) === String(id)) ?? null;
  },

  async create(input: Record<string, any>) {
    const coupon = await Coupon.create(input);
    return coupon.toObject();
  },

  async update(id: string, updates: Record<string, any>) {
    const records = await readData<any>("coupons");
    const index = records.findIndex((item) => String(item._id) === String(id));
    if (index < 0) return null;
    const next = { ...records[index], ...updates, updatedAt: new Date().toISOString() };
    records[index] = next;
    await writeData("coupons", records);
    return next;
  },

  async remove(id: string) {
    const records = await readData<any>("coupons");
    const index = records.findIndex((item) => String(item._id) === String(id));
    if (index < 0) return null;
    const [removed] = records.splice(index, 1);
    await writeData("coupons", records);
    return removed;
  },
};
