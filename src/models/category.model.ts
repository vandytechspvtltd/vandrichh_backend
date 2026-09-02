import mongoose, {
  Schema,
  Document,
  Types,
} from "mongoose";

export interface ICategory extends Document {
  _id: Types.ObjectId;

  name: string;
  slug: string;
  description: string;
  image: string;

  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    image: {
      type: String,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

categorySchema.index(
  { slug: 1 },
  { unique: true }
);

categorySchema.index({
  isActive: 1,
});

export const Category = mongoose.model<ICategory>(
  "Category",
  categorySchema
);