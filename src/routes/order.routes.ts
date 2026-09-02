import { Router } from "express";

import * as orderController from "../controllers/order.controller.js";

import {
  authMiddleware,
  adminMiddleware,
} from "../middleware/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

// =====================================================
// Create Order / Checkout
// =====================================================

/**
 * @swagger
 * /orders/checkout:
 *   post:
 *     summary: Create a new order
 *     description: Creates an order from the authenticated user's cart.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shippingAddress
 *             properties:
 *               shippingAddress:
 *                 $ref: '#/components/schemas/ShippingAddress'
 *               paymentMethod:
 *                 type: string
 *                 enum:
 *                   - COD
 *                 example: COD
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Invalid request or empty cart
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Cart or product not found
 *       500:
 *         description: Server error
 */
router.post(
  "/checkout",
  orderController.create
);

// =====================================================
// Get My Orders
// =====================================================

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get my orders
 *     description: Returns all orders belonging to the authenticated user.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Orders fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Orders fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Server error
 */
router.get(
  "/",
  orderController.getMyOrders
);

// =====================================================
// Get All Orders - ADMIN
// =====================================================

/**
 * @swagger
 * /orders/admin/orders:
 *   get:
 *     summary: Get all orders
 *     description: Returns all customer orders. Admin access required.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All orders fetched successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Server error
 */
router.get(
  "/admin/orders",
  adminMiddleware,
  orderController.getAllOrders
);

// =====================================================
// Get Order By ID
// =====================================================

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get order details
 *     description: Returns a single order belonging to the authenticated user.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order MongoDB ObjectId
 *         example: "65f123456789abcdef123456"
 *     responses:
 *       200:
 *         description: Order fetched successfully
 *       400:
 *         description: Invalid order ID
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.get(
  "/:id",
  orderController.getOrderById
);

// =====================================================
// Update Order Status - ADMIN
// =====================================================

/**
 * @swagger
 * /orders/{id}/status:
 *   put:
 *     summary: Update order status
 *     description: Updates the status of an order. Admin access required.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order MongoDB ObjectId
 *         example: "65f123456789abcdef123456"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderStatus
 *             properties:
 *               orderStatus:
 *                 type: string
 *                 enum:
 *                   - PENDING
 *                   - CONFIRMED
 *                   - PROCESSING
 *                   - SHIPPED
 *                   - DELIVERED
 *                   - CANCELLED
 *                 example: CONFIRMED
 *               paymentStatus:
 *                 type: string
 *                 enum:
 *                   - PENDING
 *                   - PAID
 *                   - FAILED
 *                   - REFUNDED
 *                 example: PENDING
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       400:
 *         description: Invalid order status or order ID
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.put(
  "/:id/status",
  adminMiddleware,
  orderController.updateStatus
);

export default router;