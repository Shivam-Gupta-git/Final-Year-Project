import mongoose, { Schema } from "mongoose";

const hotelSchema = mongoose.Schema({
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

  pricePerNight: {
    type: Number,
    required: true,
  },

  facilities: {
    type: [String],
    default : []
  },

  images: [
    {
      type: String,
    },
  ],

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
      type: [Number],
      required: true,
    },
  },

  isVerified: {
    type: Boolean,
    default: false,
  },

  status: {
    type: String,
    enum: ["active", "inactive", "pending"],
    default: "pending",
  },
});

hotelSchema.index({ location: "2dsphere" });

export const Hotel = mongoose.model("Hotel", hotelSchema);
