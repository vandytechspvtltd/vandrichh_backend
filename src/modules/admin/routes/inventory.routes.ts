import { Router } from "express";

import { requireAdmin } from "../../../middleware/auth.middleware.js";
import {
  createInventoryItem,
  deleteInventoryItem,
  getInventoryItem,
  listInventory,
  updateInventoryItem,
} from "../controllers/inventory.controller.js";

export const inventoryRoutes = Router();

inventoryRoutes.use(requireAdmin);

/**
 * @swagger
 * /admin/inventory:
 *   get:
 *     summary: List inventory records
 *     tags: [Admin Inventory]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Inventory records fetched }
 *       401: { description: Admin authorization required }
 *       403: { description: Admin access required }
 *   post:
 *     summary: Create an inventory record
 *     tags: [Admin Inventory]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/InventoryInput' }
 *     responses:
 *       201: { description: Inventory record created }
 *       400: { description: Invalid inventory data }
 *       401: { description: Admin authorization required }
 *       403: { description: Admin access required }
 *       409: { description: Product or SKU already has an inventory record }
 */
inventoryRoutes.get("/", listInventory);
inventoryRoutes.post("/", createInventoryItem);

/**
 * @swagger
 * /admin/inventory/{id}:
 *   get:
 *     summary: Get an inventory record
 *     tags: [Admin Inventory]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses:
 *       200: { description: Inventory record fetched }
 *       401: { description: Admin authorization required }
 *       403: { description: Admin access required }
 *       404: { description: Inventory record not found }
 *   patch:
 *     summary: Update an inventory record
 *     tags: [Admin Inventory]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/InventoryUpdateInput' }
 *     responses:
 *       200: { description: Inventory record updated }
 *       400: { description: Invalid inventory data }
 *       401: { description: Admin authorization required }
 *       403: { description: Admin access required }
 *       404: { description: Inventory record not found }
 *   delete:
 *     summary: Delete an inventory record
 *     tags: [Admin Inventory]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses:
 *       200: { description: Inventory record deleted }
 *       401: { description: Admin authorization required }
 *       403: { description: Admin access required }
 *       404: { description: Inventory record not found }
 */
inventoryRoutes.get("/:id", getInventoryItem);
inventoryRoutes.patch("/:id", updateInventoryItem);
inventoryRoutes.delete("/:id", deleteInventoryItem);
