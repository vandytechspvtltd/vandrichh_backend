import { createJsonModel, registerJsonModel } from "../utils/jsonModel.js";

export interface IBanner extends Record<string, any> {}

export const Banner = createJsonModel("banners", "banner", {
  description: "", redirectUrl: "", subtitle: "", link: "", isActive: true,
  sortOrder: 0, displayOrder: 0,
});

registerJsonModel("Banner", Banner);