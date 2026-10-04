import { z } from "zod";
import { randomBytes } from "node:crypto";

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  ADMIN_JWT_SECRET: z.string().min(32).optional(),
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().min(1).optional(),
  JWT_EXPIRES_IN: z.string().default("7d"),
  ADMIN_JWT_EXPIRES_IN: z.string().default("8h"),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  IMAGE_BASE_URL: z.string().url().optional(),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
}).refine(
  (environment) => Boolean(environment.ADMIN_EMAIL) === Boolean(environment.ADMIN_PASSWORD),
  { message: "ADMIN_EMAIL and ADMIN_PASSWORD must be configured together", path: ["ADMIN_PASSWORD"] }
);

export type Env = z.infer<typeof envSchema>;

let env: Env | null = null;

export function loadEnv(): Env {
  if (env) return env;

  const environment = { ...process.env };
  const usesTemporaryJwtSecret =
    !environment.JWT_SECRET && environment.NODE_ENV !== "production";

  if (usesTemporaryJwtSecret) {
    environment.JWT_SECRET = randomBytes(32).toString("hex");
    console.warn("JWT_SECRET is unset; using a temporary development secret.");
  }

  const parsed = envSchema.safeParse(environment);

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    console.error("❌ Environment validation failed:");
    Object.entries(errors).forEach(([key, messages]) => {
      console.error(`  ${key}: ${messages?.join(", ")}`);
    });
    process.exit(1);
  }

  env = parsed.data;
  return env;
}

export function getEnv(): Env {
  if (!env) {
    throw new Error("Environment not loaded. Call loadEnv() first.");
  }
  return env;
}
