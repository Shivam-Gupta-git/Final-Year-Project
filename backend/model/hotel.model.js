import mongoose, { Schema } from "mongoose";

const hotelSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: Schema.Types.ObjectId,
      ref: "City",
      required: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    facilities: {
      type: [String],
      default: [],
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
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    averageRating: {
      type: Number,
      default: 0,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "pending", "rejected"],
      default: "pending",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

hotelSchema.index({ location: "2dsphere" });

export const Hotel = mongoose.model("Hotel", hotelSchema);