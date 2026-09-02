import { Router } from "express";

import * as userController from "../controllers/user.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

// =====================================================
// Get User Profile
// =====================================================

/**
 * @swagger
 * /user/profile:
 *   get:
 *     summary: Get current user profile
 *     description: Returns the profile of the currently authenticated user.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched successfully
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
 *                   example: Profile fetched successfully
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Account is deactivated
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get(
  "/profile",
  userController.getProfile
);

// =====================================================
// Update User Profile
// =====================================================

/**
 * @swagger
 * /user/profile:
 *   put:
 *     summary: Update current user profile
 *     description: Updates the authenticated user's name or phone number.
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
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Smith
 *               phone:
 *                 type: string
 *                 example: "9876543211"
 *     responses:
 *       200:
 *         description: Profile updated successfully
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
 *                   example: Profile updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid update data
 *       401:
 *         description: Authentication required
 *       404:
 *         description: User not found
 *       409:
 *         description: Phone number already registered
 *       500:
 *         description: Server error
 */
router.put(
  "/profile",
  userController.updateProfile
);

export default router;