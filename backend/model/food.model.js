import mongoose from "mongoose";

const foodSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: String,

    price: {
      type: Number,
      required: true,
    },

    category: {
      type: String,
      enum: ["starter", "main", "dessert"],
      required: true,
    },

    isVeg: {
      type: Boolean,
      default: true,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },
    images: [
      {
        type: String,
        default: [],
      },
    ],
  },
  { timestamps: true }
);

foodSchema.index({ restaurant: 1 });
export const Food = mongoose.model("Food", foodSchema);
