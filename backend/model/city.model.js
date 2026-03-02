import mongoose from "mongoose";

const citySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    state: {
      type: String,
      required: true,
    },

    country: {
      type: String,
      default: "India",
    },

    description: {
      type: String,
    },
    famousFor: {
      type: String,
      required: true,
    },

    bestTimeToVisit: {
      type: String,
      required: true,
    },

    avgDailyBudget: {
      type: Number,
      required: true,
    },

    images: [
      {
        type: String,
      },
    ],

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
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

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
  },
  { timestamps: true },
);

//this is required for log/lot location .
citySchema.index({ location: "2dsphere" }, {unique : true});

export const City = mongoose.model("City", citySchema);
