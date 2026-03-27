import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    state: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "City",
      required: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "City",
      required: true,
    },

    famousFood: {
      type: String,
    },
    
    bestTime: {
     type: String
    },

    foodType: {
      type: String,
      enum: ["veg", "non-veg", "both"],
      required: true,
    },

    avgCostForOne: {
      type: Number,
      required: true,
    },

    openingHours: {
      open: String,
      close: String,
    },

    images: [String],

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
    },

    isRecommended: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "pending", "rejected"],
      default: "pending",
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    averageRating: {
      type: Number,
      default: 0,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

restaurantSchema.index({ location: "2dsphere" });

export const Restaurant = mongoose.model("Restaurant", restaurantSchema);