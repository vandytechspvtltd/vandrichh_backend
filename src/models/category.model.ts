import { createJsonModel, registerJsonModel } from "../utils/jsonModel.js";

export interface ICategory extends Record<string, any> {}

export const Category = createJsonModel("categories", "cat", {
  description: "", image: "", isActive: true,
}, { uniqueFields: ["slug"] });

registerJsonModel("Category", Category);