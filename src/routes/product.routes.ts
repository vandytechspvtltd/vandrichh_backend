import { Router } from "express";

import * as productController from "../controllers/product.controller.js";

import {
  authMiddleware,
  adminMiddleware,
} from "../middleware/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management APIs
 */

// =====================================================
// Get All Products
// =====================================================

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products
 *     description: Get a paginated list of all active products with optional filters.
 *     tags:
 *       - Products
 *     security: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of products per page
 *
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter products by category
 *
 *       - in: query
 *         name: subcategory
 *         schema:
 *           type: string
 *         description: Filter products by subcategory
 *
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search products by name, SKU or description
 *
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum:
 *             - price_low
 *             - price_asc
 *             - price_high
 *             - price_desc
 *             - newest
 *             - oldest
 *             - name_asc
 *             - name_desc
 *         description: Sort products
 *
 *       - in: query
 *         name: isFeatured
 *         schema:
 *           type: boolean
 *         description: Filter featured products
 *
 *       - in: query
 *         name: isTrending
 *         schema:
 *           type: boolean
 *         description: Filter trending products
 *
 *       - in: query
 *         name: isNew
 *         schema:
 *           type: boolean
 *         description: Filter new arrival products
 *
 *     responses:
 *       200:
 *         description: Products fetched successfully
 *       500:
 *         description: Internal server error
 */
router.get(
  "/",
  productController.getAll
);
// =====================================================
// Featured Products
// =====================================================

/**
 * @swagger
 * /products/featured:
 *   get:
 *     summary: Get featured products
 *     description: Get active products marked as featured.
 *     tags:
 *       - Products
 *     security: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Maximum number of products
 *     responses:
 *       200:
 *         description: Featured products fetched successfully
 *       500:
 *         description: Internal server error
 */
router.get(
  "/featured",
  productController.getFeatured
);

// =====================================================
// Trending Products
// =====================================================

/**
 * @swagger
 * /products/trending:
 *   get:
 *     summary: Get trending products
 *     description: Get active products marked as trending.
 *     tags:
 *       - Products
 *     security: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Maximum number of products
 *     responses:
 *       200:
 *         description: Trending products fetched successfully
 *       500:
 *         description: Internal server error
 */
router.get(
  "/trending",
  productController.getTrending
);

// =====================================================
// New Arrivals
// =====================================================

/**
 * @swagger
 * /products/new-arrivals:
 *   get:
 *     summary: Get new arrival products
 *     description: Get active products marked as new arrivals.
 *     tags:
 *       - Products
 *     security: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Maximum number of products
 *     responses:
 *       200:
 *         description: New arrivals fetched successfully
 *       500:
 *         description: Internal server error
 */
router.get(
  "/new-arrivals",
  productController.getNewArrivals
);

// =====================================================
// Get Product By SKU
// =====================================================

/**
 * @swagger
 * /products/sku/{sku}:
 *   get:
 *     summary: Get product by SKU
 *     description: Get an active product using its SKU.
 *     tags:
 *       - Products
 *     security: []
 *     parameters:
 *       - in: path
 *         name: sku
 *         required: true
 *         schema:
 *           type: string
 *         example: SHR-WHT-001
 *     responses:
 *       200:
 *         description: Product fetched successfully
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/sku/:sku",
  productController.getBySku
);

// =====================================================
// Get Product By ID
// =====================================================

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get product by ID
 *     description: Get an active product using its MongoDB ObjectId.
 *     tags:
 *       - Products
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 64f123456789abcdef123456
 *     responses:
 *       200:
 *         description: Product fetched successfully
 *       400:
 *         description: Invalid product ID
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/:id",
  productController.getById
);

// =====================================================
// Create Product - ADMIN
// =====================================================

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product
 *     description: Create a new product. Admin access required.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sku
 *               - category
 *               - productName
 *               - wholesalePrice
 *               - mrp
 *               - sellingPrice
 *             properties:
 *               sku:
 *                 type: string
 *                 example: SHR-WHT-001
 *               category:
 *                 type: string
 *                 example: Shirts
 *               subcategory:
 *                 type: string
 *                 example: Casual Shirts
 *               productName:
 *                 type: string
 *                 example: White Cotton Shirt
 *               material:
 *                 type: string
 *                 example: 100% Cotton
 *               availableSizes:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: [S, M, L, XL]
 *               colours:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: [White, Black]
 *               wholesalePrice:
 *                 type: number
 *                 example: 150
 *               mrp:
 *                 type: number
 *                 example: 299
 *               sellingPrice:
 *                 type: number
 *                 example: 249
 *               description:
 *                 type: string
 *                 example: Premium cotton shirt
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *               stock:
 *                 type: integer
 *                 minimum: 0
 *                 example: 100
 *               isActive:
 *                 type: boolean
 *                 example: true
 *               isFeatured:
 *                 type: boolean
 *                 example: false
 *               isTrending:
 *                 type: boolean
 *                 example: false
 *               isNew:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Invalid product data
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       409:
 *         description: Product SKU already exists
 *       500:
 *         description: Internal server error
 */
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  productController.create
);

// =====================================================
// Update Product - ADMIN
// =====================================================

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update a product
 *     description: Update an existing product. Admin access required.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 64f123456789abcdef123456
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sku:
 *                 type: string
 *                 example: SHR-WHT-001
 *               category:
 *                 type: string
 *                 example: Shirts
 *               subcategory:
 *                 type: string
 *                 example: Casual Shirts
 *               productName:
 *                 type: string
 *                 example: White Cotton Shirt
 *               material:
 *                 type: string
 *                 example: 100% Cotton
 *               availableSizes:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: [S, M, L, XL]
 *               colours:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: [White, Black]
 *               wholesalePrice:
 *                 type: number
 *                 example: 150
 *               mrp:
 *                 type: number
 *                 example: 299
 *               sellingPrice:
 *                 type: number
 *                 example: 249
 *               description:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *               stock:
 *                 type: integer
 *                 minimum: 0
 *                 example: 100
 *               isActive:
 *                 type: boolean
 *                 example: true
 *               isFeatured:
 *                 type: boolean
 *                 example: true
 *               isTrending:
 *                 type: boolean
 *                 example: false
 *               isNew:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       400:
 *         description: Invalid product data
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Product not found
 *       409:
 *         description: Product SKU already exists
 *       500:
 *         description: Internal server error
 */
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  productController.update
);

// =====================================================
// Deactivate Product - ADMIN
// =====================================================

/**
 * @swagger
 * /products/{id}/deactivate:
 *   delete:
 *     summary: Deactivate a product
 *     description: Deactivates a product without permanently deleting it.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 64f123456789abcdef123456
 *     responses:
 *       200:
 *         description: Product deactivated successfully
 *       400:
 *         description: Invalid product ID
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/:id/deactivate",
  authMiddleware,
  adminMiddleware,
  productController.deactivate
);

// =====================================================
// Permanently Delete Product - ADMIN
// =====================================================

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Permanently delete a product
 *     description: Permanently deletes a product. Admin access required.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 64f123456789abcdef123456
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       400:
 *         description: Invalid product ID
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  productController.remove
);

export default router;