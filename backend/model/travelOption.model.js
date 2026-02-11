import mongoose, { Schema } from "mongoose";

const travelOptionSchema = new mongoose.Schema(
  {
    fromCity: {
      type: Schema.Types.ObjectId,
      ref: "City",
      required: true,
    },

    toPlace: {
      type: Schema.Types.ObjectId,
      ref: "Place",
      required: true,
    },

    transportType: {
      type: String,
      enum: ["bus", "train", "cab", "auto", "metro"],
      required: true,
    },

    avgCost: {
      type: Number,
      required: true,
    },

    timeRequired: {
      type: String, // e.g. "30 min", "1.5 hr"
      required: true,
    },

    isCheapest: {
      type: Boolean,
      default: false,
    },

    isFastest: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "pending"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const TravelOption = mongoose.model(
  "TravelOption",
  travelOptionSchema
);
