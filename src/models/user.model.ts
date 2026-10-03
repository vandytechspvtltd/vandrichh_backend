import { createJsonModel, registerJsonModel } from "../utils/jsonModel.js";

export interface IUserAddress extends Record<string, any> {}
export interface IUser extends Record<string, any> {}

export const User = createJsonModel("users", "user", {
  role: "CUSTOMER", isActive: true, addresses: [],
}, { hiddenFields: ["passwordHash", "refreshTokenHash", "refreshTokenExpiresAt"], uniqueFields: ["email", "phone"] });

registerJsonModel("User", User);