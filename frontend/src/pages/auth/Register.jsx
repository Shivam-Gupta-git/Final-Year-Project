import { useDispatch, useSelector } from "react-redux";
import { register } from "../../features/auth/authSlice";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEyeSlash } from "react-icons/fa6";
import { IoEyeSharp } from "react-icons/io5";

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
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-100 to-gray-200 px-4">

      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8">

        <h2 className="text-3xl font-bold text-center text-gray-700 mb-6">
          Create Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Image Preview */}
          <div className="flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-full overflow-hidden  mb-2 shadow-sm">
              <img
                src={preview || "https://via.placeholder.com/100"}
                alt="🙂"
                className="w-full h-full object-cover flex items-center justify-center bg-gray-300"
              />
            </div>
            <div className=" w-23 flex items-center justify-center ">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full text-sm text-center bg-gray-300 px-1 py-1.5 rounded-2xl border-2 border-gray-200 shadow-sm shadow-gray-400"
            />
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="text-sm font-medium text-gray-600">
              Full Name
            </label>
            <input
              name="userName"
              required
              value={formData.userName}
              onChange={handleChange}
              placeholder="Enter your name"
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium text-gray-600">
              Email Address
            </label>
            <input
              name="email"
              type="email"
              required
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="text-sm font-medium text-gray-600">
              Contact Number
            </label>
            <input
              name="contactNumber"
              type="tel"
              value={formData.contactNumber}
              onChange={handleChange}
              placeholder="Enter phone number"
              pattern="[0-9]{10}"
              maxLength="10"
              required
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <label className="text-sm font-medium text-gray-600">
              Password
            </label>

            <input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              onChange={handleChange}
              placeholder="Enter password"
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none pr-10"
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-9 text-gray-500"
            >
              {showPassword ? <IoEyeSharp size={18} /> : <FaEyeSlash size={18} />}
            </button>
          </div>

          {/* Button */}
          <button
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium transition duration-200 disabled:opacity-50"
          >
            {loading ? "Registering..." : "Register"}
          </button>

          {/* Login */}
          <p className="text-sm text-center text-gray-600">
            Already have an account?{" "}
            <Link
              to={"/login"}
              className="text-blue-500 font-medium hover:underline"
            >
              Login
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

export default Register;