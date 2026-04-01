import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  saveDetails,
  sendOtp,
  verifyOtp,
  applyCoupon,
  initiatePayment,
  confirmBooking,
  resetBooking,
  clearError,
  selectRefNo,
  selectCoupon,
  selectFinalAmount,
  selectLoading,
  selectLoadingMsg,
  selectError,
  selectConfirmed,
} from "../../features/user/bookingSlice";

// ─── Razorpay script loader (loads once, idempotent) ─────────────────────────
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) return resolve(true);
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function validate(form) {
  const errs = {};
  if (!form.name.trim()) errs.name = "Name is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errs.email = "Enter a valid email";
  if (!/^\+?[\d\s\-]{10,}$/.test(form.phone))
    errs.phone = "Enter a valid phone number";
  return errs;
}

const BASE_AMOUNT = Number(import.meta.env.VITE_BASE_AMOUNT) || 999;

// ══════════════════════════════════════════════════════════════════════════════
export default function BookingFlow() {
  const dispatch = useDispatch();

  // ── Redux (server / async state) ─────────────────────────────────────────
  const refNo = useSelector(selectRefNo);
  const coupon = useSelector(selectCoupon);
  const finalAmount = useSelector(selectFinalAmount) ?? BASE_AMOUNT;
  const loading = useSelector(selectLoading);
  const loadingMsg = useSelector(selectLoadingMsg);
  const apiError = useSelector(selectError);
  const confirmed = useSelector(selectConfirmed);

  // ── Local (pure UI state, no API involvement) ────────────────────────────
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    note: "",
  });
  const [formErrs, setFormErrs] = useState({});
  const [couponInput, setCouponInput] = useState("");
  const [couponMsg, setCouponMsg] = useState(null);
  const [payMethod, setPayMethod] = useState("upi");
  const [upiId, setUpiId] = useState("");
  const [cardNo, setCardNo] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);

  const otpRefs = useRef([]);
  const stepLabels = ["Details", "Verify", "Payment", "Confirm"];

  const canNext3 =
    payMethod === "upi"
      ? upiId.includes("@")
      : payMethod === "card"
        ? cardNo.length >= 16 && cardExp && cardCvv.length >= 3
        : true;

  // ── OTP countdown ────────────────────────────────────────────────────────
  useEffect(() => {
    if (otpTimer > 0) {
      const t = setTimeout(() => setOtpTimer((v) => v - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [otpTimer]);

  // ── Clear Redux error when user edits the form ────────────────────────────
  useEffect(() => {
    if (apiError) dispatch(clearError());
  }, [form]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Step 1 → 2: save details + trigger OTP ───────────────────────────────
  const handleNext1 = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length) {
      setFormErrs(errs);
      return;
    }
    setFormErrs({});

    // a) Persist contact details, receive refNo
    const detailsRes = await dispatch(saveDetails(form));
    if (saveDetails.rejected.match(detailsRes)) return; // apiError shown in UI

    // b) Immediately send OTP using the new refNo
    const otpRes = await dispatch(sendOtp({ refNo: detailsRes.payload.refNo }));
    if (sendOtp.rejected.match(otpRes)) return;

    setOtpTimer(30);
    setStep(2);
  };

  // ── Resend OTP ────────────────────────────────────────────────────────────
  const handleResendOtp = async () => {
    if (!refNo) return;
    const res = await dispatch(sendOtp(refNo));
    if (sendOtp.fulfilled.match(res)) setOtpTimer(30);
  };

  // ── OTP box change + auto-focus next ─────────────────────────────────────
  const handleOtpChange = (i, v) => {
    if (!/^\d?$/.test(v)) return;
    const next = [...otp];
    next[i] = v;
    setOtp(next);
    if (v && i < 5) otpRefs.current[i + 1]?.focus();
  };

  // ── Verify OTP ────────────────────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    const res = await dispatch(verifyOtp({ refNo, otp: otp.join("") }));
    if (verifyOtp.fulfilled.match(res)) {
      setOtpVerified(true);
      setOtpError("");
    } else {
      setOtpError(res.payload || "Invalid OTP. Please try again.");
    }
  };

  // ── Apply coupon ──────────────────────────────────────────────────────────
  const handleApplyCoupon = async () => {
    const res = await dispatch(applyCoupon({ refNo, code: couponInput }));
    if (applyCoupon.fulfilled.match(res)) {
      setCouponMsg({
        ok: true,
        text: `${res.payload.coupon.discountPct}% discount applied!`,
      });
    } else {
      setCouponMsg({ ok: false, text: res.payload || "Invalid coupon code." });
    }
  };

  // ── Pay (Step 4 confirm button) ───────────────────────────────────────────
  const handlePay = async () => {
    // 1. Ensure Razorpay SDK is loaded
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      alert("Failed to load payment gateway. Please check your connection.");
      return;
    }

    // 2. Create Razorpay order on the backend
    const orderRes = await dispatch(
      initiatePayment({ refNo, method: payMethod }),
    );
    if (initiatePayment.rejected.match(orderRes)) return;

    const { orderId, amountPaise, currency, key, name, email, phone } =
      orderRes.payload;

    // 3. Open Razorpay checkout modal
    const rzp = new window.Razorpay({
      key,
      amount: amountPaise,
      currency,
      name: "Your Business Name", // ← replace with your brand name
      order_id: orderId,
      prefill: { name, email, contact: phone },
      theme: { color: "#c8855a" },

      // 4. Payment success → verify signature + confirm booking
      handler: async (response) => {
        const confirmRes = await dispatch(
          confirmBooking({
            refNo,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          }),
        );
        if (confirmBooking.rejected.match(confirmRes)) {
          alert(
            `Payment received but confirmation failed.\nPlease contact support with ref: ${refNo}`,
          );
        }
        // On success: Redux sets confirmed = true → success screen renders automatically
      },

      modal: {
        ondismiss: () => console.log("Razorpay modal closed by user."),
      },
    });

    rzp.on("payment.failed", (r) => {
      alert(`Payment failed: ${r.error.description}`);
    });

    rzp.open();
  };

  // ── Full reset ────────────────────────────────────────────────────────────
  const handleReset = () => {
    dispatch(resetBooking());
    setStep(1);
    setForm({ name: "", email: "", phone: "", note: "" });
    setFormErrs({});
    setCouponInput("");
    setCouponMsg(null);
    setPayMethod("upi");
    setUpiId("");
    setCardNo("");
    setCardExp("");
    setCardCvv("");
    setOtp(["", "", "", "", "", ""]);
    setOtpVerified(false);
    setOtpError("");
  };

  // ── Styles ────────────────────────────────────────────────────────────────
  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    .root{min-height:100vh;background:#f5f4f1;font-family:'Plus Jakarta Sans',sans-serif;display:flex;align-items:flex-start;justify-content:center;padding:40px 16px;}
    .card{background:#ffffff;border:1px solid #e8e4de;border-radius:16px;width:100%;max-width:600px;box-shadow:0 2px 24px rgba(0,0,0,.06);animation:fadeUp .4s ease;overflow:hidden;}
    @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
    .card-header{padding:28px 32px 22px;border-bottom:1px solid #f0ede8;display:flex;align-items:center;gap:14px;background:#fff;}
    .back-btn{background:#f5f4f1;border:1px solid #e8e4de;color:#6b6560;cursor:pointer;padding:7px 12px;font-family:'Plus Jakarta Sans',sans-serif;font-size:12px;font-weight:500;border-radius:8px;transition:all .2s;white-space:nowrap;}
    .back-btn:hover{background:#eceae5;color:#333;}
    .htext{flex:1;}
    .htitle{font-family:'Instrument Serif',serif;font-size:24px;font-weight:400;color:#1a1714;letter-spacing:-.01em;}
    .hsub{font-size:11px;color:#a09890;margin-top:3px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;}
    .stepper{display:flex;align-items:center;padding:0 32px;border-bottom:1px solid #f0ede8;background:#faf9f7;overflow-x:auto;height:52px;}
    .stepper::-webkit-scrollbar{display:none;}
    .sitem{display:flex;align-items:center;gap:7px;flex-shrink:0;}
    .sdot{width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:600;border:1.5px solid #ddd;color:#bbb;transition:all .3s;flex-shrink:0;}
    .sdot.active{border-color:#c8855a;color:#c8855a;background:#fdf2ec;}
    .sdot.done{border-color:#c8855a;background:#c8855a;color:#fff;}
    .slabel{font-size:10px;color:#bbb;letter-spacing:.05em;font-weight:500;text-transform:uppercase;}
    .slabel.active{color:#c8855a;}
    .slabel.done{color:#c8855a;opacity:.7;}
    .sline{flex:1;height:1px;background:#e8e4de;margin:0 8px;min-width:12px;}
    .sline.done{background:#c8855a;opacity:.4;}
    .body{padding:28px 32px;}
    .sec-label{font-size:11px;color:#a09890;letter-spacing:.08em;text-transform:uppercase;font-weight:600;margin-bottom:14px;}
    .api-error{font-size:12px;color:#ef4444;font-weight:600;background:#fff5f5;border:1px solid #fecaca;border-radius:8px;padding:10px 14px;margin-bottom:14px;}
    .form-group{margin-bottom:16px;}
    .form-label{font-size:11px;color:#6b6560;letter-spacing:.06em;text-transform:uppercase;font-weight:600;margin-bottom:7px;display:block;}
    .form-input{width:100%;background:#faf9f7;border:1.5px solid #ede9e3;border-radius:10px;padding:11px 14px;color:#1a1714;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;font-weight:500;outline:none;transition:all .2s;}
    .form-input:focus{border-color:#c8855a;background:#fff;box-shadow:0 0 0 3px rgba(200,133,90,.1);}
    .form-input::placeholder{color:#c8c3bc;font-weight:400;}
    .form-input.err{border-color:#ef4444;background:#fff5f5;}
    .err-msg{font-size:11px;color:#ef4444;margin-top:5px;font-weight:500;}
    .form-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
    textarea.form-input{resize:none;height:80px;}
    .otp-wrap{display:flex;justify-content:center;gap:10px;margin:24px 0;}
    .otp-input{width:46px;height:54px;text-align:center;background:#faf9f7;border:1.5px solid #ede9e3;border-radius:10px;color:#1a1714;font-family:'Instrument Serif',serif;font-size:26px;outline:none;transition:all .2s;}
    .otp-input:focus{border-color:#c8855a;background:#fff;box-shadow:0 0 0 3px rgba(200,133,90,.1);}
    .otp-input.filled{border-color:#c8855a;background:#fdf5ef;color:#c8855a;}
    .otp-err{text-align:center;font-size:12px;color:#ef4444;margin-top:6px;font-weight:500;}
    .otp-verified{text-align:center;padding:16px;border:1.5px solid #bbf7d0;background:#f0fdf4;border-radius:10px;color:#15803d;font-size:12px;font-weight:600;letter-spacing:.06em;}
    .resend-btn{background:none;border:none;color:#c8855a;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;font-size:12px;font-weight:600;text-decoration:underline;margin-top:10px;}
    .resend-btn:disabled{opacity:.4;cursor:not-allowed;text-decoration:none;}
    .pay-methods{display:flex;gap:8px;margin-bottom:20px;}
    .pay-tab{flex:1;padding:10px;border:1.5px solid #ede9e3;border-radius:8px;background:#fff;color:#6b6560;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;transition:all .2s;}
    .pay-tab:hover{border-color:#d4a882;background:#fdf9f6;}
    .pay-tab.sel{border-color:#c8855a;background:#fdf5ef;color:#c8855a;box-shadow:0 0 0 3px rgba(200,133,90,.1);}
    .coupon-row{display:flex;gap:8px;margin-bottom:8px;}
    .coupon-input{flex:1;background:#faf9f7;border:1.5px solid #ede9e3;border-radius:10px;padding:10px 14px;color:#1a1714;font-family:'Plus Jakarta Sans',sans-serif;font-size:12px;font-weight:600;outline:none;text-transform:uppercase;transition:all .2s;}
    .coupon-input:focus{border-color:#c8855a;background:#fff;box-shadow:0 0 0 3px rgba(200,133,90,.1);}
    .coupon-input::placeholder{text-transform:none;font-weight:400;color:#c8c3bc;}
    .coupon-btn{background:#c8855a;border:none;color:#fff;cursor:pointer;padding:10px 18px;font-family:'Plus Jakarta Sans',sans-serif;font-size:11px;font-weight:700;border-radius:10px;letter-spacing:.06em;text-transform:uppercase;transition:all .2s;}
    .coupon-btn:hover{background:#b5744a;}
    .coupon-ok{font-size:11px;color:#16a34a;font-weight:600;margin-bottom:14px;}
    .coupon-no{font-size:11px;color:#ef4444;font-weight:600;margin-bottom:14px;}
    .price-box{background:#faf9f7;border:1.5px solid #ede9e3;border-radius:12px;padding:16px 18px;margin-bottom:18px;}
    .prow{display:flex;justify-content:space-between;align-items:center;padding:6px 0;}
    .prow+.prow{border-top:1px solid #f0ede8;}
    .pkey{font-size:12px;color:#9a9490;font-weight:500;}
    .pval{font-size:13px;color:#1a1714;font-weight:600;}
    .pval.disc{color:#16a34a;}
    .pval.total{color:#c8855a;font-size:17px;font-weight:700;}
    .sum-box{background:#faf9f7;border:1.5px solid #ede9e3;border-radius:12px;padding:20px;margin-bottom:20px;}
    .sum-title{font-family:'Instrument Serif',serif;font-size:20px;color:#1a1714;margin-bottom:16px;}
    .srow{display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid #f0ede8;}
    .srow:last-child{border-bottom:none;}
    .skey{font-size:11px;color:#9a9490;font-weight:600;text-transform:uppercase;letter-spacing:.06em;}
    .sval{font-size:13px;color:#1a1714;font-weight:600;}
    .sval.amber{color:#c8855a;font-size:17px;font-weight:700;}
    .btn-row{display:flex;gap:10px;margin-top:24px;}
    .btn-primary{flex:1;padding:14px;background:#c8855a;border:none;border-radius:10px;color:#fff;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;font-weight:700;letter-spacing:.04em;cursor:pointer;transition:all .2s;box-shadow:0 2px 12px rgba(200,133,90,.25);}
    .btn-primary:hover{background:#b5744a;box-shadow:0 4px 16px rgba(200,133,90,.35);}
    .btn-primary:disabled{opacity:.35;cursor:not-allowed;box-shadow:none;}
    .btn-ghost{padding:14px 20px;background:#fff;border:1.5px solid #ede9e3;border-radius:10px;color:#6b6560;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;}
    .btn-ghost:hover{border-color:#c8855a;color:#c8855a;}
    .loading-overlay{position:fixed;inset:0;background:rgba(250,249,247,.9);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:100;}
    .spinner{width:36px;height:36px;border:2px solid #ede9e3;border-top-color:#c8855a;border-radius:50%;animation:spin .7s linear infinite;}
    @keyframes spin{to{transform:rotate(360deg)}}
    .loading-text{font-size:13px;color:#9a9490;margin-top:16px;font-weight:500;}
    .success-wrap{text-align:center;padding:20px 0;}
    .success-icon{width:72px;height:72px;border-radius:50%;background:#fdf5ef;border:2px solid #c8855a;display:flex;align-items:center;justify-content:center;margin:0 auto 24px;font-size:28px;color:#c8855a;animation:pulse 1.8s ease infinite;}
    @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(200,133,90,.25)}50%{box-shadow:0 0 0 14px rgba(200,133,90,0)}}
    .success-title{font-family:'Instrument Serif',serif;font-size:32px;color:#1a1714;margin-bottom:6px;}
    .success-sub{font-size:12px;color:#9a9490;font-weight:500;margin-bottom:28px;}
    .ref-box{display:inline-block;background:#faf9f7;border:1.5px solid #ede9e3;border-radius:12px;padding:14px 28px;}
    .ref-label{font-size:10px;color:#b0aaa4;text-transform:uppercase;letter-spacing:.1em;font-weight:600;margin-bottom:4px;}
    .ref-num{font-size:16px;color:#c8855a;font-weight:700;letter-spacing:.12em;}
    .success-details{margin-top:20px;font-size:13px;color:#9a9490;line-height:1.9;font-weight:500;}
    .success-paid{color:#16a34a;font-weight:600;}
    .new-btn{margin-top:24px;background:#fff;border:1.5px solid #ede9e3;color:#6b6560;padding:10px 24px;border-radius:10px;font-family:'Plus Jakarta Sans',sans-serif;font-size:12px;font-weight:600;cursor:pointer;transition:all .2s;}
    .new-btn:hover{border-color:#c8855a;color:#c8855a;}
    .hint{font-size:11px;color:#b0aaa4;margin-top:6px;font-weight:400;}
    .bank-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px;}
    .bank-btn{padding:10px;border:1.5px solid #ede9e3;border-radius:8px;background:#fff;color:#6b6560;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;font-size:11px;font-weight:600;transition:all .2s;}
    .bank-btn:hover{border-color:#d4a882;background:#fdf9f6;color:#c8855a;}
  `;

  // ── Success screen ─────────────────────────────────────────────────────────
  if (confirmed)
    return (
      <>
        <style>{styles}</style>
        <div className="root">
          <div className="card">
            <div className="body">
              <div className="success-wrap">
                <div className="success-icon">✓</div>
                <div className="success-title">Booking Confirmed!</div>
                <div className="success-sub">
                  Confirmation sent to {form.email}
                </div>
                <div className="ref-box">
                  <div className="ref-label">Reference Number</div>
                  <div className="ref-num">{refNo}</div>
                </div>
                <div className="success-details">
                  <div>{form.name}</div>
                  <div className="success-paid">
                    ₹{finalAmount.toLocaleString("en-IN")} paid via{" "}
                    {payMethod === "upi"
                      ? "UPI"
                      : payMethod === "card"
                        ? "Card"
                        : "Net Banking"}
                  </div>
                </div>
                <button className="new-btn" onClick={handleReset}>
                  + Make Another Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );

  // ── Main flow ──────────────────────────────────────────────────────────────
  return (
    <>
      <style>{styles}</style>

      {loading && (
        <div className="loading-overlay">
          <div className="spinner" />
          <div className="loading-text">{loadingMsg}</div>
        </div>
      )}

      <div className="root">
        <div className="card">
          <div className="card-header">
            {step > 1 && (
              <button
                className="back-btn"
                onClick={() => setStep((s) => s - 1)}
              >
                ← Back
              </button>
            )}
            <div className="htext">
              <div className="htitle">
                {step === 1 && "Your Details"}
                {step === 2 && "Verify Phone"}
                {step === 3 && "Payment"}
                {step === 4 && "Review & Confirm"}
              </div>
              <div className="hsub">
                Step {step} of 4 — {stepLabels[step - 1]}
              </div>
            </div>
          </div>

          <div className="stepper">
            {stepLabels.map((label, i) => (
              <React.Fragment key={i}>
                <div className="sitem">
                  <div
                    className={`sdot ${step === i + 1 ? "active" : step > i + 1 ? "done" : ""}`}
                  >
                    {step > i + 1 ? "✓" : i + 1}
                  </div>
                  <div
                    className={`slabel ${step === i + 1 ? "active" : step > i + 1 ? "done" : ""}`}
                  >
                    {label}
                  </div>
                </div>
                {i < 3 && (
                  <div className={`sline ${step > i + 1 ? "done" : ""}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="body">
            {/* Step 1 — Details */}
            {step === 1 && (
              <>
                {apiError && <div className="api-error">⚠ {apiError}</div>}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      className={`form-input ${formErrs.name ? "err" : ""}`}
                      placeholder="Your name"
                      value={form.name}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, name: e.target.value }))
                      }
                    />
                    {formErrs.name && (
                      <div className="err-msg">{formErrs.name}</div>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input
                      className={`form-input ${formErrs.phone ? "err" : ""}`}
                      placeholder="+91 00000 00000"
                      value={form.phone}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, phone: e.target.value }))
                      }
                    />
                    {formErrs.phone && (
                      <div className="err-msg">{formErrs.phone}</div>
                    )}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    className={`form-input ${formErrs.email ? "err" : ""}`}
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, email: e.target.value }))
                    }
                  />
                  {formErrs.email && (
                    <div className="err-msg">{formErrs.email}</div>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Special Note (optional)</label>
                  <textarea
                    className="form-input"
                    placeholder="Any specific requirements..."
                    value={form.note}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, note: e.target.value }))
                    }
                  />
                </div>
                <div className="btn-row">
                  <button
                    className="btn-primary"
                    onClick={handleNext1}
                    disabled={loading}
                  >
                    Send OTP & Continue →
                  </button>
                </div>
              </>
            )}

            {/* Step 2 — Verify */}
            {step === 2 && (
              <>
                <div style={{ textAlign: "center", marginBottom: 4 }}>
                  <div
                    style={{ fontSize: 13, color: "#6b6560", fontWeight: 500 }}
                  >
                    OTP sent to{" "}
                    <span style={{ color: "#c8855a", fontWeight: 700 }}>
                      {form.email}
                    </span>
                  </div>
                </div>
                {apiError && <div className="api-error">⚠ {apiError}</div>}

                {otpVerified ? (
                  <div className="otp-verified">✓ Verified successfully</div>
                ) : (
                  <>
                    <div className="otp-wrap">
                      {otp.map((v, i) => (
                        <input
                          key={i}
                          ref={(el) => (otpRefs.current[i] = el)}
                          className={`otp-input ${v ? "filled" : ""}`}
                          maxLength={1}
                          value={v}
                          onChange={(e) => handleOtpChange(i, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Backspace" && !v && i > 0)
                              otpRefs.current[i - 1]?.focus();
                          }}
                        />
                      ))}
                    </div>
                    {otpError && <div className="otp-err">{otpError}</div>}
                    <div style={{ textAlign: "center" }}>
                      <button
                        className="resend-btn"
                        disabled={otpTimer > 0 || loading}
                        onClick={handleResendOtp}
                      >
                        {otpTimer > 0 ? `Resend in ${otpTimer}s` : "Resend OTP"}
                      </button>
                    </div>
                  </>
                )}

                <div className="btn-row">
                  {!otpVerified && (
                    <button
                      className="btn-ghost"
                      onClick={handleVerifyOtp}
                      disabled={otp.join("").length < 6 || loading}
                    >
                      Verify OTP
                    </button>
                  )}
                  <button
                    className="btn-primary"
                    disabled={!otpVerified}
                    onClick={() => setStep(3)}
                  >
                    {otpVerified
                      ? "Proceed to Payment →"
                      : "Awaiting Verification"}
                  </button>
                </div>
              </>
            )}

            {/* Step 3 — Payment */}
            {step === 3 && (
              <>
                <div className="price-box">
                  <div className="prow">
                    <span className="pkey">Amount</span>
                    <span className="pval">
                      ₹{BASE_AMOUNT.toLocaleString("en-IN")}
                    </span>
                  </div>
                  {coupon && (
                    <div className="prow">
                      <span className="pkey">Discount ({coupon.code})</span>
                      <span className="pval disc">
                        −₹{coupon.discountAmt.toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}
                  <div className="prow">
                    <span className="pkey">Total Payable</span>
                    <span className="pval total">
                      ₹{finalAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <div className="sec-label">Promo Code</div>
                <div className="coupon-row">
                  <input
                    className="coupon-input"
                    placeholder="Enter promo code"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                  />
                  <button
                    className="coupon-btn"
                    onClick={handleApplyCoupon}
                    disabled={loading}
                  >
                    Apply
                  </button>
                </div>
                {couponMsg && (
                  <div className={couponMsg.ok ? "coupon-ok" : "coupon-no"}>
                    {couponMsg.ok ? "✓ " : "✗ "}
                    {couponMsg.text}
                  </div>
                )}

                <div className="sec-label" style={{ marginTop: 4 }}>
                  Payment Method
                </div>
                <div className="pay-methods">
                  {["upi", "card", "netbanking"].map((m) => (
                    <button
                      key={m}
                      className={`pay-tab ${payMethod === m ? "sel" : ""}`}
                      onClick={() => setPayMethod(m)}
                    >
                      {m === "upi"
                        ? "UPI"
                        : m === "card"
                          ? "Card"
                          : "Net Banking"}
                    </button>
                  ))}
                </div>

                {payMethod === "upi" && (
                  <div className="form-group">
                    <label className="form-label">UPI ID</label>
                    <input
                      className="form-input"
                      placeholder="yourname@upi"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                    />
                    <div className="hint">
                      e.g. name@okaxis · name@paytm · name@ybl
                    </div>
                  </div>
                )}

                {payMethod === "card" && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Card Number</label>
                      <input
                        className="form-input"
                        placeholder="0000 0000 0000 0000"
                        maxLength={19}
                        value={cardNo.replace(/(\d{4})(?=\d)/g, "$1 ")}
                        onChange={(e) =>
                          setCardNo(
                            e.target.value.replace(/\D/g, "").slice(0, 16),
                          )
                        }
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Expiry</label>
                        <input
                          className="form-input"
                          placeholder="MM / YY"
                          maxLength={5}
                          value={cardExp}
                          onChange={(e) => {
                            let v = e.target.value.replace(/\D/g, "");
                            if (v.length >= 2)
                              v = v.slice(0, 2) + "/" + v.slice(2, 4);
                            setCardExp(v);
                          }}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">CVV</label>
                        <input
                          className="form-input"
                          placeholder="•••"
                          maxLength={4}
                          type="password"
                          value={cardCvv}
                          onChange={(e) =>
                            setCardCvv(e.target.value.replace(/\D/g, ""))
                          }
                        />
                      </div>
                    </div>
                  </>
                )}

                {payMethod === "netbanking" && (
                  <div className="bank-grid">
                    {["SBI", "HDFC", "ICICI", "Axis", "Kotak", "Others"].map(
                      (b) => (
                        <button key={b} className="bank-btn">
                          {b}
                        </button>
                      ),
                    )}
                  </div>
                )}

                <div className="btn-row">
                  <button
                    className="btn-primary"
                    disabled={!canNext3}
                    onClick={() => setStep(4)}
                  >
                    Review Booking →
                  </button>
                </div>
              </>
            )}

            {/* Step 4 — Confirm */}
            {step === 4 && (
              <>
                {apiError && <div className="api-error">⚠ {apiError}</div>}
                <div className="sum-box">
                  <div className="sum-title">Booking Summary</div>
                  {[
                    ["Name", form.name],
                    ["Email", form.email],
                    ["Contact", form.phone],
                    [
                      "Payment",
                      payMethod === "upi"
                        ? `UPI · ${upiId}`
                        : payMethod === "card"
                          ? `Card ····${cardNo.slice(-4)}`
                          : "Net Banking",
                    ],
                  ].map(([k, v]) => (
                    <div key={k} className="srow">
                      <div className="skey">{k}</div>
                      <div className="sval">{v}</div>
                    </div>
                  ))}
                  {coupon && (
                    <div className="srow">
                      <div className="skey">Coupon</div>
                      <div className="sval" style={{ color: "#16a34a" }}>
                        −₹{coupon.discountAmt.toLocaleString("en-IN")} (
                        {coupon.code})
                      </div>
                    </div>
                  )}
                  <div className="srow">
                    <div className="skey">Total</div>
                    <div className="sval amber">
                      ₹{finalAmount.toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>
                <div className="btn-row">
                  <button
                    className="btn-primary"
                    onClick={handlePay}
                    disabled={loading}
                  >
                    Pay & Confirm Booking
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
