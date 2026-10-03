import { Request, Response } from "express";

import { inventoryService } from "../services/inventory.service.js";
import { inventoryValidator, inventoryUpdateValidator } from "../validators/inventory.validator.js";

export const listInventory = async (_req: Request, res: Response) => {
  const items = await inventoryService.list();
  return res.json({ success: true, message: "Inventory fetched successfully", data: items });
};

export const getInventoryItem = async (req: Request, res: Response) => {
  const item = await inventoryService.getById(req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, message: "Inventory item not found" });
  }
  return res.json({ success: true, message: "Inventory item fetched successfully", data: item });
};

export const createInventoryItem = async (req: Request, res: Response) => {
  const payload = inventoryValidator.parse(req.body);
  const item = await inventoryService.create(payload);
  return res.status(201).json({ success: true, message: "Inventory item created successfully", data: item });
};

export const updateInventoryItem = async (req: Request, res: Response) => {
  const payload = inventoryUpdateValidator.parse(req.body);
  const item = await inventoryService.update(req.params.id, payload);
  if (!item) {
    return res.status(404).json({ success: false, message: "Inventory item not found" });
  }
  return res.json({ success: true, message: "Inventory item updated successfully", data: item });
};

export const deleteInventoryItem = async (req: Request, res: Response) => {
  const item = await inventoryService.remove(req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, message: "Inventory item not found" });
  }
  return res.json({ success: true, message: "Inventory item deleted successfully", data: item });
};
