import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { calculatePagination, formatPaginationResponse } from "../utils/pagination.js";
import type { ProductCreateInput, ProductUpdateInput, ProductQueryInput } from "../validators/product.validator.js";

export class ProductService {
  async getAll(query: ProductQueryInput) {
    const { page, limit, skip } = calculatePagination(query.page || 1, query.limit || 20);

    const filter: any = { isActive: true };

    if (query.search) {
      filter.$or = [
        { productName: { $regex: query.search, $options: "i" } },
        { description: { $regex: query.search, $options: "i" } },
        { sku: { $regex: query.search, $options: "i" } },
      ];
    }

    if (query.category) {
      filter.category = { $regex: query.category, $options: "i" };
    }

    if (query.minPrice || query.maxPrice) {
      filter.sellingPrice = {};
      if (query.minPrice) filter.sellingPrice.$gte = query.minPrice;
      if (query.maxPrice) filter.sellingPrice.$lte = query.maxPrice;
    }

    if (query.size) {
      filter.availableSizes = query.size;
    }

    if (query.colour) {
      filter.colours = query.colour;
    }

    let sortOption: any = { createdAt: -1 };
    if (query.sort === "asc") {
      sortOption = { sellingPrice: 1 };
    } else if (query.sort === "desc") {
      sortOption = { sellingPrice: -1 };
    } else if (query.sort === "newest") {
      sortOption = { createdAt: -1 };
    }

    const products = await Product.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Product.countDocuments(filter);

    return formatPaginationResponse(products, page, limit, total);
  }

  async getById(id: string) {
    const product = await Product.findById(id).lean();

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    if (!product.isActive) {
      throw new ApiError(404, "Product not found");
    }

    return product;
  }

  async getBySku(sku: string) {
    const product = await Product.findOne({ sku: sku.toUpperCase() }).lean();

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    if (!product.isActive) {
      throw new ApiError(404, "Product not found");
    }

    return product;
  }

  async create(input: ProductCreateInput) {
    const existing = await Product.findOne({ sku: input.sku.toUpperCase() });

    if (existing) {
      throw new ApiError(409, "Product with this SKU already exists");
    }

    const product = new Product({
      ...input,
      sku: input.sku.toUpperCase(),
    });

    await product.save();
    return product;
  }

  async update(id: string, updates: ProductUpdateInput) {
    if (updates.sku) {
      const existing = await Product.findOne({
        sku: updates.sku.toUpperCase(),
        _id: { $ne: id },
      });

      if (existing) {
        throw new ApiError(409, "Product with this SKU already exists");
      }

      updates.sku = updates.sku.toUpperCase();
    }

    const product = await Product.findByIdAndUpdate(id, updates, { new: true });

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    return product;
  }

  async deactivate(id: string) {
    const product = await Product.findByIdAndUpdate(id, { isActive: false }, { new: true });

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    return product;
  }

  async delete(id: string) {
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    return product;
  }
}

export const productService = new ProductService();
