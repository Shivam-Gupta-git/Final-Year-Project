import mongoose from "mongoose";

const deliveryBoySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    assignedRestaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      default: null,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },

      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        default: [0, 0],
      },
    },

    fullAddress: {
      type: String,
      trim: true,
      default: "",
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    isOnline: {
      type: Boolean,
      default: false,
    },

    currentOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FoodOrder",
      default: null,
    },

    totalDeliveredOrders: {
      type: Number,
      default: 0,
    },

    lastLocationUpdatedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

deliveryBoySchema.index({ location: "2dsphere" });

export const DeliveryBoy =
  mongoose.models.DeliveryBoy ||
  mongoose.model("DeliveryBoy", deliveryBoySchema);