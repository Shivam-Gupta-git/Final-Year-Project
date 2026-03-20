import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { userLogin } from "../../features/auth/authSlice";
import { FaEyeSlash } from "react-icons/fa6";
import { IoEyeSharp } from "react-icons/io5";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, loginSuccess } = useSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);

  const handelChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handelFormSubmit = (event) => {
    event.preventDefault();

    const { email, password } = formData;

    if (!email || !password) {
      error;
      return;
    }

    dispatch(userLogin({ email, password }));
  };

  useEffect(() => {
    if (loginSuccess) {
      navigate("/");
    }
  }, [loginSuccess, navigate]);

  return (
    <div className=" flex items-center justify-center bg-linear-to-br from-gray-100 via-white to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6 text-gray-800 dark:text-white">
  
      {/* BACKGROUND GLOW */}
      <div className="absolute w-72 h-72 bg-blue-400/30 rounded-full blur-3xl top-10 left-10"></div>
      <div className="absolute w-72 h-72 bg-indigo-400/30 rounded-full blur-3xl bottom-10 right-10"></div>
  
      {/* CARD */}
      <div className="relative w-full max-w-md bg-white/70 dark:bg-gray-800/70 backdrop-blur-2xl shadow-2xl rounded-3xl p-8 border border-gray-200 dark:border-gray-700">
  
        {/* HEADER */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xl shadow-lg">
            👤
          </div>
  
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
            Welcome Back
          </h2>
  
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Sign in to continue to your account
          </p>
        </div>
  
        <form onSubmit={handelFormSubmit} className="space-y-5">
  
          {/* EMAIL */}
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Email Address
            </label>
  
            <input
              type="email"
              name="email"
              required
              placeholder="Enter your email"
              value={formData.email}
              onChange={handelChange}
              className="w-full mt-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/60 dark:bg-gray-900/60 focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>
  
          {/* PASSWORD */}
          <div className="relative">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Password
              </label>
  
              <Link
                to={"/forgot-password"}
                className="text-sm text-blue-600 hover:underline"
              >
                Forgot?
              </Link>
            </div>
  
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              placeholder="Enter your password"
              value={formData.password}
              onChange={handelChange}
              className="w-full mt-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/60 dark:bg-gray-900/60 focus:ring-2 focus:ring-blue-500 outline-none transition pr-10"
            />
  
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? (
                <IoEyeSharp size={18} />
              ) : (
                <FaEyeSlash size={18} />
              )}
            </button>
          </div>
  
          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-linear-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-xl hover:opacity-90 transition disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Sign In"}
          </button>
  
          {/* SIGNUP */}
          <p className="text-sm text-center text-gray-600 dark:text-gray-400">
            Don’t have an account?{" "}
            <Link
              to={"/signUp"}
              className="text-blue-600 font-semibold hover:underline"
            >
              Sign up
            </Link>
          </p>
  
          {/* ERROR */}
          {error && (
            <div className="bg-red-100 text-red-600 text-sm text-center py-2 px-3 rounded-lg border border-red-200">
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default Login;
