import { Request, Response } from "express";
import mongoose from "mongoose";

import { Product } from "../models/product.model.js";
import { Category } from "../models/category.model.js";
import { Order, OrderStatus } from "../models/order.model.js";
import { User } from "../models/user.model.js";
import { Banner } from "../models/banner.model.js";
import { ApiError } from "../utils/ApiError.js";
import { resolveImageUrl, resolveImageUrls } from "../services/image-storage.service.js";

const idOrThrow = (id: string, resource: string) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, `Invalid ${resource} ID`);
  }
};

const pageOptions = (req: Request) => ({
  page: Math.max(Number(req.query.page) || 1, 1),
  limit: Math.min(Math.max(Number(req.query.limit) || 20, 1), 100),
});

const pick = (source: Record<string, any>, fields: string[]) =>
  Object.fromEntries(fields.filter((field) => source[field] !== undefined).map((field) => [field, source[field]]));

const productFields = [
  "sku", "category", "subcategory", "productName", "material", "availableSizes",
  "colours", "wholesalePrice", "mrp", "sellingPrice", "description", "images",
  "stock", "isActive", "isFeatured", "isTrending", "isNew",
];

const categoryFields = ["name", "slug", "description", "image", "isActive"];
const bannerFields = ["imageUrl", "title", "description", "redirectUrl", "displayOrder", "isActive"];

const normalizeBannerInput = (body: Record<string, any>) => {
  const data = pick(body, bannerFields);
  if (data.imageUrl !== undefined) data.imageUrl = resolveImageUrl(data.imageUrl);
  if (data.description !== undefined) data.subtitle = data.description;
  if (data.redirectUrl !== undefined) data.link = data.redirectUrl;
  if (data.displayOrder !== undefined) data.sortOrder = data.displayOrder;
  return data;
};

const serializeBanner = (banner: any) => ({
  ...banner,
  description: banner.description ?? banner.subtitle ?? "",
  redirectUrl: banner.redirectUrl ?? banner.link ?? "",
  displayOrder: banner.displayOrder ?? banner.sortOrder ?? 0,
});

export const dashboard = async (_req: Request, res: Response) => {
  const [products, categories, users, orders, banners] = await Promise.all([
    Product.countDocuments(),
    Category.countDocuments(),
    User.countDocuments(),
    Order.countDocuments(),
    Banner.countDocuments(),
  ]);

  return res.json({
    success: true,
    message: "Admin dashboard fetched successfully",
    data: { products, categories, users, orders, banners },
  });
};

export const listProducts = async (req: Request, res: Response) => {
  const { page, limit } = pageOptions(req);
  const [data, total] = await Promise.all([
    Product.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Product.countDocuments(),
  ]);
  return res.json({ success: true, message: "Admin products fetched successfully", data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
};

export const getProduct = async (req: Request, res: Response) => {
  idOrThrow(req.params.id, "product");
  const product = await Product.findById(req.params.id).lean();
  if (!product) throw new ApiError(404, "Product not found");
  return res.json({ success: true, message: "Product fetched successfully", data: product });
};

export const createProduct = async (req: Request, res: Response) => {
  const data = pick(req.body, productFields);
  if (data.images !== undefined) data.images = resolveImageUrls(data.images);
  const product = await Product.create(data);
  return res.status(201).json({ success: true, message: "Product created successfully", data: product });
};

export const updateProduct = async (req: Request, res: Response) => {
  idOrThrow(req.params.id, "product");
  const data = pick(req.body, productFields);
  if (data.images !== undefined) data.images = resolveImageUrls(data.images);
  const product = await Product.findByIdAndUpdate(req.params.id, { $set: data }, { new: true, runValidators: true }).lean();
  if (!product) throw new ApiError(404, "Product not found");
  return res.json({ success: true, message: "Product updated successfully", data: product });
};

export const deleteProduct = async (req: Request, res: Response) => {
  idOrThrow(req.params.id, "product");
  const product = await Product.findByIdAndDelete(req.params.id).lean();
  if (!product) throw new ApiError(404, "Product not found");
  return res.json({ success: true, message: "Product deleted successfully", data: product });
};

export const deactivateProduct = async (req: Request, res: Response) => {
  idOrThrow(req.params.id, "product");
  const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true }).lean();
  if (!product) throw new ApiError(404, "Product not found");
  return res.json({ success: true, message: "Product deactivated successfully", data: product });
};

export const listCategories = async (req: Request, res: Response) => {
  const { page, limit } = pageOptions(req);
  const [data, total] = await Promise.all([
    Category.find().sort({ name: 1 }).skip((page - 1) * limit).limit(limit).lean(),
    Category.countDocuments(),
  ]);
  return res.json({ success: true, message: "Admin categories fetched successfully", data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
};

export const getCategory = async (req: Request, res: Response) => {
  idOrThrow(req.params.id, "category");
  const category = await Category.findById(req.params.id).lean();
  if (!category) throw new ApiError(404, "Category not found");
  return res.json({ success: true, message: "Category fetched successfully", data: category });
};

export const createCategory = async (req: Request, res: Response) => {
  const category = await Category.create(pick(req.body, categoryFields));
  return res.status(201).json({ success: true, message: "Category created successfully", data: category });
};

export const updateCategory = async (req: Request, res: Response) => {
  idOrThrow(req.params.id, "category");
  const category = await Category.findByIdAndUpdate(req.params.id, { $set: pick(req.body, categoryFields) }, { new: true, runValidators: true }).lean();
  if (!category) throw new ApiError(404, "Category not found");
  return res.json({ success: true, message: "Category updated successfully", data: category });
};

export const deleteCategory = async (req: Request, res: Response) => {
  idOrThrow(req.params.id, "category");
  const category = await Category.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true }).lean();
  if (!category) throw new ApiError(404, "Category not found");
  return res.json({ success: true, message: "Category deleted successfully", data: category });
};

export const listOrders = async (req: Request, res: Response) => {
  const { page, limit } = pageOptions(req);
  const [data, total] = await Promise.all([
    Order.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate("user", "name email phone role").populate("items.product").lean(),
    Order.countDocuments(),
  ]);
  return res.json({ success: true, message: "Admin orders fetched successfully", data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
};

export const getOrder = async (req: Request, res: Response) => {
  idOrThrow(req.params.id, "order");
  const order = await Order.findById(req.params.id).populate("user", "name email phone role").populate("items.product").lean();
  if (!order) throw new ApiError(404, "Order not found");
  return res.json({ success: true, message: "Order fetched successfully", data: order });
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  idOrThrow(req.params.id, "order");
  const validStatuses: OrderStatus[] = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
  if (!validStatuses.includes(req.body.orderStatus)) throw new ApiError(400, "Invalid order status");
  const order = await Order.findByIdAndUpdate(req.params.id, { orderStatus: req.body.orderStatus }, { new: true, runValidators: true }).lean();
  if (!order) throw new ApiError(404, "Order not found");
  return res.json({ success: true, message: "Order status updated successfully", data: order });
};

const safeUserProjection = "-passwordHash -refreshTokenHash -refreshTokenExpiresAt";

export const listUsers = async (req: Request, res: Response) => {
  const { page, limit } = pageOptions(req);
  const [data, total] = await Promise.all([
    User.find({ role: "CUSTOMER" }).select(safeUserProjection).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    User.countDocuments({ role: "CUSTOMER" }),
  ]);
  return res.json({ success: true, message: "Admin users fetched successfully", data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
};

export const getUser = async (req: Request, res: Response) => {
  idOrThrow(req.params.id, "user");
  const user = await User.findById(req.params.id).select(safeUserProjection).lean();
  if (!user) throw new ApiError(404, "User not found");
  return res.json({ success: true, message: "User fetched successfully", data: user });
};

export const listBanners = async (_req: Request, res: Response) => {
  const banners = await Banner.find().sort({ displayOrder: 1, sortOrder: 1, createdAt: -1 }).lean();
  return res.json({ success: true, message: "Admin banners fetched successfully", data: banners.map(serializeBanner) });
};

export const getBanner = async (req: Request, res: Response) => {
  idOrThrow(req.params.id, "banner");
  const banner = await Banner.findById(req.params.id).lean();
  if (!banner) throw new ApiError(404, "Banner not found");
  return res.json({ success: true, message: "Banner fetched successfully", data: serializeBanner(banner) });
};

export const createBanner = async (req: Request, res: Response) => {
  const data = normalizeBannerInput(req.body);
  if (!data.imageUrl || !data.title) throw new ApiError(400, "imageUrl and title are required");
  const banner = await Banner.create(data);
  return res.status(201).json({ success: true, message: "Banner created successfully", data: serializeBanner(banner) });
};

export const updateBanner = async (req: Request, res: Response) => {
  idOrThrow(req.params.id, "banner");
  const banner = await Banner.findByIdAndUpdate(req.params.id, { $set: normalizeBannerInput(req.body) }, { new: true, runValidators: true }).lean();
  if (!banner) throw new ApiError(404, "Banner not found");
  return res.json({ success: true, message: "Banner updated successfully", data: serializeBanner(banner) });
};

export const deleteBanner = async (req: Request, res: Response) => {
  idOrThrow(req.params.id, "banner");
  const banner = await Banner.findByIdAndDelete(req.params.id).lean();
  if (!banner) throw new ApiError(404, "Banner not found");
  return res.json({ success: true, message: "Banner deleted successfully", data: serializeBanner(banner) });
};