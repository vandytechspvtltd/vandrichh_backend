import { Request, Response } from "express";
import mongoose from "mongoose";
import { Product } from "../models/product.model.js";
import { Category } from "../models/category.model.js";

// =====================================================
// Helpers
// =====================================================

const escapeRegex = (value: string): string => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const parseBooleanQuery = (
  value: unknown
): boolean | undefined => {
  if (value === undefined) {
    return undefined;
  }

  return String(value).toLowerCase() === "true";
};

// =====================================================
// Resolve Category
//
// Accepts:
// - MongoDB _id
// - category name
// - category slug
//
// Returns all possible values that may be stored
// inside Product.category.
// =====================================================

const resolveCategoryValues = async (
  value: string
): Promise<any[]> => {
  const categoryValues: any[] = [];

  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return categoryValues;
  }

  // -----------------------------------------------------
  // If Android sent MongoDB ObjectId
  // -----------------------------------------------------

  if (mongoose.isValidObjectId(normalizedValue)) {
    categoryValues.push(normalizedValue);
    categoryValues.push(
      new mongoose.Types.ObjectId(normalizedValue)
    );

    const category = await Category.findById(
      normalizedValue
    )
      .select("_id name slug")
      .lean();

    if (category) {
      categoryValues.push(category.name);
      categoryValues.push(category.slug);
      categoryValues.push(String(category._id));
    }

    return uniqueValues(categoryValues);
  }

  // -----------------------------------------------------
  // If category name or slug was supplied
  // -----------------------------------------------------

  const regex = new RegExp(
    `^${escapeRegex(normalizedValue)}$`,
    "i"
  );

  const category = await Category.findOne({
    $or: [
      { name: regex },
      { slug: regex },
    ],
    isActive: true,
  })
    .select("_id name slug")
    .lean();

  if (category) {
    categoryValues.push(
      String(category._id)
    );

    categoryValues.push(category.name);
    categoryValues.push(category.slug);
  }

  // Also allow direct value
  categoryValues.push(normalizedValue);

  return uniqueValues(categoryValues);
};

// =====================================================
// Resolve Subcategory
//
// NO HARDCODED MAPPING.
//
// It searches the selected Category's subcategories
// dynamically from MongoDB.
//
// Accepts:
// - subcategory id
// - subcategory name
//
// Returns both id/name values so Product.subcategory
// can match whichever format is stored in DB.
// =====================================================

const resolveSubcategoryValues = async (
  categoryValue: string | undefined,
  subcategoryValue: string
): Promise<string[]> => {
  const values: string[] = [];

  const normalizedSubcategory =
    subcategoryValue.trim();

  if (!normalizedSubcategory) {
    return values;
  }

  // -----------------------------------------------------
  // Find selected category
  // -----------------------------------------------------

  let category = null;

  if (
    categoryValue &&
    mongoose.isValidObjectId(categoryValue)
  ) {
    category = await Category.findById(
      categoryValue
    )
      .select("subcategories")
      .lean();
  } else if (categoryValue) {
    const categoryRegex = new RegExp(
      `^${escapeRegex(categoryValue.trim())}$`,
      "i"
    );

    category = await Category.findOne({
      $or: [
        { name: categoryRegex },
        { slug: categoryRegex },
      ],
      isActive: true,
    })
      .select("subcategories")
      .lean();
  }

  // -----------------------------------------------------
  // Search subcategory dynamically
  // -----------------------------------------------------

  if (category?.subcategories) {
    const subcategoryRegex = new RegExp(
      `^${escapeRegex(normalizedSubcategory)}$`,
      "i"
    );

    const matchedSubcategory =
      category.subcategories.find(
        (subcat: any) =>
          subcategoryRegex.test(
            String(subcat.name ?? "")
          ) ||
          subcategoryRegex.test(
            String(subcat.id ?? "")
          )
      );

    if (matchedSubcategory) {
      if (matchedSubcategory.id) {
        values.push(
          String(matchedSubcategory.id)
        );
      }

      if (matchedSubcategory.name) {
        values.push(
          String(matchedSubcategory.name)
        );
      }
    }
  }

  // Also allow the value directly.
  values.push(normalizedSubcategory);

  return uniqueStrings(values);
};

// =====================================================
// Unique Values
// =====================================================

const uniqueValues = (
  values: any[]
): any[] => {
  const result: any[] = [];

  for (const value of values) {
    const key = String(value);

    if (
      !result.some(
        (existing) =>
          String(existing) === key
      )
    ) {
      result.push(value);
    }
  }

  return result;
};

const uniqueStrings = (
  values: string[]
): string[] => {
  return [
    ...new Set(
      values.filter(
        (value) => value.trim().length > 0
      )
    ),
  ];
};

// =====================================================
// Get All Products
// =====================================================

export const getAll = async (
  req: Request,
  res: Response
) => {
  try {
    const page = Math.max(
      parseInt(
        String(
          req.query.page ?? "1"
        ),
        10
      ),
      1
    );

    const limit = Math.min(
      Math.max(
        parseInt(
          String(
            req.query.limit ?? "20"
          ),
          10
        ),
        1
      ),
      100
    );

    const filter: Record<string, any> = {
      isActive: true,
    };

    // =====================================================
    // CATEGORY
    // =====================================================

    if (req.query.category) {
      const categoryValue =
        String(
          req.query.category
        ).trim();

      const categoryValues =
        await resolveCategoryValues(
          categoryValue
        );

      if (categoryValues.length > 0) {
        filter.category = {
          $in: categoryValues,
        };
      } else {
        // No category exists -> no products
        filter.category = {
          $in: [],
        };
      }

      console.log(
        "[Products] Category input:",
        categoryValue
      );

      console.log(
        "[Products] Resolved category values:",
        categoryValues
      );
    }

    // =====================================================
    // SUBCATEGORY
    // =====================================================

    if (req.query.subcategory) {
      const subcategoryValue =
        String(
          req.query.subcategory
        ).trim();

      const categoryValue =
        req.query.category
          ? String(
              req.query.category
            ).trim()
          : undefined;

      const subcategoryValues =
        await resolveSubcategoryValues(
          categoryValue,
          subcategoryValue
        );

      if (subcategoryValues.length > 0) {
        filter.subcategory = {
          $in: subcategoryValues,
        };
      } else {
        // No matching subcategory
        filter.subcategory = {
          $in: [],
        };
      }

      console.log(
        "[Products] Subcategory input:",
        subcategoryValue
      );

      console.log(
        "[Products] Resolved subcategory values:",
        subcategoryValues
      );
    }

    // =====================================================
    // SEARCH
    // =====================================================

    if (req.query.search) {
      const search =
        String(
          req.query.search
        ).trim();

      if (search) {
        const searchRegex = {
          $regex: escapeRegex(search),
          $options: "i",
        };

        filter.$or = [
          {
            productName:
              searchRegex,
          },
          {
            sku:
              searchRegex,
          },
          {
            description:
              searchRegex,
          },
        ];
      }
    }

    // =====================================================
    // FEATURED
    // =====================================================

    const isFeatured =
      parseBooleanQuery(
        req.query.isFeatured
      );

    if (isFeatured !== undefined) {
      filter.isFeatured =
        isFeatured;
    }

    // =====================================================
    // TRENDING
    // =====================================================

    const isTrending =
      parseBooleanQuery(
        req.query.isTrending
      );

    if (isTrending !== undefined) {
      filter.isTrending =
        isTrending;
    }

    // =====================================================
    // NEW
    // =====================================================

    const isNew =
      parseBooleanQuery(
        req.query.isNew
      );

    if (isNew !== undefined) {
      filter.isNew = isNew;
    }

    // =====================================================
    // SORT
    // =====================================================

    let sort: Record<
      string,
      1 | -1
    > = {
      createdAt: -1,
    };

    switch (
      String(
        req.query.sort ?? ""
      )
    ) {
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

    const skip =
      (page - 1) * limit;

    // =====================================================
    // DEBUG LOG
    // =====================================================

    console.log(
      "================================================="
    );

    console.log(
      "[Products] GET /products"
    );

    console.log(
      "[Products] Query:",
      req.query
    );

    console.log(
      "[Products] Final filter:",
      JSON.stringify(
        filter,
        null,
        2
      )
    );

    console.log(
      "================================================="
    );

    // =====================================================
    // DATABASE QUERY
    // =====================================================

    const [
      products,
      total,
    ] = await Promise.all([
      Product.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),

      Product.countDocuments(
        filter
      ),
    ]);

    console.log(
      `[Products] Found ${products.length}/${total} products`
    );

    // =====================================================
    // RESPONSE
    // =====================================================

    return res.status(200).json({
      success: true,
      message:
        "Products fetched successfully",

      data: {
        products,

        pagination: {
          page,
          limit,
          total,

          totalPages:
            Math.ceil(
              total / limit
            ),

          hasNextPage:
            page <
            Math.ceil(
              total / limit
            ),

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
      message:
        "Failed to fetch products",
      data: {
        products: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      },
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
    const { id } =
      req.params;

    if (
      !mongoose.isValidObjectId(
        id
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid product ID",
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
        message:
          "Product not found",
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
      message:
        "Failed to fetch product",
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
        message:
          "SKU is required",
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
        message:
          "Product not found",
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
      message:
        "Failed to fetch product",
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
        Number(
          req.query.limit
        ) || 10,
        1
      ),
      100
    );

    const products =
      await Product.find({
        isActive: true,
        isFeatured: true,
      })
        .sort({
          createdAt: -1,
        })
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
        Number(
          req.query.limit
        ) || 10,
        1
      ),
      100
    );

    const products =
      await Product.find({
        isActive: true,
        isTrending: true,
      })
        .sort({
          createdAt: -1,
        })
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

export const getNewArrivals = async (
  req: Request,
  res: Response
) => {
  try {
    const limit = Math.min(
      Math.max(
        Number(
          req.query.limit
        ) || 10,
        1
      ),
      100
    );

    const products =
      await Product.find({
        isActive: true,
        isNew: true,
      })
        .sort({
          createdAt: -1,
        })
        .limit(limit)
        .lean();

    return res.status(200).json({
      success: true,
      message:
        "New arrivals fetched successfully",
      data: products,
    });
  } catch (error) {
    console.error(
      "getNewArrivals error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch new arrivals",
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
      await Product.create(
        req.body
      );

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

    if (
      error?.code === 11000
    ) {
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
    const { id } =
      req.params;

    if (
      !mongoose.isValidObjectId(
        id
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid product ID",
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
        message:
          "Product not found",
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

    if (
      error?.code === 11000
    ) {
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
    const { id } =
      req.params;

    if (
      !mongoose.isValidObjectId(
        id
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid product ID",
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
        message:
          "Product not found",
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
    const { id } =
      req.params;

    if (
      !mongoose.isValidObjectId(
        id
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid product ID",
      });
    }

    const product =
      await Product.findByIdAndDelete(
        id
      );

    if (!product) {
      return res.status(404).json({
        success: false,
        message:
          "Product not found",
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