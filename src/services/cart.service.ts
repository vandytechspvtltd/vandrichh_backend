import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import type { CartAddItemInput, CartUpdateItemInput } from "../validators/cart.validator.js";

export class CartService {
  async getCart(userId: string) {
    let cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
      await cart.save();
    }

    return cart;
  }

  async addItem(userId: string, input: CartAddItemInput) {
    const product = await Product.findById(input.product);

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    if (!product.isActive) {
      throw new ApiError(404, "Product not available");
    }

    if (product.stock < input.quantity) {
      throw new ApiError(400, "Insufficient stock");
    }

    if (input.selectedSize && !product.availableSizes.includes(input.selectedSize)) {
      throw new ApiError(400, "Invalid size selected");
    }

    if (input.selectedColour && !product.colours.includes(input.selectedColour)) {
      throw new ApiError(400, "Invalid colour selected");
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    const existingItem = cart.items.find(
      (item) =>
        item.product.toString() === input.product &&
        item.selectedSize === input.selectedSize &&
        item.selectedColour === input.selectedColour
    );

    if (existingItem) {
      existingItem.quantity += input.quantity;
    } else {
      cart.items.push({
        product: input.product as any,
        quantity: input.quantity,
        selectedSize: input.selectedSize,
        selectedColour: input.selectedColour,
      });
    }

    await cart.save();
    return cart.populate("items.product");
  }

  async updateItem(userId: string, productId: string, input: CartUpdateItemInput) {
    const product = await Product.findById(productId);

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    if (product.stock < input.quantity) {
      throw new ApiError(400, "Insufficient stock");
    }

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      throw new ApiError(404, "Cart not found");
    }

    const item = cart.items.find((i) => i.product.toString() === productId);

    if (!item) {
      throw new ApiError(404, "Item not in cart");
    }

    item.quantity = input.quantity;
    if (input.selectedSize) item.selectedSize = input.selectedSize;
    if (input.selectedColour) item.selectedColour = input.selectedColour;

    await cart.save();
    return cart.populate("items.product");
  }

  async removeItem(userId: string, productId: string) {
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      throw new ApiError(404, "Cart not found");
    }

    cart.items = cart.items.filter((i) => i.product.toString() !== productId);

    await cart.save();
    return cart.populate("items.product");
  }

  async clearCart(userId: string) {
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      throw new ApiError(404, "Cart not found");
    }

    cart.items = [];
    await cart.save();
    return cart;
  }
}

export const cartService = new CartService();
