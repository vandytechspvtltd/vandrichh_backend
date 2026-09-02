import { Request, Response } from "express";
import { Category } from "../models/category.model.js";

/**
 * GET ALL ACTIVE CATEGORIES
 *
 * MongoDB se categories fetch hoti hain.
 * Koi category name hardcode nahi hai.
 */
export const getAll = async (
  _req: Request,
  res: Response
) => {
  try {
    const categories = await Category.find({
      isActive: true,
    })
      .sort({ name: 1 })
      .lean();

    const data = categories.map((category) => ({
      ...category,
      _id: category._id.toString(),
    }));

    console.log(
      `[Categories] Found ${data.length} active categories`
    );

    data.forEach((category, index) => {
      console.log(
        `[Categories] ${index + 1}. ${category._id} - ${category.name}`
      );
    });

    return res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      data,
    });
  } catch (error) {
    console.error(
      "[Categories] getAll error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      data: [],
    });
  }
};

/**
 * GET CATEGORY BY ID
 */
export const getById = async (
  req: Request,
  res: Response
) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      isActive: true,
    }).lean();

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category fetched successfully",
      data: {
        ...category,
        _id: category._id.toString(),
      },
    });
  } catch (error) {
    console.error(
      "[Categories] getById error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch category",
      data: null,
    });
  }
};

/**
 * CREATE CATEGORY
 */
export const create = async (
  req: Request,
  res: Response
) => {
  try {
    const category = await Category.create(
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: {
        ...category.toObject(),
        _id: category._id.toString(),
      },
    });
  } catch (error: any) {
    console.error(
      "[Categories] create error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Failed to create category",
      data: null,
    });
  }
};

/**
 * UPDATE CATEGORY
 */
export const update = async (
  req: Request,
  res: Response
) => {
  try {
    const category =
      await Category.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        {
          new: true,
          runValidators: true,
        }
      ).lean();

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: {
        ...category,
        _id: category._id.toString(),
      },
    });
  } catch (error: any) {
    console.error(
      "[Categories] update error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Failed to update category",
      data: null,
    });
  }
};

/**
 * DELETE CATEGORY
 *
 * Soft delete:
 * isActive = false
 */
export const remove = async (
  req: Request,
  res: Response
) => {
  try {
    const category =
      await Category.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            isActive: false,
          },
        },
        {
          new: true,
        }
      ).lean();

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      data: {
        ...category,
        _id: category._id.toString(),
      },
    });
  } catch (error) {
    console.error(
      "[Categories] remove error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete category",
      data: null,
    });
  }
};