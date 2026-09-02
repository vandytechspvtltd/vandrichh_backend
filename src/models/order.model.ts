import mongoose, {
  Schema,
  Document,
  Types,
} from "mongoose";

export interface IOrderItem {
  product: Types.ObjectId;

  productSnapshot: {
    sku: string;
    productName: string;
    sellingPrice: number;
    images: string[];
  };

  quantity: number;

  selectedSize?: string;
  selectedColour?: string;

  price: number;
  subtotal: number;
}

export interface IShippingAddress {
  name: string;
  phone: string;

  addressLine1: string;
  addressLine2?: string;

  city: string;
  state: string;
  pincode: string;

  landmark?: string;
}

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "REFUNDED";

export interface IOrder extends Document {
  _id: Types.ObjectId;

  user: Types.ObjectId;

  items: IOrderItem[];

  shippingAddress: IShippingAddress;

  subtotal: number;
  deliveryFee: number;
  totalAmount: number;

  paymentMethod: "COD";
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;

  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema =
  new Schema<IOrderItem>(
    {
      product: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },

      productSnapshot: {
        sku: {
          type: String,
          required: true,
        },

        productName: {
          type: String,
          required: true,
        },

        sellingPrice: {
          type: Number,
          required: true,
        },

        images: {
          type: [String],
          default: [],
        },
      },

      quantity: {
        type: Number,
        required: true,
        min: 1,
      },

      selectedSize: {
        type: String,
        default: null,
      },

      selectedColour: {
        type: String,
        default: null,
      },

      price: {
        type: Number,
        required: true,
        min: 0,
      },

      subtotal: {
        type: Number,
        required: true,
        min: 0,
      },
    },
    {
      _id: false,
    }
  );

const shippingAddressSchema =
  new Schema<IShippingAddress>(
    {
      name: {
        type: String,
        required: true,
      },

      phone: {
        type: String,
        required: true,
      },

      addressLine1: {
        type: String,
        required: true,
      },

      addressLine2: {
        type: String,
        default: "",
      },

      city: {
        type: String,
        required: true,
      },

      state: {
        type: String,
        required: true,
      },

      pincode: {
        type: String,
        required: true,
      },

      landmark: {
        type: String,
        default: "",
      },
    },
    {
      _id: false,
    }
  );

const orderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: {
      type: [orderItemSchema],
      required: true,

      validate: {
        validator: (items: IOrderItem[]) =>
          items.length > 0,

        message:
          "Order must have at least one item",
      },
    },

    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    deliveryFee: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentMethod: {
      type: String,
      enum: ["COD"],
      default: "COD",
    },

    paymentStatus: {
      type: String,
      enum: [
        "PENDING",
        "PAID",
        "FAILED",
        "REFUNDED",
      ],
      default: "PENDING",
    },

    orderStatus: {
      type: String,
      enum: [
        "PENDING",
        "CONFIRMED",
        "PROCESSING",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED",
      ],
      default: "PENDING",
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ user: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ createdAt: -1 });

export const Order = mongoose.model<IOrder>(
  "Order",
  orderSchema
);