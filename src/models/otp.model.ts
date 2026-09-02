import mongoose, {
  Schema,
  Types,
} from "mongoose";

export interface IOtp {
  _id: Types.ObjectId;
  phone: string;
  otpHash: string;
  purpose: "LOGIN";
  expiresAt: Date;
  attempts: number;
  createdAt: Date;
  updatedAt: Date;
}

const otpSchema =
  new Schema<IOtp>(
    {
      phone: {
        type: String,
        required: true,
        trim: true,
        index: true,
      },

      otpHash: {
        type: String,
        required: true,
      },

      purpose: {
        type: String,
        enum: ["LOGIN"],
        required: true,
      },

      expiresAt: {
        type: Date,
        required: true,
        index: true,
      },

      attempts: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    {
      timestamps: true,
    }
  );

otpSchema.index(
  {
    expiresAt: 1,
  },
  {
    expireAfterSeconds: 0,
  }
);

export const Otp =
  mongoose.model<IOtp>(
    "Otp",
    otpSchema
  );