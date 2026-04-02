import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    method: {
      type: String,
      enum: ["upi", "card", "netbanking"],
    },
    baseAmount: { type: Number }, // before coupon
    discountAmount: { type: Number, default: 0 },
    finalAmount: { type: Number },
    // after coupon
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    status: {
      type: String,
      enum: ["pending", "initiated", "captured", "failed"],
      default: "pending",
    },
    paidAt: { type: Date },
  },
  { _id: false },
);

const couponSchema = new mongoose.Schema(
  {
    code: { type: String },
    discountPct: { type: Number }, // e.g. 50 means 50 %
    discountAmt: { type: Number }, // computed rupee value
  },
  { _id: false },
);

const otpSchema = new mongoose.Schema(
  {
    code: { type: String },
    expiresAt: { type: Date },
    attempts: { type: Number, default: 0 }, // rate-limit brute force
  },
  { _id: false },
);

const bookingSchema = new mongoose.Schema(
  {
    refNo: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },

    // ── Contact details ──────────────────────────────────────────────────
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    note: { type: String, trim: true, default: "" },

    // ── Flow state ───────────────────────────────────────────────────────
    status: {
      type: String,
      enum: [
        "pending_otp", // details saved, OTP not yet verified
        "otp_verified", // phone/email confirmed
        "payment_initiated", // Razorpay order created
        "confirmed", // payment captured, booking locked
        "cancelled",
      ],
      default: "pending_otp",
    },

    phoneVerified: { type: Boolean, default: false },

    // ── OTP (transient, cleared after verification) ──────────────────────
    otp: { type: otpSchema, default: null },

    // ── Coupon ───────────────────────────────────────────────────────────
    coupon: { type: couponSchema, default: null },

    // ── Payment ──────────────────────────────────────────────────────────
    payment: { type: paymentSchema, default: null },

    confirmedAt: { type: Date },
  },
  { timestamps: true },
);

export const Booking = mongoose.model("Booking", bookingSchema);
