import { Router } from "express";

import { authMiddleware } from "../../../middleware/auth.middleware.js";
import {
  createReview,
  deleteReview,
  listReviews,
  updateReview,
} from "../controllers/review.controller.js";

export const reviewRoutes = Router();

/**
 * @swagger
 * /reviews:
 *   get:
 *     summary: List product reviews
 *     tags: [Reviews]
 *     security: []
 *     parameters:
 *       - { in: query, name: productId, schema: { type: string }, description: Filter reviews by product }
 *     responses:
 *       200: { description: Reviews fetched }
 *       500: { description: Failed to fetch reviews }
 *   post:
 *     summary: Create a product review
 *     tags: [Reviews]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ReviewInput' }
 *     responses:
 *       201: { description: Review created }
 *       400: { description: Invalid review data }
 *       401: { description: Authentication required }
 */
reviewRoutes.get("/", listReviews);
reviewRoutes.post("/", authMiddleware, createReview);

/**
 * @swagger
 * /reviews/{id}:
 *   patch:
 *     summary: Update a product review
 *     tags: [Reviews]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ReviewUpdateInput' }
 *     responses:
 *       200: { description: Review updated }
 *       400: { description: Invalid review data }
 *       401: { description: Authentication required }
 *       404: { description: Review not found }
 *   delete:
 *     summary: Delete a product review
 *     tags: [Reviews]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses:
 *       200: { description: Review deleted }
 *       401: { description: Authentication required }
 *       404: { description: Review not found }
 */
reviewRoutes.patch("/:id", authMiddleware, updateReview);
reviewRoutes.delete("/:id", authMiddleware, deleteReview);
