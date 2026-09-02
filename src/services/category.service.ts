import { Category } from "../models/category.model.js";
import { ApiError } from "../utils/ApiError.js";
import { calculatePagination, formatPaginationResponse } from "../utils/pagination.js";
import type { CategoryCreateInput, CategoryUpdateInput } from "../validators/category.validator.js";

export class CategoryService {
  async getAll(page?: number, limit?: number, search?: string) {
    const { skip, limit: limitNum, page: pageNum } = calculatePagination(page || 1, limit || 20);

    const filter: any = { isActive: true };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
      ];
    }

    const categories = await Category.find(filter).skip(skip).limit(limitNum).lean();

    const total = await Category.countDocuments(filter);

    return formatPaginationResponse(categories, pageNum, limitNum, total);
  }

  async getById(id: string) {
    const category = await Category.findById(id).lean();

    if (!category) {
      throw new ApiError(404, "Category not found");
    }

    return category;
  }

  async create(input: CategoryCreateInput) {
    const existing = await Category.findOne({ slug: input.slug });

    if (existing) {
      throw new ApiError(409, "Category with this slug already exists");
    }

    const category = new Category(input);
    await category.save();
    return category;
  }

  async update(id: string, updates: CategoryUpdateInput) {
    if (updates.slug) {
      const existing = await Category.findOne({
        slug: updates.slug,
        _id: { $ne: id },
      });

      if (existing) {
        throw new ApiError(409, "Category with this slug already exists");
      }
    }

    const category = await Category.findByIdAndUpdate(id, updates, { new: true });

    if (!category) {
      throw new ApiError(404, "Category not found");
    }

    return category;
  }

  async delete(id: string) {
    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      throw new ApiError(404, "Category not found");
    }

    return category;
  }
}

export const categoryService = new CategoryService();
