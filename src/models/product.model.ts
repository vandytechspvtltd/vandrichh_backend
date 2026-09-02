import mongoose, { Schema, Types } from "mongoose";

export interface IProduct {
  _id: Types.ObjectId;

  sku: string;

  category: string;
  subcategory: string;

  productName: string;
  material: string;

  availableSizes: string[];
  colours: string[];

  wholesalePrice: number;
  mrp: number;
  sellingPrice: number;

  description: string;
  images: string[];

  stock: number;

  isActive: boolean;
  isFeatured: boolean;
  isTrending: boolean;
  isNew: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    subcategory: {
      type: String,
      default: "",
      trim: true,
    },

    productName: {
      type: String,
      required: true,
      trim: true,
    },

    material: {
      type: String,
      default: "",
      trim: true,
    },

    availableSizes: {
      type: [String],
      default: [],
    },

    colours: {
      type: [String],
      default: [],
    },

    wholesalePrice: {
      type: Number,
      required: true,
      min: 0,
    },

    mrp: {
      type: Number,
      required: true,
      min: 0,
    },

    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    description: {
      type: String,
      default: "",
    },

    images: {
      type: [String],
      default: [],
    },

    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isTrending: {
      type: Boolean,
      default: false,
    },

    isNew: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ sku: 1 }, { unique: true });
productSchema.index({ category: 1 });
productSchema.index({ subcategory: 1 });
productSchema.index({ productName: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ isTrending: 1 });
productSchema.index({ isNew: 1 });
productSchema.index({ createdAt: -1 });

export const Product = mongoose.model<IProduct>(
  "Product",
  productSchema,
  "products"
);