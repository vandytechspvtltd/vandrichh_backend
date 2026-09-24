import { Router } from "express";
import * as controller from "../controllers/admin.controller.js";
import * as authController from "../controllers/admin-auth.controller.js";
import { requireAdmin } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/helpers.js";

const router = Router();

/**
 * @swagger
 * /admin/login:
 *   post:
 *     summary: Admin login
 *     tags: [Admin Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, format: password }
 *     responses:
 *       200: { description: Admin JWT issued }
 *       400: { description: Missing fields }
 *       401: { description: Invalid credentials }
 */
router.post("/login", asyncHandler(authController.login));
router.use(requireAdmin);

/**
 * @swagger
 * /admin/me:
 *   get:
 *     summary: Get the authenticated admin
 *     tags: [Admin Auth]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Admin profile, content: { application/json: { schema: { $ref: '#/components/schemas/Admin' } } } }
 *       401: { description: Missing or invalid admin JWT }
 *       403: { description: Admin account is inactive }
 */
router.get("/me", asyncHandler(authController.me));

/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     summary: Get dashboard counts
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Product, category, user, order, and banner counts }
 *       401: { description: Missing or invalid admin JWT }
 *       403: { description: Admin access required }
 *       500: { description: Database error }
 */
router.get("/dashboard", asyncHandler(controller.dashboard));

/**
 * @swagger
 * /admin/products:
 *   get:
 *     summary: List all products for administration
 *     tags: [Admin Products]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, minimum: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, minimum: 1, maximum: 100 } }
 *     responses:
 *       200: { description: Products and pagination }
 *       401: { description: Missing or invalid admin JWT }
 *       403: { description: Admin access required }
 *       500: { description: Database error }
 *   post:
 *     summary: Create a product
 *     tags: [Admin Products]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json: { schema: { $ref: '#/components/schemas/AdminProductInput' } }
 *     responses:
 *       201: { description: Product created }
 *       400: { description: Missing or invalid product fields }
 *       401: { description: Missing or invalid admin JWT }
 *       403: { description: Admin access required }
 *       409: { description: Duplicate SKU }
 */
router.get("/products", asyncHandler(controller.listProducts));
router.post("/products", asyncHandler(controller.createProduct));

/**
 * @swagger
 * /admin/products/{id}:
 *   get:
 *     summary: Get any product, including inactive products
 *     tags: [Admin Products]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses:
 *       200: { description: Product fetched }
 *       400: { description: Invalid ObjectId }
 *       401: { description: Missing or invalid admin JWT }
 *       403: { description: Admin access required }
 *       404: { description: Product not found }
 *   put:
 *     summary: Update a product
 *     tags: [Admin Products]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json: { schema: { $ref: '#/components/schemas/AdminProductInput' } }
 *     responses:
 *       200: { description: Product updated }
 *       400: { description: Invalid ID or fields }
 *       401: { description: Missing or invalid admin JWT }
 *       403: { description: Admin access required }
 *       404: { description: Product not found }
 *       409: { description: Duplicate SKU }
 *   delete:
 *     summary: Permanently delete a product
 *     tags: [Admin Products]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses:
 *       200: { description: Product deleted }
 *       400: { description: Invalid ObjectId }
 *       401: { description: Missing or invalid admin JWT }
 *       403: { description: Admin access required }
 *       404: { description: Product not found }
 */
router.get("/products/:id", asyncHandler(controller.getProduct));
router.put("/products/:id", asyncHandler(controller.updateProduct));
router.delete("/products/:id", asyncHandler(controller.deleteProduct));

/**
 * @swagger
 * /admin/products/{id}/deactivate:
 *   delete:
 *     summary: Deactivate a product
 *     tags: [Admin Products]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses:
 *       200: { description: Product deactivated }
 *       400: { description: Invalid ObjectId }
 *       401: { description: Missing or invalid admin JWT }
 *       403: { description: Admin access required }
 *       404: { description: Product not found }
 */
router.delete("/products/:id/deactivate", asyncHandler(controller.deactivateProduct));

/**
 * @swagger
 * /admin/categories:
 *   get:
 *     summary: List all categories
 *     tags: [Admin Categories]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Categories and pagination }
 *       401: { description: Missing or invalid admin JWT }
 *       403: { description: Admin access required }
 *   post:
 *     summary: Create a category
 *     tags: [Admin Categories]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json: { schema: { $ref: '#/components/schemas/AdminCategoryInput' } }
 *     responses:
 *       201: { description: Category created }
 *       400: { description: Missing or invalid fields }
 *       401: { description: Missing or invalid admin JWT }
 *       403: { description: Admin access required }
 *       409: { description: Duplicate slug }
 */
router.get("/categories", asyncHandler(controller.listCategories));
router.post("/categories", asyncHandler(controller.createCategory));

/**
 * @swagger
 * /admin/categories/{id}:
 *   get:
 *     summary: Get a category
 *     tags: [Admin Categories]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses:
 *       200: { description: Category fetched }
 *       400: { description: Invalid ObjectId }
 *       401: { description: Missing or invalid admin JWT }
 *       403: { description: Admin access required }
 *       404: { description: Category not found }
 *   put:
 *     summary: Update a category
 *     tags: [Admin Categories]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json: { schema: { $ref: '#/components/schemas/AdminCategoryInput' } }
 *     responses:
 *       200: { description: Category updated }
 *       400: { description: Invalid ID or fields }
 *       401: { description: Missing or invalid admin JWT }
 *       403: { description: Admin access required }
 *       404: { description: Category not found }
 *       409: { description: Duplicate slug }
 *   delete:
 *     summary: Deactivate a category
 *     tags: [Admin Categories]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses:
 *       200: { description: Category deactivated }
 *       400: { description: Invalid ObjectId }
 *       401: { description: Missing or invalid admin JWT }
 *       403: { description: Admin access required }
 *       404: { description: Category not found }
 */
router.get("/categories/:id", asyncHandler(controller.getCategory));
router.put("/categories/:id", asyncHandler(controller.updateCategory));
router.delete("/categories/:id", asyncHandler(controller.deleteCategory));

/**
 * @swagger
 * /admin/orders:
 *   get:
 *     summary: List all customer orders
 *     tags: [Admin Orders]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Orders and pagination }
 *       401: { description: Missing or invalid admin JWT }
 *       403: { description: Admin access required }
 */
router.get("/orders", asyncHandler(controller.listOrders));

/**
 * @swagger
 * /admin/orders/{id}:
 *   get:
 *     summary: Get an order by ID
 *     tags: [Admin Orders]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses:
 *       200: { description: Order fetched }
 *       400: { description: Invalid ObjectId }
 *       401: { description: Missing or invalid admin JWT }
 *       403: { description: Admin access required }
 *       404: { description: Order not found }
 *   put:
 *     summary: Update order status
 *     tags: [Admin Orders]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderStatus]
 *             properties:
 *               orderStatus: { type: string, enum: [PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED] }
 *     responses:
 *       200: { description: Order status updated }
 *       400: { description: Invalid ObjectId or status }
 *       401: { description: Missing or invalid admin JWT }
 *       403: { description: Admin access required }
 *       404: { description: Order not found }
 */
router.get("/orders/:id", asyncHandler(controller.getOrder));
router.put("/orders/:id/status", asyncHandler(controller.updateOrderStatus));

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: List customers without sensitive credentials
 *     tags: [Admin Users]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Users and pagination }
 *       401: { description: Missing or invalid admin JWT }
 *       403: { description: Admin access required }
 * /admin/users/{id}:
 *   get:
 *     summary: Get one customer without sensitive credentials
 *     tags: [Admin Users]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses:
 *       200: { description: User fetched }
 *       400: { description: Invalid ObjectId }
 *       401: { description: Missing or invalid admin JWT }
 *       403: { description: Admin access required }
 *       404: { description: User not found }
 */
router.get("/users", asyncHandler(controller.listUsers));
router.get("/users/:id", asyncHandler(controller.getUser));

/**
 * @swagger
 * /admin/banners:
 *   get:
 *     summary: List banners
 *     tags: [Admin Banners]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Banners fetched }
 *       401: { description: Missing or invalid admin JWT }
 *       403: { description: Admin access required }
 *   post:
 *     summary: Create a banner using an externally hosted image URL
 *     tags: [Admin Banners]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json: { schema: { $ref: '#/components/schemas/AdminBannerInput' } }
 *     responses:
 *       201: { description: Banner created }
 *       400: { description: Missing imageUrl/title or invalid fields }
 *       401: { description: Missing or invalid admin JWT }
 *       403: { description: Admin access required }
 * /admin/banners/{id}:
 *   get:
 *     summary: Get a banner
 *     tags: [Admin Banners]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses:
 *       200: { description: Banner fetched }
 *       400: { description: Invalid ObjectId }
 *       401: { description: Missing or invalid admin JWT }
 *       403: { description: Admin access required }
 *       404: { description: Banner not found }
 *   put:
 *     summary: Update a banner
 *     tags: [Admin Banners]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json: { schema: { $ref: '#/components/schemas/AdminBannerInput' } }
 *     responses:
 *       200: { description: Banner updated }
 *       400: { description: Invalid ID or fields }
 *       401: { description: Missing or invalid admin JWT }
 *       403: { description: Admin access required }
 *       404: { description: Banner not found }
 *   delete:
 *     summary: Delete a banner
 *     tags: [Admin Banners]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses:
 *       200: { description: Banner deleted }
 *       400: { description: Invalid ObjectId }
 *       401: { description: Missing or invalid admin JWT }
 *       403: { description: Admin access required }
 *       404: { description: Banner not found }
 */
router.get("/banners", asyncHandler(controller.listBanners));
router.post("/banners", asyncHandler(controller.createBanner));
router.get("/banners/:id", asyncHandler(controller.getBanner));
router.put("/banners/:id", asyncHandler(controller.updateBanner));
router.delete("/banners/:id", asyncHandler(controller.deleteBanner));

export default router;