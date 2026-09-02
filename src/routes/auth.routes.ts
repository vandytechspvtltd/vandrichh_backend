import { Router } from "express";

import * as authController from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

// =====================================================
// Register
// =====================================================

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new customer
 *     description: Creates a new customer account and returns a JWT token.
 *     tags:
 *       - Auth
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phone
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid request data
 *       409:
 *         description: Email or phone already registered
 *       500:
 *         description: Server error
 */
router.post(
  "/register",
  authController.register
);

// =====================================================
// Login / Send OTP
// =====================================================

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Request login OTP
 *     description: Sends a one-time password to the user's registered mobile number.
 *     tags:
 *       - Auth
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *             properties:
 *               phone:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 10
 *                 example: "9876543210"
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Invalid phone number
 *       403:
 *         description: Account is deactivated
 *       500:
 *         description: Server error
 */
router.post(
  "/login",
  authController.login
);

// =====================================================
// Verify OTP
// =====================================================

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verify login OTP
 *     description: Verifies the OTP and returns the authenticated user with a JWT token.
 *     tags:
 *       - Auth
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - otp
 *             properties:
 *               phone:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 10
 *                 example: "9876543210"
 *               otp:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 6
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: Invalid phone number or OTP
 *       401:
 *         description: Invalid OTP
 *       403:
 *         description: Account is deactivated
 *       500:
 *         description: Server error
 */
router.post(
  "/verify-otp",
  authController.verifyOtp
);

// =====================================================
// Get Current User
// =====================================================

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current authenticated user
 *     description: Returns the profile of the currently authenticated user.
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user fetched successfully
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
  "/me",
  authMiddleware,
  authController.getMe
);

// =====================================================
// Update Current User
// =====================================================

/**
 * @swagger
 * /auth/me:
 *   put:
 *     summary: Update current user's profile
 *     description: Updates the authenticated user's name or phone number.
 *     tags:
 *       - Auth
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
  "/me",
  authMiddleware,
  authController.updateProfile
);

export default router;