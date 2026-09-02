import { Router } from "express";
import * as bannerController from "../controllers/banner.controller.js";

const router = Router();

/**
 * GET /api/v1/banners
 */
router.get(
  "/",
  bannerController.getBanners
);

export default router;