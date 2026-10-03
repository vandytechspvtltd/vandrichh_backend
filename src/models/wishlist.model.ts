import { createJsonModel, registerJsonModel } from "../utils/jsonModel.js";

export interface IWishlist extends Record<string, any> {}

export const Wishlist = createJsonModel("wishlists", "wish", { products: [] }, { uniqueFields: ["user"] });

registerJsonModel("Wishlist", Wishlist);