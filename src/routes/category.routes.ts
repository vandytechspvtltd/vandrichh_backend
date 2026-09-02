import { Router } from "express";

import * as categoryController from "../controllers/category.controller.js";

import {
  authMiddleware,
  adminMiddleware,
} from "../middleware/auth.middleware.js";

const router = Router();

// =====================================================
// Get All Categories - PUBLIC
// =====================================================

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get all active categories
 *     description: Returns all active product categories.
 *     tags:
 *       - Categories
 *     responses:
 *       200:
 *         description: Categories fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: Server error
 */
router.get(
  "/",
  categoryController.getAll
);

// =====================================================
// Get Category By ID - PUBLIC
// =====================================================

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     description: Returns a single active category by its ID.
 *     tags:
 *       - Categories
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category MongoDB ObjectId
 *         example: "65f123456789abcdef123456"
 *     responses:
 *       200:
 *         description: Category fetched successfully
 *       400:
 *         description: Invalid category ID
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
router.get(
  "/:id",
  categoryController.getById
);

// =====================================================
// Create Category - ADMIN
// =====================================================

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Create a new category
 *     description: Creates a new product category. Admin access required.
 *     tags:
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - slug
 *             properties:
 *               name:
 *                 type: string
 *                 example: White Shirts
 *               slug:
 *                 type: string
 *                 example: white-shirts
 *               description:
 *                 type: string
 *                 example: Premium white shirts collection.
 *               image:
 *                 type: string
 *                 format: uri
 *                 example: https://example.com/category.jpg
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       409:
 *         description: Category already exists
 *       500:
 *         description: Server error
 */
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  categoryController.create
);

// =====================================================
// Update Category - ADMIN
// =====================================================

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Update category
 *     description: Updates an existing product category. Admin access required.
 *     tags:
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category MongoDB ObjectId
 *         example: "65f123456789abcdef123456"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Premium Shirts
 *               slug:
 *                 type: string
 *                 example: premium-shirts
 *               description:
 *                 type: string
 *                 example: Premium quality shirts.
 *               image:
 *                 type: string
 *                 format: uri
 *                 example: https://example.com/category.jpg
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Category not found
 *       409:
 *         description: Category slug already exists
 *       500:
 *         description: Server error
 */
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  categoryController.update
);

// =====================================================
// Delete Category - ADMIN
// =====================================================

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Delete category
 *     description: Deletes a product category. Admin access required.
 *     tags:
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category MongoDB ObjectId
 *         example: "65f123456789abcdef123456"
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       400:
 *         description: Invalid category ID
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  categoryController.remove
);

export default router;