import { Router } from "express";

import * as cartController from "../controllers/cart.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

// =====================================================
// Get Cart
// =====================================================

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Get current user's cart
 *     description: Returns the authenticated user's shopping cart.
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Server error
 */
router.get(
  "/",
  cartController.getCart
);

// =====================================================
// Add Item To Cart
// =====================================================

/**
 * @swagger
 * /cart/add:
 *   post:
 *     summary: Add product to cart
 *     description: Adds a product with selected size and colour to the authenticated user's cart.
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *                 example: "65f123456789abcdef123456"
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 example: 2
 *               selectedSize:
 *                 type: string
 *                 example: "L"
 *               selectedColour:
 *                 type: string
 *                 example: "White"
 *     responses:
 *       200:
 *         description: Product added to cart successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.post(
  "/add",
  cartController.addItem
);

// =====================================================
// Update Cart Item
// =====================================================

/**
 * @swagger
 * /cart/items/{itemId}:
 *   put:
 *     summary: Update cart item
 *     description: Updates the quantity or selected options of an item in the cart.
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: Cart item product ID
 *         example: "65f123456789abcdef123456"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 example: 3
 *               selectedSize:
 *                 type: string
 *                 example: "XL"
 *               selectedColour:
 *                 type: string
 *                 example: "Black"
 *     responses:
 *       200:
 *         description: Cart item updated successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Cart item not found
 *       500:
 *         description: Server error
 */
router.put(
  "/items/:itemId",
  cartController.updateItem
);

// =====================================================
// Remove Cart Item
// =====================================================

/**
 * @swagger
 * /cart/items/{itemId}:
 *   delete:
 *     summary: Remove item from cart
 *     description: Removes a product from the authenticated user's cart.
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: Cart item product ID
 *         example: "65f123456789abcdef123456"
 *     responses:
 *       200:
 *         description: Cart item removed successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Cart item not found
 *       500:
 *         description: Server error
 */
router.delete(
  "/items/:itemId",
  cartController.removeItem
);

// =====================================================
// Clear Cart
// =====================================================

/**
 * @swagger
 * /cart/clear:
 *   delete:
 *     summary: Clear cart
 *     description: Removes all items from the authenticated user's cart.
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Server error
 */
router.delete(
  "/clear",
  cartController.clearCart
);

export default router;