import { createJsonModel, registerJsonModel } from "../utils/jsonModel.js";

export interface ICartItem extends Record<string, any> {}
export interface ICart extends Record<string, any> {}

export const Cart = createJsonModel("carts", "cart", { items: [] }, { uniqueFields: ["user"] });

registerJsonModel("Cart", Cart);