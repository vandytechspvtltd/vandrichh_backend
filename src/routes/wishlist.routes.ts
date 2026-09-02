import { Router } from "express";

import * as wishlistController from "../controllers/wishlist.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

// =====================================================
// Get Wishlist
// GET /api/v1/wishlist
// =====================================================

/**
 * @swagger
 * /wishlist:
 *   get:
 *     summary: Get current user's wishlist
 *     tags:
 *       - Wishlist
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wishlist fetched successfully
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Failed to fetch wishlist
 */
router.get(
  "/",
  authMiddleware,
  wishlistController.getWishlist
);

// =====================================================
// Toggle Wishlist
// POST /api/v1/wishlist/:productId
// =====================================================

/**
 * @swagger
 * /wishlist/{productId}:
 *   post:
 *     summary: Add or remove product from wishlist
 *     tags:
 *       - Wishlist
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product MongoDB ID
 *     responses:
 *       200:
 *         description: Wishlist updated successfully
 *       400:
 *         description: Invalid product ID
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Failed to update wishlist
 */
router.post(
  "/:productId",
  authMiddleware,
  wishlistController.toggleWishlist
);

export default router;