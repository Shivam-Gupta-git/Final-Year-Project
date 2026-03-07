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
      error
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
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-100 to-gray-200 px-4">

      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8">

        <h2 className="text-3xl font-bold text-center text-gray-700 mb-6">
          Sign In
        </h2>

        <form onSubmit={handelFormSubmit} className="space-y-4">

          {/* Email */}
          <div>
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
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>

          {/* Password */}
          <div className="relative">

            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-600">
                Password
              </label>

              <Link
                to={"/forgot-password"}
                className="text-sm text-blue-500 hover:underline"
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
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none pr-10"
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-9 text-gray-500"
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
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium transition duration-200 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Sign In"}
          </button>

          {/* Signup link */}
          <p className="text-sm text-center text-gray-600">
            Don’t have an account?{" "}
            <Link
              to={"/signUp"}
              className="text-blue-500 font-medium hover:underline"
            >
              Sign up
            </Link>
          </p>

          {/* Error */}
          {error && (
            <p className="text-red-500 text-sm text-center font-medium">
              {error}
            </p>
          )}

        </form>

      </div>

    </div>
  );
}

export default Login;