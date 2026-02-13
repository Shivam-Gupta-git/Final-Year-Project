import mongoose from "mongoose";

const userSessionSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

export const UserSession = mongoose.model("UserSession", userSessionSchema);
