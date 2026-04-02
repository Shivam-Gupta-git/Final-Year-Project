/*
 * Install deps:
 *   npm install razorpay crypto
 */
import crypto from "crypto";
import Razorpay from "razorpay";
import { Booking } from "../model/Booking.model.js";
import { sendOtpMail } from "../verifyEmail/sendOtpMail.js";

// ─── Razorpay instance ────────────────────────────────────────────────────────
let _razorpay = null;
function getRazorpay() {
  if (!_razorpay) {
    
    _razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    
    
  }
  return _razorpay;
}

// ─── Coupon table (move to DB if you want dynamic coupons) ───────────────────
const COUPONS = {
  FIRST50: 50,
  SAVE20: 20,
  VIP10: 10,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function generateRefNo() {
  return "BK" + crypto.randomBytes(3).toString("hex").toUpperCase();
}

function generateOtp() {
  // 6-digit numeric OTP
  return String(Math.floor(100000 + Math.random() * 900000));
}

function otpExpiresAt() {
  return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
}

// ══════════════════════════════════════════════════════════════════════════════
// 1. POST /api/booking/details
//    Save contact info → return refNo
// ══════════════════════════════════════════════════════════════════════════════
export const saveDetails = async (req, res) => {
  try {
    const { name, email, phone, note } = req.body;

    const refNo = generateRefNo();
    const booking = await Booking.create({
      refNo,
      name,
      email,
      phone,
      note: note || "",
    });

    return res.status(201).json({
      success: true,
      refNo: booking.refNo,
    });
  } catch (err) {
    console.error("[saveDetails]", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// 2. POST /api/booking/send-otp
//    Body: { refNo }
//    Generates OTP, stores hash, emails it to the booking's email address
// ══════════════════════════════════════════════════════════════════════════════
export const sendOtp = async (req, res) => {
  try {
    const { refNo } = req.body;

    const booking = await Booking.findOne({ refNo });
    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found." });

    if (booking.phoneVerified)
      return res
        .status(400)
        .json({ success: false, message: "Already verified." });

    const otp = generateOtp();

    // Store OTP (plain here; hash it in production: crypto.createHash("sha256").update(otp).digest("hex"))
    booking.otp = { code: otp, expiresAt: otpExpiresAt(), attempts: 0 };
    await booking.save();

    // Send via your existing utility
    await sendOtpMail(booking.email, otp);

    return res.json({
      success: true,
      message: "OTP sent to registered email.",
    });
  } catch (err) {
    console.error("[sendOtp]", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to send OTP." });
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// 3. POST /api/booking/verify-otp
//    Body: { refNo, otp }
// ══════════════════════════════════════════════════════════════════════════════
export const verifyOtp = async (req, res) => {
  try {
    const { refNo, otp } = req.body;

    const booking = await Booking.findOne({ refNo });
    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found." });

    if (booking.phoneVerified)
      return res.json({ success: true, message: "Already verified." });

    const stored = booking.otp;
    if (!stored?.code)
      return res
        .status(400)
        .json({ success: false, message: "No OTP found. Request a new one." });

    // Rate-limit: max 5 attempts
    if (stored.attempts >= 5) {
      booking.otp = null;
      await booking.save();
      return res.status(429).json({
        success: false,
        message: "Too many attempts. Request a new OTP.",
      });
    }

    if (new Date() > stored.expiresAt) {
      booking.otp = null;
      await booking.save();
      return res
        .status(400)
        .json({ success: false, message: "OTP expired. Request a new one." });
    }

    if (stored.code !== String(otp)) {
      booking.otp.attempts += 1;
      await booking.save();
      return res.status(400).json({ success: false, message: "Invalid OTP." });
    }

    // ✓ Valid
    booking.otp = null;
    booking.phoneVerified = true;
    booking.status = "otp_verified";
    await booking.save();

    return res.json({ success: true, message: "Verified successfully." });
  } catch (err) {
    console.error("[verifyOtp]", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// 4. POST /api/booking/apply-coupon
//    Body: { refNo, code }
// ══════════════════════════════════════════════════════════════════════════════
export const applyCoupon = async (req, res) => {
  try {
    const { refNo, code } = req.body;
    const upperCode = String(code).trim().toUpperCase();

    const booking = await Booking.findOne({ refNo });
    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found." });

    const discountPct = COUPONS[upperCode];
    if (!discountPct)
      return res
        .status(400)
        .json({ success: false, message: "Invalid coupon code." });

    const baseAmount = Number(process.env.BASE_AMOUNT) || 999;
    const discountAmt = Math.round((baseAmount * discountPct) / 100);

    booking.coupon = { code: upperCode, discountPct, discountAmt };
    await booking.save();

    return res.json({
      success: true,
      coupon: { code: upperCode, discountPct, discountAmt },
      finalAmount: baseAmount - discountAmt,
    });
  } catch (err) {
    console.error("[applyCoupon]", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// 5. POST /api/booking/initiate-payment
//    Body: { refNo, method }
//    Creates a Razorpay order → returns { orderId, amount, currency, key }
// ══════════════════════════════════════════════════════════════════════════════
export const initiatePayment = async (req, res) => {
  try {
    const { refNo, method } = req.body;

    const booking = await Booking.findOne({ refNo });
    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found." });

    if (!booking.phoneVerified)
      return res
        .status(403)
        .json({ success: false, message: "OTP not verified." });

    const baseAmount = Number(process.env.BASE_AMOUNT) || 999;
    const discountAmt = booking.coupon?.discountAmt || 0;
    const finalAmount = baseAmount - discountAmt;

    // Razorpay expects amount in paise (1 INR = 100 paise)
    const order = await getRazorpay().orders.create({
      amount: finalAmount * 100,
      currency: "INR",
      receipt: refNo,
      notes: { refNo, name: booking.name },
    });

    booking.payment = {
      method,
      baseAmount,
      discountAmount: discountAmt,
      finalAmount,
      razorpayOrderId: order.id,
      status: "initiated",
    };
    booking.status = "payment_initiated";
    await booking.save();

    return res.json({
      success: true,
      orderId: order.id,
      amount: finalAmount, // in INR (for UI display)
      amountPaise: finalAmount * 100, // in paise (for Razorpay SDK)
      currency: "INR",
      key: process.env.RAZORPAY_KEY_ID,
      name: booking.name,
      email: booking.email,
      phone: booking.phone,
    });
  } catch (err) {
    console.error("[initiatePayment]", err);
    return res
      .status(500)
      .json({ success: false, message: "Could not create payment order." });
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// 6. POST /api/booking/confirm
//    Body: { refNo, razorpayOrderId, razorpayPaymentId, razorpaySignature }
//    Verifies Razorpay signature → confirms booking → sends confirmation email
// ══════════════════════════════════════════════════════════════════════════════
export const confirmBooking = async (req, res) => {
  try {
    const { refNo, razorpayOrderId, razorpayPaymentId, razorpaySignature } =
      req.body;

    const booking = await Booking.findOne({ refNo });
    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found." });

    if (booking.status === "confirmed")
      return res.json({ success: true, message: "Already confirmed.", refNo });

    // ── Signature verification (HMAC-SHA256) ──────────────────────────────
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expectedSignature !== razorpaySignature)
      return res
        .status(400)
        .json({ success: false, message: "Payment verification failed." });

    // ── Mark confirmed ─────────────────────────────────────────────────────
    booking.payment.razorpayPaymentId = razorpayPaymentId;
    booking.payment.razorpaySignature = razorpaySignature;
    booking.payment.status = "captured";
    booking.payment.paidAt = new Date();
    booking.status = "confirmed";
    booking.confirmedAt = new Date();
    await booking.save();

    // ── Send confirmation email ────────────────────────────────────────────
    await sendConfirmationMail(booking);

    return res.json({
      success: true,
      message: "Booking confirmed.",
      refNo: booking.refNo,
      booking: safeBooking(booking),
    });
  } catch (err) {
    console.error("[confirmBooking]", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// 7. GET /api/booking/:refNo
//    Fetch booking for receipt / admin
// ══════════════════════════════════════════════════════════════════════════════
export const getBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({ refNo: req.params.refNo });
    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found." });

    return res.json({ success: true, booking: safeBooking(booking) });
  } catch (err) {
    console.error("[getBooking]", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─── Strip internal fields before sending to client ──────────────────────────
function safeBooking(doc) {
  const b = doc.toObject();
  delete b.otp; // never expose OTP
  delete b.payment?.razorpaySignature; // never expose signature
  delete b.__v;
  return b;
}

// ─── Confirmation email (inline, uses nodemailer directly) ───────────────────
async function sendConfirmationMail(booking) {
  // Reuse same transporter pattern as your other utilities
  const nodemailer = (await import("nodemailer")).default;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  const { refNo, name, email, payment } = booking;
  const amount = payment?.finalAmount?.toLocaleString("en-IN") ?? "—";

  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to: email,
    subject: `Booking Confirmed — ${refNo}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;
                  padding:24px;border:1px solid #e5e7eb;border-radius:8px;
                  background:#f9fafb;">
        <h2 style="color:#111827;text-align:center;">Booking Confirmed ✓</h2>
        <p style="color:#374151;font-size:14px;">Hello <b>${name}</b>,</p>
        <p style="color:#374151;font-size:14px;">
          Your booking has been confirmed. Here are your details:
        </p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;">
          <tr>
            <td style="padding:8px 0;color:#6b7280;width:40%;">Reference No.</td>
            <td style="padding:8px 0;color:#111827;font-weight:bold;">${refNo}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#6b7280;">Amount Paid</td>
            <td style="padding:8px 0;color:#111827;font-weight:bold;">₹${amount}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#6b7280;">Payment Method</td>
            <td style="padding:8px 0;color:#111827;text-transform:uppercase;">${payment?.method ?? "—"}</td>
          </tr>
        </table>
        <p style="color:#9ca3af;font-size:12px;text-align:center;margin-top:24px;">
          If you have any questions, reply to this email.
        </p>
      </div>
    `,
  });
}
