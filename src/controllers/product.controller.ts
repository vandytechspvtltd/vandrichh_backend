import { Request, Response } from "express";
import mongoose from "mongoose";
import { Product } from "../models/product.model.js";

// =====================================================
// Get All Products
// =====================================================
// =====================================================
// Get All Products
// =====================================================

export const getAll = async (
  req: Request,
  res: Response
) => {
  try {
    const page = Math.max(
      parseInt(String(req.query.page ?? "1"), 10),
      1
    );

    const limit = Math.min(
      Math.max(
        parseInt(String(req.query.limit ?? "20"), 10),
        1
      ),
      100
    );

    const filter: Record<string, any> = {
      isActive: true,
    };

    // =====================================================
    // CATEGORY FILTER
    // =====================================================

    if (req.query.category) {
      const categoryValue = String(req.query.category).trim();

      /*
       * Android sends Category MongoDB _id:
       *
       * 6a96f6d9eae00459f59e4e50
       *
       * Products may store category as:
       * - ObjectId
       * - string ObjectId
       * - category name
       * - category slug
       */

      const categoryValues: any[] = [];

      if (mongoose.isValidObjectId(categoryValue)) {
        categoryValues.push(
          new mongoose.Types.ObjectId(categoryValue)
        );

        categoryValues.push(categoryValue);
      }

      // Also allow direct category name / slug
      categoryValues.push(categoryValue);

      // Resolve MongoDB category document
      try {
        const Category = (
          await import("../models/category.model.js")
        ).Category;

        const categoryDoc = await Category.findById(
          categoryValue
        )
          .select("_id name slug")
          .lean();

        if (categoryDoc) {
          categoryValues.push(categoryDoc.name);
          categoryValues.push(categoryDoc.slug);
          categoryValues.push(String(categoryDoc._id));
        }
      } catch (categoryError) {
        console.error(
          "⚠️ Category lookup failed:",
          categoryError
        );
      }

      // Remove duplicates
      const uniqueCategoryValues = [
        ...new Map(
          categoryValues.map((value) => [
            String(value),
            value,
          ])
        ).values(),
      ];

      filter.category = {
        $in: uniqueCategoryValues,
      };

      console.log(
        "🟢 Product category filter:",
        uniqueCategoryValues
      );
    }

    // =====================================================
    // SUBCATEGORY FILTER
    // =====================================================

    if (req.query.subcategory) {
      const subcategoryValue = String(
        req.query.subcategory
      ).trim();

      /*
       * Android currently sends:
       *
       * Sneakers
       * Formal Shoes
       * Bra
       * Sports Bra
       * Formal Shirts
       * Casual Shirts
       *
       * DB may store:
       *
       * footwear-sneakers
       * footwear-formal
       * innerwear-bra
       * innerwear-sports-bra
       * shirts-formal
       * shirts-casual
       */

      const subcategoryMap: Record<string, string[]> = {
        sneakers: [
          "Sneakers",
          "footwear-sneakers",
        ],

        "formal shoes": [
          "Formal Shoes",
          "footwear-formal",
        ],

        bra: [
          "Bra",
          "innerwear-bra",
        ],

        "sports bra": [
          "Sports Bra",
          "innerwear-sports-bra",
        ],

        "formal shirts": [
          "Formal Shirts",
          "shirts-formal",
        ],

        "casual shirts": [
          "Casual Shirts",
          "shirts-casual",
        ],
      };

      const normalized =
        subcategoryValue.toLowerCase();

      const values =
        subcategoryMap[normalized] ?? [
          subcategoryValue,
        ];

      filter.subcategory = {
        $in: values,
      };

      console.log(
        "🟢 Product subcategory filter:",
        values
      );
    }

    // =====================================================
    // SEARCH
    // =====================================================

    if (req.query.search) {
      const search = String(
        req.query.search
      ).trim();

      filter.$or = [
        {
          productName: {
            $regex: search,
            $options: "i",
          },
        },
        {
          sku: {
            $regex: search,
            $options: "i",
          },
        },
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // =====================================================
    // FEATURED
    // =====================================================

    if (req.query.isFeatured !== undefined) {
      filter.isFeatured =
        String(req.query.isFeatured).toLowerCase() ===
        "true";
    }

    // =====================================================
    // TRENDING
    // =====================================================

    if (req.query.isTrending !== undefined) {
      filter.isTrending =
        String(req.query.isTrending).toLowerCase() ===
        "true";
    }

    // =====================================================
    // NEW
    // =====================================================

    if (req.query.isNew !== undefined) {
      filter.isNew =
        String(req.query.isNew).toLowerCase() ===
        "true";
    }

    // =====================================================
    // SORT
    // =====================================================

    let sort: Record<string, 1 | -1> = {
      createdAt: -1,
    };

    switch (String(req.query.sort ?? "")) {
      case "price_low":
      case "price_asc":
        sort = {
          sellingPrice: 1,
        };
        break;

      case "price_high":
      case "price_desc":
        sort = {
          sellingPrice: -1,
        };
        break;

      case "newest":
        sort = {
          createdAt: -1,
        };
        break;

      case "oldest":
        sort = {
          createdAt: 1,
        };
        break;

      case "name_asc":
        sort = {
          productName: 1,
        };
        break;

      case "name_desc":
        sort = {
          productName: -1,
        };
        break;
    }

    // =====================================================
    // PAGINATION
    // =====================================================

    const skip = (page - 1) * limit;

    console.log(
      "🔎 Final Product Filter:",
      JSON.stringify(filter, null, 2)
    );

    const [products, total] =
      await Promise.all([
        Product.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),

        Product.countDocuments(filter),
      ]);

    console.log(
      `✅ Products found: ${products.length}/${total}`
    );

    // =====================================================
    // RESPONSE
    // =====================================================

    return res.status(200).json({
      success: true,
      message: "Products fetched successfully",

      data: {
        products,

        pagination: {
          page,
          limit,
          total,

          totalPages:
            Math.ceil(total / limit),

          hasNextPage:
            page <
            Math.ceil(total / limit),

          hasPreviousPage:
            page > 1,
        },
      },
    });

  } catch (error) {
    console.error(
      "❌ getAll products error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};
// =====================================================
// Get Product By ID
// =====================================================

export const getById = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product =
      await Product.findOne({
        _id: id,
        isActive: true,
      }).lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Product fetched successfully",
      data: product,
    });
  } catch (error) {
    console.error(
      "getById product error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
};

// =====================================================
// Get Product By SKU
// =====================================================

export const getBySku = async (
  req: Request,
  res: Response
) => {
  try {
    const sku = String(
      req.params.sku
    )
      .trim()
      .toUpperCase();

    if (!sku) {
      return res.status(400).json({
        success: false,
        message: "SKU is required",
      });
    }

    const product =
      await Product.findOne({
        sku,
        isActive: true,
      }).lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Product fetched successfully",
      data: product,
    });
  } catch (error) {
    console.error(
      "getBySku product error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
};

// =====================================================
// Featured Products
// =====================================================

export const getFeatured = async (
  req: Request,
  res: Response
) => {
  try {
    const limit = Math.min(
      Math.max(
        Number(req.query.limit) || 10,
        1
      ),
      100
    );

    const products =
      await Product.find({
        isActive: true,
        isFeatured: true,
      })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

    return res.status(200).json({
      success: true,
      message:
        "Featured products fetched successfully",
      data: products,
    });
  } catch (error) {
    console.error(
      "getFeatured error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch featured products",
    });
  }
};

// =====================================================
// Trending Products
// =====================================================

export const getTrending = async (
  req: Request,
  res: Response
) => {
  try {
    const limit = Math.min(
      Math.max(
        Number(req.query.limit) || 10,
        1
      ),
      100
    );

    const products =
      await Product.find({
        isActive: true,
        isTrending: true,
      })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

    return res.status(200).json({
      success: true,
      message:
        "Trending products fetched successfully",
      data: products,
    });
  } catch (error) {
    console.error(
      "getTrending error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch trending products",
    });
  }
};

// =====================================================
// New Arrivals
// =====================================================

// =====================================================
// New Arrivals
// =====================================================

export const getNewArrivals = async (
  req: Request,
  res: Response
) => {
  try {
    const limit = Math.min(
      Math.max(
        Number(req.query.limit) || 10,
        1
      ),
      100
    );

    const products = await Product.find({
      isActive: true,
      isNew: true, // ✅ IMPORTANT
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return res.status(200).json({
      success: true,
      message: "New arrivals fetched successfully",
      data: products,
    });
  } catch (error) {
    console.error(
      "getNewArrivals error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch new arrivals",
    });
  }
};
// =====================================================
// Create Product - ADMIN
// =====================================================

export const create = async (
  req: Request,
  res: Response
) => {
  try {
    const product =
      await Product.create(req.body);

    return res.status(201).json({
      success: true,
      message:
        "Product created successfully",
      data: product,
    });
  } catch (error: any) {
    console.error(
      "create product error:",
      error
    );

    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Product SKU already exists",
      });
    }

    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Failed to create product",
    });
  }
};

// =====================================================
// Update Product - ADMIN
// =====================================================

export const update = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product =
      await Product.findByIdAndUpdate(
        id,
        {
          $set: req.body,
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Product updated successfully",
      data: product,
    });
  } catch (error: any) {
    console.error(
      "update product error:",
      error
    );

    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Product SKU already exists",
      });
    }

    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Failed to update product",
    });
  }
};

// =====================================================
// Deactivate Product - ADMIN
// =====================================================

export const deactivate = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product =
      await Product.findByIdAndUpdate(
        id,
        {
          $set: {
            isActive: false,
          },
        },
        {
          new: true,
        }
      );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Product deactivated successfully",
      data: product,
    });
  } catch (error) {
    console.error(
      "deactivate product error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to deactivate product",
    });
  }
};

// =====================================================
// Permanently Delete Product - ADMIN
// =====================================================

export const remove = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product =
      await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Product deleted successfully",
      data: product,
    });
  } catch (error) {
    console.error(
      "remove product error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete product",
    });
  }
};