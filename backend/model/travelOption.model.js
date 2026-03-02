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
<<<<<<< HEAD

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
=======

    images: [String],

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
>>>>>>> 91b752c67c5d8954697bf8d60b9b6c24f3480bcd
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
      enum: ["active", "inactive", "pending", "rejected"],
      default: "pending",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);


travelOptionSchema.index({ location: "2dsphere" });

<<<<<<< HEAD

travelOptionSchema.pre("validate", function (next) {
  if (!this.toCity && !this.toPlace) {
    return next(new Error("Either toCity or toPlace is required"));
  }
  next();
});

=======
>>>>>>> 91b752c67c5d8954697bf8d60b9b6c24f3480bcd
export const TravelOption = mongoose.model(
  "TravelOption",
  travelOptionSchema
);