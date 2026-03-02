import mongoose, { Schema } from "mongoose";

const placeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    city: {
      type: Schema.Types.ObjectId,
      ref: "City",
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      enum: ["temple", "fort", "park", "market", "other"],
      required: true,
    },

    //change here
    timeRequired: {
      type: String,
      trim: true,
      minlength: 2,
      maxlength: 20,
      required: true,
    },

    entryfees: {
      type: Number,
      required: true,
      default: 0,
    },

    isPopular: {
      type: String,
      default: false,
    },

    bestTimeToVisit: {
      type: String,
      trim: true,
    },

    images: [
      {
        type: String,
      },
    ],

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    status: {
      type: String,
      enum: ["active", "inactive", "pending", "rejected"],
      default: "pending",
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
  { timestamps: true },
);

placeSchema.index({ location: "2dsphere" });

export const Place = mongoose.model("Place", placeSchema);
