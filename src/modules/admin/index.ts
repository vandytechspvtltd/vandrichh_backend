import { Router } from "express";

import { loadEnv } from "../../config/env.js";
import adminRoutes from "../../routes/admin.routes.js";
import { inventoryRoutes } from "./routes/inventory.routes.js";
import { couponRoutes } from "./routes/coupon.routes.js";

loadEnv();

export const adminModuleRoutes = Router();
adminModuleRoutes.use("/", adminRoutes);
adminModuleRoutes.use("/inventory", inventoryRoutes);
adminModuleRoutes.use("/coupons", couponRoutes);
