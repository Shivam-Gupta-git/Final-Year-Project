import express from "express";
import {
  applyCoupon,
  confirmBooking,
  getBooking,
  initiatePayment,
  saveDetails,
  sendOtp,
  verifyOtp,
} from "../controllers/Booking.controller.js";
import { authorize, isAuthenticated } from "../middleware/auth.middleware.js";
import { body, param, validationResult } from "express-validator";

const BookingRouter = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(422).json({ success: false, errors: errors.array() });
  next();
};

//public routers

//details
BookingRouter.post(
  "/details",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email required"),
    body("phone")
      .matches(/^\+?[\d\s\-]{10,}$/)
      .withMessage("Valid phone number required"),
    body("note").optional().trim(),
  ],
  validate,
  saveDetails,
);

// POST /api/booking/send-otp
BookingRouter.post(
  "/send-otp",
  [body("refNo").notEmpty().withMessage("refNo is required")],
  validate,
  sendOtp,
);

// POST /api/booking/verify-otp
BookingRouter.post(
  "/verify-otp",
  [
    body("refNo").notEmpty().withMessage("refNo is required"),
    body("otp")
      .isLength({ min: 6, max: 6 })
      .isNumeric()
      .withMessage("OTP must be exactly 6 digits"),
  ],
  validate,
  verifyOtp,
);

// POST /api/booking/apply-coupon
BookingRouter.post(
  "/apply-coupon",
  [
    body("refNo").notEmpty().withMessage("refNo is required"),
    body("code").trim().notEmpty().withMessage("Coupon code is required"),
  ],
  validate,
  applyCoupon,
);

// POST /api/booking/initiate-payment
BookingRouter.post(
  "/initiate-payment",
  [
    body("refNo").notEmpty().withMessage("refNo is required"),
    body("method")
      .isIn(["upi", "card", "netbanking"])
      .withMessage("method must be upi | card | netbanking"),
  ],
  validate,
  initiatePayment,
);

// POST /api/booking/confirm  (called after Razorpay payment success on the frontend)
BookingRouter.post(
  "/confirm",
  [
    body("refNo").notEmpty().withMessage("refNo is required"),
    body("razorpayOrderId")
      .notEmpty()
      .withMessage("razorpayOrderId is required"),
    body("razorpayPaymentId")
      .notEmpty()
      .withMessage("razorpayPaymentId is required"),
    body("razorpaySignature")
      .notEmpty()
      .withMessage("razorpaySignature is required"),
  ],
  validate,
  confirmBooking,
);

//  PROTECTED routes  (admin / staff only)
// ══════════════════════════════════════════════════════════════════════════════

// GET /api/booking/:refNo  — only logged-in admins can look up any booking
BookingRouter.get(
  "/:refNo",
  isAuthenticated,
  authorize("admin"), // change "admin" to match your User model's role value
  [
    param("refNo")
      .matches(/^BK[A-F0-9]{6}$/i)
      .withMessage("Invalid reference number format"),
  ],
  validate,
  getBooking,
);

export default BookingRouter;
