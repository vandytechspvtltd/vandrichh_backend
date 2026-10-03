import { createJsonModel } from "../../../utils/jsonModel.js";

export const Coupon = createJsonModel(
  "coupons",
  "coup",
  {
    code: "",
    description: "",
    type: "PERCENTAGE",
    value: 0,
    minOrderValue: 0,
    maxDiscount: 0,
    isActive: true,
    usageLimit: 0,
    usedCount: 0,
    expiresAt: null,
  },
  { uniqueFields: ["code"] }
);
