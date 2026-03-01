import mongoose from "mongoose";

const driverSchema = new mongoose.Schema({
  userId:{
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  vechalType:{
    type: String,
    enum: ['bike', 'car', 'auto'],
    required: true,
  },
  isOnline:{
    type: Boolean,
    default: false
  },
  isOnRide:{
    type: Boolean,
    default: false
  },
  location:{
    type:{
      type: String,
      enum: ["Point"],
      default: "Point"
    },
    coordinates:{
      type:[Number],
      required: true
    }
  },
  rating:{
    type: Number,
    default: 4.0
  }
},{timestamps: true})

driverSchema.index({ location: "2dsphere" })

export const Driver = mongoose.model("Driver", driverSchema)