import { createJsonModel } from "../../../utils/jsonModel.js";

export const Inventory = createJsonModel(
  "inventory",
  "inv",
  {
    productId: "",
    sku: "",
    stock: 0,
    reserved: 0,
    available: 0,
    location: "warehouse",
    status: "IN_STOCK",
    updatedAt: new Date().toISOString(),
  },
  { uniqueFields: ["productId", "sku"] }
);
