import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  adminName:{
    type: String,
    required: [true, "admin name must be required"]
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
  },
  contactNumber: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  role: {
    type: String,
    enum: ["super_admin", "admin"],
    default: "admin",
  },
  avatar: {
    type: String,
    require: true,
  },
  isVerified:{
    type: Boolean,
    default: false
  },
  isLoggedIn:{
    type: Boolean,
    default: false
  },
  token:{
   type: String,
   default: null
  },
  otp:{
    type: String,
    default: null
  },
  expOTP:{
   type: Date,
   default: null
  }
},{timestamps: true})

export const Admin = mongoose.model("Admin", adminSchema)