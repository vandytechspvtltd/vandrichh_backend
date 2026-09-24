import mongoose, { Document, Schema, Types } from "mongoose";

export type AdminRole = "ADMIN" | "SUPER_ADMIN";

export interface IAdmin extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: AdminRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const adminSchema = new Schema<IAdmin>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["ADMIN", "SUPER_ADMIN"],
      default: "ADMIN",
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

adminSchema.index({ email: 1 }, { unique: true });

export const Admin = mongoose.model<IAdmin>("Admin", adminSchema, "admins");