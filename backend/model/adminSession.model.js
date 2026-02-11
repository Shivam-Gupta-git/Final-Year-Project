import mongoose from "mongoose";

const adminSessionSchema = new mongoose.Schema({
  adminId:{
    type : mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
})

export const AdminSession = mongoose.model("AdminSession", adminSessionSchema)