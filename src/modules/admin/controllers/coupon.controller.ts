import { Request, Response } from "express";

import { couponService } from "../services/coupon.service.js";
import { couponValidator, couponUpdateValidator } from "../validators/coupon.validator.js";

export const listCoupons = async (_req: Request, res: Response) => {
  const coupons = await couponService.list();
  return res.json({ success: true, message: "Coupons fetched successfully", data: coupons });
};

export const getCoupon = async (req: Request, res: Response) => {
  const coupon = await couponService.getById(req.params.id);
  if (!coupon) {
    return res.status(404).json({ success: false, message: "Coupon not found" });
  }
  return res.json({ success: true, message: "Coupon fetched successfully", data: coupon });
};

export const createCoupon = async (req: Request, res: Response) => {
  const payload = couponValidator.parse(req.body);
  const coupon = await couponService.create(payload);
  return res.status(201).json({ success: true, message: "Coupon created successfully", data: coupon });
};

export const updateCoupon = async (req: Request, res: Response) => {
  const payload = couponUpdateValidator.parse(req.body);
  const coupon = await couponService.update(req.params.id, payload);
  if (!coupon) {
    return res.status(404).json({ success: false, message: "Coupon not found" });
  }
  return res.json({ success: true, message: "Coupon updated successfully", data: coupon });
};

export const deleteCoupon = async (req: Request, res: Response) => {
  const coupon = await couponService.remove(req.params.id);
  if (!coupon) {
    return res.status(404).json({ success: false, message: "Coupon not found" });
  }
  return res.json({ success: true, message: "Coupon deleted successfully", data: coupon });
};
