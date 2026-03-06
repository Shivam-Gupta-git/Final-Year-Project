import { useDispatch, useSelector } from "react-redux";
import { register } from "../../features/auth/authSlice";
import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";

function Register() {
  const dispatch = useDispatch();
  // const navigate = useNavigate();

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    
  // validation for contact number
  if (name === "contactNumber") {
    if (!/^\d{0,10}$/.test(value)) return;
  }

  setFormData({ ...formData, [name]: value });
    // setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setAvatar(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // IMPORTANT: use FormData for image upload
    const data = new FormData();
    data.append("userName", formData.userName);
    data.append("email", formData.email);
    data.append("contactNumber", formData.contactNumber);
    data.append("password", formData.password);
    data.append("role", formData.role);
    if (avatar) data.append("avatar", avatar);

    dispatch(register(data));
  };

  useEffect(() => {
    if (registerSuccess) {
      // navigate("/verify-info");
      console.log("Registered successfully");
    }
  }, [registerSuccess]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white shadow-lg rounded-lg p-6 space-y-4"
      >
        <h2 className="text-2xl font-semibold text-center text-gray-700">
          Create Account
        </h2>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            name="userName"
            required
            value={formData.userName}
            onChange={handleChange}
            placeholder="Enter your name"
            className="w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            name="email"
            type="email"
            required
            onChange={handleChange}
            placeholder="Enter your email"
            className="w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium">Contact Number</label>
          <input
            name="contactNumber"
            type="tel"
            value={formData.contactNumber}
            onChange={handleChange}
            placeholder="Enter phone number"
            pattern="[0-9]{10}"
            maxLength="10"
            required
            className="w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium">Password</label>
          <input
            name="password"
            type="password"
            required
            onChange={handleChange}
            placeholder="Enter password"
            className="w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium">Profile Image</label>
          <input
            type="file"
            accept="avatar/*" //image 
            onChange={handleImageChange}
            className="w-full mt-1 text-sm"
          />
        </div>

        {/* Button */}
        <button
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition disabled:opacity-50"
        >
          {loading ? "Registering..." : "Register"}
        </button>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}
      </form>
    </div>
  );
}

export default Register;