import { useDispatch, useSelector } from "react-redux";
import { register } from "../../features/auth/authSlice";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiLock,
  FiUpload,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";

function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, registerSuccess } = useSelector(
    (state) => state.auth
  );

  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    contactNumber: "",
    password: "",
    role: "user",
  });

  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "contactNumber") {
      if (!/^\d{0,10}$/.test(value)) return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setAvatar(file);

    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("userName", formData.userName);
    data.append("email", formData.email);
    data.append("contactNumber", formData.contactNumber);
    data.append("password", formData.password);
    data.append("role", formData.role);
    if (avatar) data.append("avatar", avatar);

    dispatch(register(data));
    console.log(avatar);
  };

  useEffect(() => {
    if (registerSuccess) {
      navigate("/verifyEmail");
      console.log("Registered successfully");
    }
  }, [registerSuccess]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-100 via-white to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6 text-gray-800 dark:text-white">
  
      {/* BACKGROUND GLOW */}
      <div className="absolute w-72 h-72 bg-blue-400/30 rounded-full blur-3xl top-10 left-10"></div>
      <div className="absolute w-72 h-72 bg-indigo-400/30 rounded-full blur-3xl bottom-10 right-10"></div>
  
      {/* CARD */}
      <div className="relative w-full max-w-[60%] bg-white/70 dark:bg-gray-800/70 backdrop-blur-2xl shadow-2xl rounded-3xl p-8 border border-gray-200 dark:border-gray-700">
  
        {/* HEADER */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xl shadow-lg">
            📝
          </div>
  
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
            Create Account
          </h2>
  
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Register your account to continue
          </p>
        </div>
  
        <form onSubmit={handleSubmit} className="space-y-5">
  
          {/* AVATAR */}
          <div className="flex flex-col items-center">
            <div className="w-28 h-28 rounded-full border-4 border-blue-500 overflow-hidden shadow-lg mb-3 bg-gray-100 flex items-center justify-center">
              {preview ? (
                <img
                  src={preview}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-400 text-sm">Avatar</span>
              )}
            </div>
  
            <label className="flex items-center gap-2 cursor-pointer text-sm text-blue-600 hover:underline">
              <FiUpload />
              Upload Avatar
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>
  
          {/* NAME */}
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-300">
              Full Name
            </label>
  
            <div className="relative mt-1">
              <FiUser className="absolute left-3 top-4 text-gray-400" />
  
              <input
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                placeholder="Enter your name"
                required
                className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/60 dark:bg-gray-900/60 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
  
          {/* EMAIL */}
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-300">
              Email Address
            </label>
  
            <div className="relative mt-1">
              <FiMail className="absolute left-3 top-4 text-gray-400" />
  
              <input
                name="email"
                type="email"
                onChange={handleChange}
                placeholder="Enter your email"
                required
                className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/60 dark:bg-gray-900/60 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
  
          {/* PHONE */}
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-300">
              Contact Number
            </label>
  
            <div className="relative mt-1">
              <FiPhone className="absolute left-3 top-4 text-gray-400" />
  
              <input
                name="contactNumber"
                type="tel"
                value={formData.contactNumber}
                onChange={handleChange}
                placeholder="Enter phone number"
                pattern="[0-9]{10}"
                maxLength="10"
                required
                className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/60 dark:bg-gray-900/60 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
  
          {/* PASSWORD */}
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-300">
              Password
            </label>
  
            <div className="relative mt-1">
              <FiLock className="absolute left-3 top-4 text-gray-400" />
  
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                onChange={handleChange}
                placeholder="Enter password"
                required
                className="w-full pl-10 pr-10 p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/60 dark:bg-gray-900/60 focus:ring-2 focus:ring-blue-500 outline-none"
              />
  
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-4 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>
  
          {/* ERROR */}
          {error && (
            <div className="bg-red-100 text-red-600 text-sm text-center py-2 px-3 rounded-lg border border-red-200">
              {error}
            </div>
          )}
  
          {/* BUTTON */}
          <button
            disabled={loading}
            className="w-full bg-linear-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-xl hover:opacity-90 transition"
          >
            {loading ? "Registering..." : "Register"}
          </button>
  
          {/* LOGIN LINK */}
          <p className="text-sm text-center text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-600 font-semibold hover:underline"
            >
              Login
            </Link>
          </p>
  
        </form>
      </div>
    </div>
  );
}

export default Register;
