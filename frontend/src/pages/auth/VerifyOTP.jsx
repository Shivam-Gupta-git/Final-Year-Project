import axios from "axios";
import React, { useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { IoReload } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { verifyOtp } from "../../features/auth/authSlice";

function VerifyOTP() {

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isVerified, setIsVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const inputRefs = useRef([]);
  const { email } = useParams();
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error } = useSelector((state) => state.auth)

  const handelChange = (index, value) => {
    if (value.length > 1) return;
    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handelVerify = async (event) => {
    event.preventDefault();

    const finalOtp = otp.join("");
    if (finalOtp.length !== 6) {
      setErrorMessage("Please enter a valid 6-digit code.");
      return;
    }

    try {
      const result = await dispatch(verifyOtp({email, otp: finalOtp})).unwrap()
      if(result.success){
        navigate(`/change-password/${email}`)
      }
    } catch (error) {
      console.log(error)
    }
  };

  const clearOtp = () => {
    setOtp(["", "", "", "", "", ""]);
    setErrorMessage("");
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-white max-w-md w-full p-8 rounded-3xl shadow-xl flex flex-col gap-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-indigo-700">
            Verify Your Email
          </h1>
          <p className="mt-2 text-gray-600">
            Enter the 6-digit code sent to your email to verify your account.
          </p>
        </div>

        {/* Status / Instructions */}
        {isVerified ? (
          <div className="text-center text-green-600 font-semibold">
            ✅ Verification successful! Redirecting...
          </div>
        ) : (
          <div className="text-center text-gray-700 font-medium">
            Enter the 6-digit code below
          </div>
        )}

        {/* OTP Inputs */}
        {!isVerified && (
          <div className="flex justify-center gap-3 mt-4">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handelChange(index, e.target.value)}
                ref={(el) => (inputRefs.current[index] = el)}
                id={`otp-${index}`}
                className="w-12 h-12 text-center text-xl border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
              />
            ))}
          </div>
        )}

        {/* Buttons */}
        {!isVerified && (
          <button
            onClick={handelVerify}
            disabled={loading || otp.some((digit) => digit === "")}
            className="mt-6 w-full py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify Code"}
          </button>
        )}

        {/* Clear OTP */}
        <button
          onClick={clearOtp}
          disabled={loading || isVerified}
          className="w-full py-2 text-black border border-gray-400 duration-300 font-medium rounded-lg 
             hover:bg-blue-300 transition disabled:opacity-50
             flex items-center justify-center gap-2"
        >
          <IoReload />
          Clear
        </button>

        {/* Resend OTP */}
        {!isVerified && (
          <p className="text-center text-sm text-gray-500 mt-2">
            Wrong email?{" "}
            <Link to={'/forgotPassword'} className="text-indigo-600 font-medium hover:text-indigo-700 transition">
              Go back
            </Link>
          </p>
        )}

        {/* Messages */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-center mt-4">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-center mt-4">
            {successMessage}
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifyOTP;
