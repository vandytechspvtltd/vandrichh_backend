import dotenv from "dotenv";
import dns from "dns";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import { Admin, AdminRole } from "../src/models/admin.model.js";
import { loadEnv } from "../src/config/env.js";

dotenv.config();
dns.setServers(["8.8.8.8", "1.1.1.1"]);
loadEnv();

const [name, email, password, role = "ADMIN"] = process.argv.slice(2);

if (!name || !email || !password || !["ADMIN", "SUPER_ADMIN"].includes(role)) {
  console.error("Usage: npm run admin:create -- <name> <email> <password> [ADMIN|SUPER_ADMIN]");
  process.exit(1);
}

try {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await Admin.create({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash,
    role: role as AdminRole,
    isActive: true,
  });
  console.log(`Admin created: ${admin.email}`);
} catch (error: any) {
  if (error?.code === 11000) {
    console.error("An admin with this email already exists.");
  } else {
    console.error("Failed to create admin:", error);
  }
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}