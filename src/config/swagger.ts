import swaggerJsdoc from "swagger-jsdoc";

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.3",

    info: {
      title: "Vandrichh API",
      version: "1.0.0",
      description:
        "Vandrichh generic REST API for products, authentication, cart, orders and categories.",
    },

    servers: [
      {
        url: "/api/v1",
        description: "Current server",
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },

      schemas: {
        User: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "66c123456789abcdef123456",
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
          },
        },

        Product: {
          type: "object",
          properties: {
            _id: {
              type: "string",
            },

            sku: {
              type: "string",
            },

            category: {
              type: "string",
            },

            subcategory: {
              type: "string",
            },

            productName: {
              type: "string",
            },

            material: {
              type: "string",
            },

            availableSizes: {
              type: "array",
              items: {
                type: "string",
              },
            },

            colours: {
              type: "array",
              items: {
                type: "string",
              },
            },

            wholesalePrice: {
              type: "number",
            },

            mrp: {
              type: "number",
            },

            sellingPrice: {
              type: "number",
            },

            description: {
              type: "string",
            },

            images: {
              type: "array",
              items: {
                type: "string",
              },
            },

            stock: {
              type: "integer",
            },

            isActive: {
              type: "boolean",
            },

            isFeatured: {
              type: "boolean",
            },

            isTrending: {
              type: "boolean",
            },

            isNew: {
              type: "boolean",
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

        Category: {
          type: "object",
          properties: {
            _id: {
              type: "string",
            },
            name: {
              type: "string",
            },
            slug: {
              type: "string",
            },
            description: {
              type: "string",
            },
            image: {
              type: "string",
            },
            isActive: {
              type: "boolean",
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
                type: "object",
                properties: {
                  product: {
                    type: "string",
                  },
                  quantity: {
                    type: "integer",
                    minimum: 1,
                  },
                  selectedSize: {
                    type: "string",
                  },
                  selectedColour: {
                    type: "string",
                  },
                },
              },
            },
          },
        },

        Address: {
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
                type: "object",
              },
            },

            subtotal: {
              type: "number",
            },

            deliveryFee: {
              type: "number",
            },

            totalAmount: {
              type: "number",
            },

            paymentMethod: {
              type: "string",
              enum: ["COD"],
            },

            paymentStatus: {
              type: "string",
              enum: [
                "PENDING",
                "PAID",
                "FAILED",
                "REFUNDED",
              ],
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
            },

            shippingAddress: {
              $ref: "#/components/schemas/Address",
            },
          },
        },
      },
    },
  },

  apis: [
    "./src/routes/*.routes.ts",
    "./src/routes/*.ts",
  ],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);

/*
 * -------------------------------------------------------
 * Remove unwanted default values from QUERY parameters
 * -------------------------------------------------------
 *
 * Only page and limit are allowed to have defaults.
 *
 * This prevents Swagger UI from automatically sending:
 *
 * category=Shirts
 * subcategory=Casual Shirts
 * search=white shirt
 * sort=price_low
 * isFeatured=true
 * isTrending=true
 * isNew=true
 *
 * These values must be provided by the API consumer.
 */

const paths = swaggerSpec.paths as Record<string, any>;

Object.values(paths).forEach((pathItem: any) => {
  if (!pathItem) return;

  Object.values(pathItem).forEach((operation: any) => {
    if (!operation || typeof operation !== "object") {
      return;
    }

    if (!Array.isArray(operation.parameters)) {
      return;
    }

    operation.parameters.forEach((parameter: any) => {
      if (parameter?.in !== "query") {
        return;
      }

      const name = parameter.name;

      // Keep only pagination defaults
      if (name !== "page" && name !== "limit") {
        if (parameter.schema) {
          delete parameter.schema.default;
        }

        delete parameter.default;
      }
    });
  });
});