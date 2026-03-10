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
    
    <div className="flex items-center justify-center bg-linear-to-br from-blue-100 via-white to-gray-200 px-4 ">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-300 ">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Welcome Back
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Sign in to continue to your account
        </p>

        <form onSubmit={handelFormSubmit} className="space-y-5">
          {/* Email */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600">
              Email Address
            </label>

            <input
              type="email"
              name="email"
              required
              placeholder="Enter your email"
              value={formData.email}
              onChange={handelChange}
              className="w-full mt-1 px-4 py-2.5 border border-gray-300 rounded-lg 
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none
          transition duration-200"
            />
          </div>

          {/* Password */}
          <div className="relative flex flex-col">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-600">
                Password
              </label>

              <Link
                to={"/forgot-password"}
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition"
              >
                Forgot password?
              </Link>
            </div>

            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              placeholder="Enter your password"
              value={formData.password}
              onChange={handelChange}
              className="w-full mt-1 px-4 py-2.5 border border-gray-300 rounded-lg
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none
          transition duration-200 pr-10"
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 transition"
            >
              {showPassword ? (
                <IoEyeSharp size={18} />
              ) : (
                <FaEyeSlash size={18} />
              )}
            </button>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99]
        text-white py-2.5 rounded-lg font-semibold tracking-wide
        transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Sign In"}
          </button>

          {/* Signup link */}
          <p className="text-sm text-center text-gray-600">
            Don’t have an account?{" "}
            <Link
              to={"/signUp"}
              className="text-blue-600 font-semibold hover:underline"
            >
              Sign up
            </Link>
          </p>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm text-center py-2 px-3 rounded-lg">
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default Login;
