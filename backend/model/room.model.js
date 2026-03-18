import mongoose, { Schema } from "mongoose";

const roomSchema = new Schema(
  {
    hotelId: {
      type: Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
      index: true,
    },

    roomType: {
      type: String,
      required: true,
      enum: ["standard", "deluxe", "suite", "family"],
    },

    pricePerNight: {
      type: Number,
      required: true,
      min: 0,
    },

    capacity: {
      type: Number,
      required: true,
      min: 1,
    },

    totalRooms: {
      type: Number,
      required: true,
      min: 1,
    },

    amenities: {
      type: [String],
      default: [],
    },

    images: [
      {
        type: String,
      },
    ],

    description: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

roomSchema.index({ hotelId: 1, roomType: 1 }, { unique: true });

export const Room = mongoose.model("Room", roomSchema);