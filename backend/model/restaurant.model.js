import mongoose, { Schema } from "mongoose";

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: Schema.Types.ObjectId,
      ref: "City",
      required: true,
    },

    famousFood: {
      type: String, 
      required: true,
      trim: true,
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

    bestTime: {
      type: String,
      enum: ["breakfast", "lunch", "dinner", "anytime"],
      default: "anytime",
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

    isRecommended: {
      type: Boolean,
      default: false, 
    },

    status: {
      type: String,
      enum: ["active", "inactive", "pending"],
      default: "pending",
    },
    createdBy : {
      type : mongoose.Schema.Types.ObjectId,
      ref : "User"
    },
  },
  { timestamps: true }
);


restaurantSchema.index({ location: "2dsphere" });

export const Restaurant = mongoose.model("Restaurant", restaurantSchema);
