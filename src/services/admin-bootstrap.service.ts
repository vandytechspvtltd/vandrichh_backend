import bcrypt from "bcryptjs";

import { Admin } from "../models/admin.model.js";
import { Env, getEnv } from "../config/env.js";

type AdminBootstrapConfig = Pick<Env, "ADMIN_EMAIL" | "ADMIN_PASSWORD">;

export async function ensureBootstrapAdmin(
  config: AdminBootstrapConfig = getEnv()
): Promise<void> {
  if (!config.ADMIN_EMAIL || !config.ADMIN_PASSWORD) return;

  const email = config.ADMIN_EMAIL.trim().toLowerCase();
  const existingAdmin = await Admin.findOne({ email }).lean();
  if (existingAdmin) return;

  await Admin.create({
    name: "Vandrichh Admin",
    email,
    passwordHash: await bcrypt.hash(config.ADMIN_PASSWORD, 12),
    role: "SUPER_ADMIN",
    isActive: true,
  });
  console.log("✅ Bootstrap admin created from configured credentials");
}