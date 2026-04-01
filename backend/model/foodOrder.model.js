import mongoose from "mongoose";

const foodOrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
        food: {
          id: { type: String, required: true },
          name: { type: String, required: true },
          price: { type: Number, required: true },
          quantity: { type: Number, required: true },
          image: { type: String },
        },
        notes: { type: String, default: "" },
      },
    ],
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ["online", "cod"], default: "cod" },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "preparing",
        "assigned",
        "accepted_by_delivery_boy",
        "out_for_delivery",
        "delivered",
        "failed",
        "cancelled"
      ],
      default: "pending",
    },
    deliveryAddress: {
      name: { type: String },
      street: { type: String },
      city: { type: String },
      pincode: { type: String },
      location: { type: { type: String }, coordinates: [Number] }, // GeoJSON
    },
    restaurantInfo: {
      name: String,
      phone: String,
      address: String,
    },
    deliveryBoy: { type: mongoose.Schema.Types.ObjectId, ref: "DeliveryBoy" },
    assignedAt: Date,

    cancelReason: { type: String },
    cancelledAt: { type: Date },
    isSynced: { type: Boolean, default: true }, // offline orders use false until synced
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  
  { timestamps: true }
);

foodOrderSchema.index({ "deliveryAddress.location": "2dsphere" });

export const FoodOrder = mongoose.models.FoodOrder || mongoose.model("FoodOrder", foodOrderSchema);
