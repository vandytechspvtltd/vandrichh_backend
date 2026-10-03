import { readData, writeData } from "../../../utils/jsonDatabase.js";
import { Inventory } from "../models/inventory.model.js";

export const inventoryService = {
  async list() {
    const records = await readData<any>("inventory");
    return records.map((item) => ({
      ...item,
      available: Number(item.available ?? Math.max((Number(item.stock) || 0) - (Number(item.reserved) || 0), 0)),
    }));
  },

  async getById(id: string) {
    const records = await readData<any>("inventory");
    return records.find((item) => String(item._id) === String(id)) ?? null;
  },

  async create(input: Record<string, any>) {
    const record = await Inventory.create({
      ...input,
      available: Math.max((Number(input.stock) || 0) - (Number(input.reserved) || 0), 0),
      updatedAt: new Date().toISOString(),
    });
    return record.toObject();
  },

  async update(id: string, updates: Record<string, any>) {
    const records = await readData<any>("inventory");
    const index = records.findIndex((item) => String(item._id) === String(id));
    if (index < 0) return null;

    const next = {
      ...records[index],
      ...updates,
      available: Math.max((Number(updates.stock ?? records[index].stock) || 0) - (Number(updates.reserved ?? records[index].reserved) || 0), 0),
      updatedAt: new Date().toISOString(),
    };

    records[index] = next;
    await writeData("inventory", records);
    return next;
  },

  async remove(id: string) {
    const records = await readData<any>("inventory");
    const index = records.findIndex((item) => String(item._id) === String(id));
    if (index < 0) return null;
    const [removed] = records.splice(index, 1);
    await writeData("inventory", records);
    return removed;
  },
};
