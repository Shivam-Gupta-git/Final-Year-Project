// models/DeliveryBoy.model.js
import mongoose from "mongoose";

const deliveryBoySchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
  },
  isAvailable: { type: Boolean, default: true },
});

deliveryBoySchema.index({ location: "2dsphere" });

export const DeliveryBoy = mongoose.models.DeliveryBoy || mongoose.model("DeliveryBoy", deliveryBoySchema);