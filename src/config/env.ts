import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  MONGODB_URI: z.string().url("MongoDB URI must be a valid URL"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

export type Env = z.infer<typeof envSchema>;

let env: Env | null = null;

export function loadEnv(): Env {
  if (env) return env;

  const parsed = envSchema.safeParse(process.env);

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
