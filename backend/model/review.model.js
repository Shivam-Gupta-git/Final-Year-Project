import mongoose, { Schema } from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    //when User model is make

    targetType: {
      type: String,
      enum: ["city", "place", "hotel", "restaurant"],
      required: true,
    },

    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "targetType",
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    approvedBy : {
      type : mongoose.Schema.Types.ObjectId,
      ref : "User"
    },

    createdBy : {
      type : mongoose.Schema.Types.ObjectId,
      ref : "User"
    },
  },
  { timestamps: true }
);

export const Review = mongoose.model("Review", reviewSchema);
