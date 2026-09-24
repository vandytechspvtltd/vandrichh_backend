import mongoose, { Schema, Document, Types } from "mongoose";

export interface IBanner extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  redirectUrl?: string;
  displayOrder: number;
  subtitle?: string;
  imageUrl: string;
  link?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const bannerSchema = new Schema<IBanner>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    redirectUrl: {
      type: String,
      default: "",
      trim: true,
    },

    subtitle: {
      type: String,
      default: "",
      trim: true,
    },

    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },

    link: {
      type: String,
      default: "",
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    sortOrder: {
      type: Number,
      default: 0,
    },

    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

bannerSchema.index({ isActive: 1, displayOrder: 1 });

export const Banner = mongoose.model<IBanner>(
  "Banner",
  bannerSchema
);