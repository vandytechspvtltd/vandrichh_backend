import { createJsonModel } from "../../../utils/jsonModel.js";

export const Review = createJsonModel(
  "reviews",
  "rev",
  {
    userId: "",
    productId: "",
    rating: 5,
    title: "",
    comment: "",
    isApproved: true,
    createdAt: new Date().toISOString(),
  },
  { uniqueFields: ["userId", "productId"] }
);
