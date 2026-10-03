import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "Vandrichh E-commerce API",
      version: "1.0.0",
      description:
        "Complete REST API for Vandrichh e-commerce platform. Records are stored in local JSON files and use prefixed string IDs such as prod_001 and user_001.",
      contact: {
        name: "Vandrichh Support",
        email: "support@vandrichh.com",
      },
    },

    servers: [
      {
        url: "http://localhost:5000/api/v1",
        description: "Development Server",
      },
      {
        url: "https://vandrichhapi.vandytech.com/api/v1",
        description: "Production Server",
      },
      {
        url: "https://vandrichhapi.vandytech.com/api",
        description: "Production admin and public compatibility routes",
      },
    ],

    tags: [
      {
        name: "Auth",
        description: "Authentication APIs",
      },
      {
        name: "Products",
        description: "Product APIs",
      },
      {
        name: "Categories",
        description: "Category APIs",
      },
      {
        name: "Cart",
        description: "Shopping cart APIs",
      },
      {
        name: "Orders",
        description: "Order APIs",
      },
      {
        name: "User",
        description: "User profile and address APIs",
      },
      {
        name: "Wishlist",
        description: "Wishlist APIs",
      },
      {
        name: "Banners",
        description: "Banner APIs",
      },
      {
        name: "Admin",
        description: "Admin dashboard APIs",
      },
      {
        name: "Admin Auth",
        description: "Separate administrator authentication",
      },
      {
        name: "Admin Products",
        description: "Administrator product management",
      },
      {
        name: "Admin Categories",
        description: "Administrator category management",
      },
      {
        name: "Admin Orders",
        description: "Administrator order management",
      },
      {
        name: "Admin Users",
        description: "Administrator customer management",
      },
      {
        name: "Admin Banners",
        description: "Administrator banner management",
      },
      {
        name: "Admin Inventory",
        description: "Administrator inventory management",
      },
      {
        name: "Admin Coupons",
        description: "Administrator coupon management",
      },
      {
        name: "Reviews",
        description: "Customer product reviews",
      },
    ],

    components: {
      // =====================================================
      // Authentication
      // =====================================================

      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "Enter JWT token obtained from login endpoint.",
        },
      },

      // =====================================================
      // Schemas
      // =====================================================

      schemas: {
        Admin: {
          type: "object",
          properties: {
            _id: { type: "string", example: "admin_001" },
            name: { type: "string", example: "Store Admin" },
            email: { type: "string", format: "email", example: "admin@example.com" },
            role: { type: "string", enum: ["ADMIN", "SUPER_ADMIN"] },
            isActive: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Banner: {
          type: "object",
          required: ["imageUrl", "title"],
          properties: {
            _id: { type: "string", example: "banner_001" },
            imageUrl: { type: "string", format: "uri" },
            title: { type: "string" },
            description: { type: "string" },
            redirectUrl: { type: "string", format: "uri" },
            displayOrder: { type: "integer", minimum: 0 },
            isActive: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Inventory: {
          type: "object",
          properties: {
            _id: { type: "string", example: "inv_001" },
            productId: { type: "string", example: "prod_001" },
            sku: { type: "string", example: "SHR-WHT-001" },
            stock: { type: "integer", minimum: 0, example: 25 },
            reserved: { type: "integer", minimum: 0, example: 2 },
            available: { type: "integer", minimum: 0, example: 23 },
            location: { type: "string", example: "warehouse" },
            status: { type: "string", enum: ["IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK"] },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        InventoryInput: {
          type: "object",
          required: ["productId", "sku"],
          properties: {
            productId: { type: "string", example: "prod_001" },
            sku: { type: "string", example: "SHR-WHT-001" },
            stock: { type: "integer", minimum: 0, default: 0 },
            reserved: { type: "integer", minimum: 0, default: 0 },
            location: { type: "string", default: "warehouse" },
            status: { type: "string", enum: ["IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK"], default: "IN_STOCK" },
          },
        },
        InventoryUpdateInput: {
          type: "object",
          properties: {
            productId: { type: "string" },
            sku: { type: "string" },
            stock: { type: "integer", minimum: 0 },
            reserved: { type: "integer", minimum: 0 },
            location: { type: "string" },
            status: { type: "string", enum: ["IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK"] },
          },
        },
        Coupon: {
          type: "object",
          properties: {
            _id: { type: "string", example: "coup_001" },
            code: { type: "string", example: "SAVE10" },
            description: { type: "string" },
            type: { type: "string", enum: ["PERCENTAGE", "FIXED"] },
            value: { type: "number", minimum: 0 },
            minOrderValue: { type: "number", minimum: 0 },
            maxDiscount: { type: "number", minimum: 0 },
            isActive: { type: "boolean" },
            usageLimit: { type: "integer", minimum: 0 },
            usedCount: { type: "integer", minimum: 0 },
            expiresAt: { type: "string", format: "date-time", nullable: true },
          },
        },
        CouponInput: {
          type: "object",
          required: ["code", "description"],
          properties: {
            code: { type: "string", minLength: 3, example: "SAVE10" },
            description: { type: "string", minLength: 1 },
            type: { type: "string", enum: ["PERCENTAGE", "FIXED"], default: "PERCENTAGE" },
            value: { type: "number", minimum: 0, default: 0 },
            minOrderValue: { type: "number", minimum: 0, default: 0 },
            maxDiscount: { type: "number", minimum: 0, default: 0 },
            isActive: { type: "boolean", default: true },
            usageLimit: { type: "integer", minimum: 0, default: 0 },
            expiresAt: { type: "string", format: "date-time", nullable: true },
          },
        },
        CouponUpdateInput: {
          type: "object",
          properties: {
            code: { type: "string", minLength: 3 },
            description: { type: "string", minLength: 1 },
            type: { type: "string", enum: ["PERCENTAGE", "FIXED"] },
            value: { type: "number", minimum: 0 },
            minOrderValue: { type: "number", minimum: 0 },
            maxDiscount: { type: "number", minimum: 0 },
            isActive: { type: "boolean" },
            usageLimit: { type: "integer", minimum: 0 },
            expiresAt: { type: "string", format: "date-time", nullable: true },
          },
        },
        Review: {
          type: "object",
          properties: {
            _id: { type: "string", example: "rev_001" },
            userId: { type: "string", example: "user_001" },
            productId: { type: "string", example: "prod_001" },
            rating: { type: "integer", minimum: 1, maximum: 5, example: 5 },
            title: { type: "string" },
            comment: { type: "string" },
            isApproved: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        ReviewInput: {
          type: "object",
          required: ["productId", "comment"],
          properties: {
            productId: { type: "string", example: "prod_001" },
            rating: { type: "integer", minimum: 1, maximum: 5, default: 5 },
            title: { type: "string" },
            comment: { type: "string", minLength: 1 },
          },
        },
        ReviewUpdateInput: {
          type: "object",
          properties: {
            productId: { type: "string" },
            rating: { type: "integer", minimum: 1, maximum: 5 },
            title: { type: "string" },
            comment: { type: "string", minLength: 1 },
            isApproved: { type: "boolean" },
          },
        },
        AdminProductInput: {
          type: "object",
          required: ["sku", "category", "productName", "mrp", "sellingPrice", "stock"],
          properties: {
            sku: { type: "string", example: "TEST-API-001" },
            category: { type: "string", example: "Shirts" },
            subcategory: { type: "string", example: "Casual Shirts" },
            productName: { type: "string", example: "Classic White Cotton Shirt" },
            material: { type: "string", example: "100% Cotton" },
            availableSizes: { type: "array", items: { type: "string" }, example: ["S", "M", "L", "XL"] },
            colours: { type: "array", items: { type: "string" }, example: ["White", "Blue"] },
            wholesalePrice: { type: "number", example: 180 },
            mrp: { type: "number", example: 499 },
            sellingPrice: { type: "number", example: 399 },
            description: { type: "string", example: "Premium cotton shirt with a relaxed fit." },
            images: { type: "array", items: { type: "string", format: "uri" }, example: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"] },
            stock: { type: "integer", minimum: 0, example: 25 },
            isActive: { type: "boolean", example: true },
            isFeatured: { type: "boolean", example: false },
            isTrending: { type: "boolean", example: false },
            isNew: { type: "boolean", example: true },
          },
        },
        ProductCreateInput: {
          $ref: "#/components/schemas/AdminProductInput",
        },
        ProductUpdateInput: {
          type: "object",
          properties: {
            sku: { type: "string", example: "TEST-API-001" },
            category: { type: "string", example: "Shirts" },
            productName: { type: "string", example: "Updated White Cotton Shirt" },
            mrp: { type: "number", example: 499 },
            sellingPrice: { type: "number", example: 449 },
            stock: { type: "integer", minimum: 0, example: 18 },
            isActive: { type: "boolean", example: true },
            images: { type: "array", items: { type: "string", format: "uri" } },
          },
          description: "Partial update schema for admin product edits. Any provided field is merged into the persisted product record.",
        },
        ProductListResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Admin products fetched successfully" },
            data: { type: "array", items: { $ref: "#/components/schemas/Product" } },
            pagination: {
              type: "object",
              properties: {
                page: { type: "integer", example: 1 },
                limit: { type: "integer", example: 20 },
                total: { type: "integer", example: 42 },
                totalPages: { type: "integer", example: 3 },
              },
            },
          },
        },
        ProductSuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Product created successfully" },
            data: { $ref: "#/components/schemas/Product" },
          },
        },
        ValidationErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "productName cannot be empty" },
            data: { type: "object", nullable: true },
          },
        },
        DuplicateSkuResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "SKU already exists" },
          },
        },
        NotFoundResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Product not found" },
          },
        },
        AdminCategoryInput: {
          allOf: [{ $ref: "#/components/schemas/Category" }],
        },
        AdminBannerInput: {
          allOf: [{ $ref: "#/components/schemas/Banner" }],
        },
        // ===================================================
        // Product
        // ===================================================

        Product: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "prod_001",
            },

            sku: {
              type: "string",
              example: "SHR-WHT-001",
            },

            category: {
              type: "string",
              example: "Shirts",
            },

            subcategory: {
              type: "string",
              example: "Casual Shirts",
            },

            productName: {
              type: "string",
              example: "White Cotton Shirt",
            },

            material: {
              type: "string",
              example: "100% Cotton",
            },

            availableSizes: {
              type: "array",
              items: {
                type: "string",
              },
              example: ["S", "M", "L", "XL"],
            },

            colours: {
              type: "array",
              items: {
                type: "string",
              },
              example: ["White", "Black"],
            },

            wholesalePrice: {
              type: "number",
              example: 150,
            },

            mrp: {
              type: "number",
              example: 299,
            },

            sellingPrice: {
              type: "number",
              example: 249,
            },

            description: {
              type: "string",
              example:
                "Premium quality cotton shirt.",
            },

            images: {
              type: "array",
              items: {
                type: "string",
                format: "uri",
              },
              example: [
                "https://example.com/shirt-1.jpg",
                "https://example.com/shirt-2.jpg",
              ],
            },

            stock: {
              type: "integer",
              minimum: 0,
              example: 100,
            },

            isActive: {
              type: "boolean",
              example: true,
            },

            isFeatured: {
              type: "boolean",
              example: true,
            },

            isTrending: {
              type: "boolean",
              example: false,
            },

            isNew: {
              type: "boolean",
              example: true,
            },

            createdAt: {
              type: "string",
              format: "date-time",
            },

            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },

        // ===================================================
        // User
        // ===================================================

        User: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "user_001",
            },

            name: {
              type: "string",
              example: "John Doe",
            },

            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },

            phone: {
              type: "string",
              example: "9876543210",
            },

            role: {
              type: "string",
              enum: ["CUSTOMER", "ADMIN"],
              example: "CUSTOMER",
            },

            isActive: {
              type: "boolean",
              example: true,
            },

            addresses: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Address",
              },
            },

            createdAt: {
              type: "string",
              format: "date-time",
            },

            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },

        // ===================================================
        // Address
        // ===================================================

        Address: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "addr_001",
            },

            name: {
              type: "string",
              example: "John Doe",
            },

            phone: {
              type: "string",
              example: "9876543210",
            },

            addressLine1: {
              type: "string",
              example: "123 Main Street",
            },

            addressLine2: {
              type: "string",
              example: "Near City Mall",
            },

            city: {
              type: "string",
              example: "Bhubaneswar",
            },

            state: {
              type: "string",
              example: "Odisha",
            },

            pincode: {
              type: "string",
              example: "751001",
            },

            landmark: {
              type: "string",
              example: "Near Temple",
            },

            isDefault: {
              type: "boolean",
              example: true,
            },
          },
        },

        // ===================================================
        // Category
        // ===================================================

        Category: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "cat_001",
            },

            name: {
              type: "string",
              example: "White Shirts",
            },

            slug: {
              type: "string",
              example: "white-shirts",
            },

            description: {
              type: "string",
              example:
                "Premium white shirts collection.",
            },

            image: {
              type: "string",
              format: "uri",
              example:
                "https://example.com/category.jpg",
            },

            isActive: {
              type: "boolean",
              example: true,
            },

            createdAt: {
              type: "string",
              format: "date-time",
            },

            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },

        // ===================================================
        // Cart
        // ===================================================

        CartItem: {
          type: "object",
          properties: {
            product: {
              $ref: "#/components/schemas/Product",
            },

            quantity: {
              type: "integer",
              minimum: 1,
              example: 2,
            },

            selectedSize: {
              type: "string",
              example: "L",
            },

            selectedColour: {
              type: "string",
              example: "White",
            },
          },
        },

        Cart: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "cart_001",
            },

            user: {
              type: "string",
              example: "user_001",
            },

            items: {
              type: "array",
              items: {
                $ref: "#/components/schemas/CartItem",
              },
            },

            createdAt: {
              type: "string",
              format: "date-time",
            },

            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },

        // ===================================================
        // Order
        // ===================================================

        OrderItem: {
          type: "object",
          properties: {
            product: {
              type: "string",
              example: "prod_001",
            },

            productSnapshot: {
              type: "object",
              properties: {
                sku: {
                  type: "string",
                  example: "SHR-WHT-001",
                },

                productName: {
                  type: "string",
                  example: "White Cotton Shirt",
                },

                sellingPrice: {
                  type: "number",
                  example: 249,
                },

                images: {
                  type: "array",
                  items: {
                    type: "string",
                    format: "uri",
                  },
                },
              },
            },

            quantity: {
              type: "integer",
              example: 2,
            },

            selectedSize: {
              type: "string",
              example: "L",
            },

            selectedColour: {
              type: "string",
              example: "White",
            },

            price: {
              type: "number",
              example: 249,
            },

            subtotal: {
              type: "number",
              example: 498,
            },
          },
        },

        ShippingAddress: {
          type: "object",
          required: [
            "name",
            "phone",
            "addressLine1",
            "city",
            "state",
            "pincode",
          ],
          properties: {
            name: {
              type: "string",
              example: "John Doe",
            },

            phone: {
              type: "string",
              example: "9876543210",
            },

            addressLine1: {
              type: "string",
              example: "123 Main Street",
            },

            addressLine2: {
              type: "string",
              example: "Near City Mall",
            },

            city: {
              type: "string",
              example: "Bhubaneswar",
            },

            state: {
              type: "string",
              example: "Odisha",
            },

            pincode: {
              type: "string",
              example: "751001",
            },

            landmark: {
              type: "string",
              example: "Near Temple",
            },
          },
        },

        Order: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "order_001",
            },

            user: {
              type: "string",
              example: "user_001",
            },

            items: {
              type: "array",
              items: {
                $ref: "#/components/schemas/OrderItem",
              },
            },

            shippingAddress: {
              $ref: "#/components/schemas/ShippingAddress",
            },

            subtotal: {
              type: "number",
              example: 498,
            },

            deliveryFee: {
              type: "number",
              example: 0,
            },

            totalAmount: {
              type: "number",
              example: 498,
            },

            paymentMethod: {
              type: "string",
              enum: ["COD"],
              example: "COD",
            },

            paymentStatus: {
              type: "string",
              enum: [
                "PENDING",
                "PAID",
                "FAILED",
                "REFUNDED",
              ],
              example: "PENDING",
            },

            orderStatus: {
              type: "string",
              enum: [
                "PENDING",
                "CONFIRMED",
                "PROCESSING",
                "SHIPPED",
                "DELIVERED",
                "CANCELLED",
              ],
              example: "PENDING",
            },

            createdAt: {
              type: "string",
              format: "date-time",
            },

            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },

        // ===================================================
        // Pagination
        // ===================================================

        Pagination: {
          type: "object",
          properties: {
            page: {
              type: "integer",
              example: 1,
            },

            limit: {
              type: "integer",
              example: 20,
            },

            total: {
              type: "integer",
              example: 100,
            },

            totalPages: {
              type: "integer",
              example: 5,
            },

            hasNextPage: {
              type: "boolean",
              example: true,
            },

            hasPreviousPage: {
              type: "boolean",
              example: false,
            },
          },
        },

        // ===================================================
        // Generic Responses
        // ===================================================

        ApiResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },

            message: {
              type: "string",
              example: "Request successful",
            },

            data: {
              type: "object",
            },
          },
        },

        ApiError: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },

            message: {
              type: "string",
              example: "Something went wrong",
            },

            errors: {
              type: "array",
              items: {
                type: "string",
              },
            },
          },
        },
      },
    },
  },

  apis: ["./src/routes/*.ts", "./src/modules/**/*.routes.ts"],
};

export const swaggerSpec =
  swaggerJsdoc(options);