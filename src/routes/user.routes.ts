import { Router } from "express";

import * as userController from "../controllers/user.controller.js";

import {
  authMiddleware,
} from "../middleware/auth.middleware.js";

const router = Router();

// =====================================================
// AUTHENTICATION
// All user routes require logged-in user
// =====================================================

router.use(authMiddleware);

// =====================================================
// PROFILE
// =====================================================

/**
 * @swagger
 * /user/profile:
 *   get:
 *     summary: Get current user profile
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/profile",
  userController.getProfile
);

/**
 * @swagger
 * /user/profile:
 *   put:
 *     summary: Update current user profile
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 */
router.put(
  "/profile",
  userController.updateProfile
);

// =====================================================
// ADDRESSES
// =====================================================

/**
 * @swagger
 * /user/addresses:
 *   get:
 *     summary: Get current user's addresses
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Addresses fetched successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: User not found
 */
router.get(
  "/addresses",
  userController.getAddresses
);

/**
 * @swagger
 * /user/addresses:
 *   post:
 *     summary: Add a new address for current user
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - phone
 *               - street
 *               - city
 *               - state
 *               - pincode
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: Test User
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *               street:
 *                 type: string
 *                 example: Golf Course Road
 *               city:
 *                 type: string
 *                 example: Gurugram
 *               state:
 *                 type: string
 *                 example: Haryana
 *               pincode:
 *                 type: string
 *                 example: "122002"
 *               isDefault:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Address added successfully
 *       400:
 *         description: Invalid address data
 *       401:
 *         description: Authentication required
 *       404:
 *         description: User not found
 */
router.post(
  "/addresses",
  userController.addAddress
);

export default router;