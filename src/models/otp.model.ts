import { createJsonModel, registerJsonModel } from "../utils/jsonModel.js";

export interface IOtp extends Record<string, any> {}

export const Otp = createJsonModel("otps", "otp", { attempts: 0 });

registerJsonModel("Otp", Otp);