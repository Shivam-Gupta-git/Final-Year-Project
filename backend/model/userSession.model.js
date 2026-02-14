import mongoose from "mongoose";

const userSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "admin", "super_admin"],
    required: true,
  },
  token: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const UserSession = mongoose.model("UserSession", userSessionSchema);
