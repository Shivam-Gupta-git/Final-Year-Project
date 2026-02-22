import mongoose, { Schema } from "mongoose";

const travelOptionSchema = new mongoose.Schema(
  {
    fromCity: {
      type: Schema.Types.ObjectId,
      ref: "City",
      required: true,
    },

    toCity: {
      type: Schema.Types.ObjectId,
      ref: "City",
    },

    toPlace: {
      type: Schema.Types.ObjectId,
      ref: "Place",
    },

    transportType: {
      type: String,
      enum: ["bus", "train", "cab", "auto", "metro", "flight"],
      required: true,
    },

    avgCost: {
      type: Number,
      required: true,
    },

    timeRequired: {
      type: String,
      required: true,
    },

    isCheapest: { type: Boolean, default: false },
    isFastest: { type: Boolean, default: false },

    images: [String],

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
        required: true,
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
    },

    status: {
      type: String,
      enum: ["active", "inactive", "pending"],
      default: "pending",
    },
  },
  { timestamps: true }
);


travelOptionSchema.index({ location: "2dsphere" });


travelOptionSchema.pre("validate", function (next) {
  if (!this.toCity && !this.toPlace) {
    return next(new Error("Either toCity or toPlace is required"));
  }
  next();
});

export const TravelOption = mongoose.model(
  "TravelOption",
  travelOptionSchema
);