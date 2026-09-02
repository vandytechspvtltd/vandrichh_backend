import mongoose, {
  Schema,
  Document,
  Types,
} from "mongoose";

export interface ICartItem {
  product: Types.ObjectId;
  quantity: number;
  selectedSize?: string;
  selectedColour?: string;
}

export interface ICart extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}

const cartItemSchema = new Schema<ICartItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
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
  },
  {
    _id: false,
  }
);

const cartSchema = new Schema<ICart>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    items: {
      type: [cartItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

cartSchema.index(
  { user: 1 },
  { unique: true }
);

export const Cart = mongoose.model<ICart>(
  "Cart",
  cartSchema
);