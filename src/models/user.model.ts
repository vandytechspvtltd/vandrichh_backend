import mongoose, {
  Schema,
  Document,
  Types,
} from "mongoose";

export interface IUserAddress {
  _id?: Types.ObjectId;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  isDefault: boolean;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;

  role: "CUSTOMER" | "ADMIN";
  isActive: boolean;

  addresses: IUserAddress[];

  // Refresh token
  refreshTokenHash?: string;
  refreshTokenExpiresAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema<IUserAddress>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    addressLine1: {
      type: String,
      required: true,
      trim: true,
    },

    addressLine2: {
      type: String,
      default: "",
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    pincode: {
      type: String,
      required: true,
      trim: true,
    },

    landmark: {
      type: String,
      default: "",
      trim: true,
    },

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: true,
  }
);

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    passwordHash: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: ["CUSTOMER", "ADMIN"],
      default: "CUSTOMER",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    addresses: {
      type: [addressSchema],
      default: [],
    },

    // ==========================================
    // REFRESH TOKEN
    // ==========================================

    refreshTokenHash: {
      type: String,
      default: undefined,
      select: false,
    },

    refreshTokenExpiresAt: {
      type: Date,
      default: undefined,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index(
  { email: 1 },
  { unique: true }
);

userSchema.index(
  { phone: 1 },
  { unique: true }
);

userSchema.index({ role: 1 });

export const User = mongoose.model<IUser>(
  "User",
  userSchema
);