import { createJsonModel, registerJsonModel } from "../utils/jsonModel.js";

export interface IOrderItem extends Record<string, any> {}
export interface IShippingAddress extends Record<string, any> {}
export type OrderStatus = "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";
export interface IOrder extends Record<string, any> {}

export const Order = createJsonModel("orders", "order", {
  items: [], deliveryFee: 0, paymentMethod: "COD", paymentStatus: "PENDING",
  orderStatus: "PENDING",
});

registerJsonModel("Order", Order);