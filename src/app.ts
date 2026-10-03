import express, { Request, Response } from "express";

import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";

import { getEnv } from "./config/env.js";
import { swaggerSpec } from "./swagger.js";

import bannerRoutes from "./routes/banner.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import { adminModuleRoutes } from "./modules/admin/index.js";
import { customerModuleRoutes } from "./modules/customer/index.js";

import { errorMiddleware } from "./middleware/error.middleware.js";
import { notFoundMiddleware } from "./middleware/notFound.middleware.js";
import { successResponse } from "./utils/ApiResponse.js";

const app = express();

const env = getEnv();

// =====================================================
// Security Middleware
// =====================================================

app.use(helmet());

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);

// =====================================================
// Rate Limiting
// =====================================================

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});

app.use("/api/", limiter);

// =====================================================
// Body Parsing
// =====================================================

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    limit: "10mb",
    extended: true,
  })
);

// =====================================================
// Logging
// =====================================================

app.use(morgan("combined"));

// =====================================================
// Swagger Documentation
// =====================================================

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

// =====================================================
// Health Check
// =====================================================

app.get(
  "/api/v1/health",
  (_req: Request, res: Response) => {
    res.status(200).json(
      successResponse("Vandrichh API is running")
    );
  }
);

// =====================================================
// API Routes
// =====================================================

app.use(
  "/api/v1/banners",
  bannerRoutes
);

app.use(
  "/api/banners",
  bannerRoutes
);

app.use(
  "/api/v1/admin",
  adminModuleRoutes
);

app.use(
  "/api/v1",
  customerModuleRoutes
);

app.use(
  "/api/admin",
  adminRoutes
);

// =====================================================
// 404 Handler
// =====================================================

app.use(notFoundMiddleware);

// =====================================================
// Global Error Handler
// =====================================================

app.use(errorMiddleware);

export default app;