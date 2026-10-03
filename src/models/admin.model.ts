import { createJsonModel, registerJsonModel } from "../utils/jsonModel.js";

export type AdminRole = "ADMIN" | "SUPER_ADMIN";
export interface IAdmin extends Record<string, any> {}

export const Admin = createJsonModel("admins", "admin", {
  role: "ADMIN", isActive: true,
}, { hiddenFields: ["passwordHash"], uniqueFields: ["email"] });

registerJsonModel("Admin", Admin);