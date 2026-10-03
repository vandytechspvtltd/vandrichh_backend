import { createJsonModel, registerJsonModel } from "../utils/jsonModel.js";

export interface IProduct extends Record<string, any> {}

export const Product = createJsonModel("products", "prod", {
  subcategory: "", material: "", availableSizes: [], colours: [], wholesalePrice: 0, mrp: 0, sellingPrice: 0,
  description: "", images: [], stock: 0, isActive: true, isFeatured: false,
  isTrending: false, isNew: false,
}, { uniqueFields: ["sku"] });

registerJsonModel("Product", Product);