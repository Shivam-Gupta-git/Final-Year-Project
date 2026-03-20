import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { forgotPassword } from "../../features/auth/authSlice";


function ForgotPassword() {

  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { loading, error, message } = useSelector((state) => state.auth)
  
  const handelForgotPassword = async (e) => {
    e.preventDefault();
    try {

      const result = await dispatch(forgotPassword(email)).unwrap();
  
      if (result.success) {
        navigate(`/verify-otp/${email}`);
      }
  
    } catch (error) {
      console.log("Forgot password error:", error);
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-100 via-white to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-6">
  
      {/* CARD */}
      <div className="w-full max-w-md bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
  
        {/* HEADER */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Reset Password 🔐
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            Enter your email to receive reset instructions
          </p>
          <div className="w-12 h-1 bg-indigo-600 mx-auto mt-4 rounded-full"></div>
        </div>
  
        {/* SUCCESS MESSAGE */}
        {isSubmitted && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl text-center animate-fadeIn">
            <p className="font-semibold text-lg">Check your inbox 📩</p>
            <p className="mt-1">
              Reset link sent to{" "}
              <span className="font-semibold">{email}</span>
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Didn’t receive it?{" "}
              <button
                onClick={() => setIsSubmitted(false)}
                className="text-indigo-600 hover:underline"
              >
                Try again
              </button>
            </p>
          </div>
        )}
  
        {/* ERROR */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm text-center py-2 px-3 rounded-lg mb-4">
            {error}
          </div>
        )}
  
        {/* FORM */}
        {!isSubmitted && (
          <form onSubmit={handelForgotPassword} className="space-y-5">
  
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Email Address
              </label>
  
              <input
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                className="w-full mt-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg 
                bg-white dark:bg-gray-800 text-gray-800 dark:text-white
                focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              />
            </div>
  
            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-linear-to-r from-indigo-600 to-blue-600 text-white py-3 rounded-xl font-semibold shadow-md hover:opacity-90 transition disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
  
            {/* BACK TO LOGIN */}
            <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
              Remember your password?{" "}
              <Link
                to="/login"
                className="text-indigo-600 font-medium hover:underline"
              >
                Sign in
              </Link>
            </p>
  
          </form>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
