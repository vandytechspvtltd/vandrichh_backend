import { Router } from "express";

import { loadEnv } from "../../config/env.js";
import authRoutes from "../../routes/auth.routes.js";
import productRoutes from "../../routes/product.routes.js";
import categoryRoutes from "../../routes/category.routes.js";
import cartRoutes from "../../routes/cart.routes.js";
import wishlistRoutes from "../../routes/wishlist.routes.js";
import orderRoutes from "../../routes/order.routes.js";
import userRoutes from "../../routes/user.routes.js";
import { reviewRoutes } from "./routes/review.routes.js";

loadEnv();

export const customerModuleRoutes = Router();
customerModuleRoutes.use("/auth", authRoutes);
customerModuleRoutes.use("/products", productRoutes);
customerModuleRoutes.use("/categories", categoryRoutes);
customerModuleRoutes.use("/cart", cartRoutes);
customerModuleRoutes.use("/wishlist", wishlistRoutes);
customerModuleRoutes.use("/orders", orderRoutes);
customerModuleRoutes.use("/user", userRoutes);
customerModuleRoutes.use("/reviews", reviewRoutes);
