import { Router } from "express";

import { requireAdmin } from "../../../middleware/auth.middleware.js";
import {
  createCoupon,
  deleteCoupon,
  getCoupon,
  listCoupons,
  updateCoupon,
} from "../controllers/coupon.controller.js";

export const couponRoutes = Router();

couponRoutes.use(requireAdmin);

/**
 * @swagger
 * /admin/coupons:
 *   get:
 *     summary: List coupons
 *     tags: [Admin Coupons]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Coupons fetched }
 *       401: { description: Admin authorization required }
 *       403: { description: Admin access required }
 *   post:
 *     summary: Create a coupon
 *     tags: [Admin Coupons]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CouponInput' }
 *     responses:
 *       201: { description: Coupon created }
 *       400: { description: Invalid coupon data }
 *       401: { description: Admin authorization required }
 *       403: { description: Admin access required }
 *       409: { description: Coupon code already exists }
 */
couponRoutes.get("/", listCoupons);
couponRoutes.post("/", createCoupon);

/**
 * @swagger
 * /admin/coupons/{id}:
 *   get:
 *     summary: Get a coupon
 *     tags: [Admin Coupons]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses:
 *       200: { description: Coupon fetched }
 *       401: { description: Admin authorization required }
 *       403: { description: Admin access required }
 *       404: { description: Coupon not found }
 *   patch:
 *     summary: Update a coupon
 *     tags: [Admin Coupons]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CouponUpdateInput' }
 *     responses:
 *       200: { description: Coupon updated }
 *       400: { description: Invalid coupon data }
 *       401: { description: Admin authorization required }
 *       403: { description: Admin access required }
 *       404: { description: Coupon not found }
 *   delete:
 *     summary: Delete a coupon
 *     tags: [Admin Coupons]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses:
 *       200: { description: Coupon deleted }
 *       401: { description: Admin authorization required }
 *       403: { description: Admin access required }
 *       404: { description: Coupon not found }
 */
couponRoutes.get("/:id", getCoupon);
couponRoutes.patch("/:id", updateCoupon);
couponRoutes.delete("/:id", deleteCoupon);
