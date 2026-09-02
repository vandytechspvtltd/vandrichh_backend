import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "Vandrichh E-commerce API",
      version: "1.0.0",
      description:
        "Complete REST API for Vandrichh e-commerce platform with authentication, products, categories, cart, orders, users, wishlist and banners.",
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
        url: "https://api.vandrichh.com/api/v1",
        description: "Production Server",
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
        // ===================================================
        // Product
        // ===================================================

        Product: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "65f123456789abcdef123456",
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
              example: "65f123456789abcdef123456",
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
              example: "65f987654321abcdef654321",
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
              example: "65f123456789abcdef123456",
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
            },

            user: {
              type: "string",
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
              example: "65f123456789abcdef123456",
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
            },

            user: {
              type: "string",
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

  apis: ["./src/routes/*.ts"],
};

export const swaggerSpec =
  swaggerJsdoc(options);