import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateUserProfile } from "../features/user/userSlice";

function UserdataUpdateForm() {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.user);

  // Initialize form fields with user data
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    contactNumber: "",
    avatar: null,
  });

  // Preview avatar locally
  const [avatarPreview, setAvatarPreview] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        userName: user.userName || "",
        email: user.email || "",
        contactNumber: user.contactNumber || "",
        avatar: null, // we only append avatar if user selects new file
      });
      setAvatarPreview(user.avatar || "");
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "avatar") {
      const file = files[0];
      setFormData({ ...formData, avatar: file });
      if (file) {
        setAvatarPreview(URL.createObjectURL(file));
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = new FormData();

    // Append only changed fields
    if (formData.userName !== user.userName) data.append("userName", formData.userName);
    if (formData.email !== user.email) data.append("email", formData.email);
    if (formData.contactNumber !== user.contactNumber) data.append("contactNumber", formData.contactNumber);
    if (formData.avatar) data.append("avatar", formData.avatar);

    dispatch(updateUserProfile(data));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg max-w-md mx-auto"
    >
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
        Update Profile
      </h2>

      {/* Avatar Upload on Top */}
      <div className="flex flex-col items-center">
        {avatarPreview ? (
          <img
            src={avatarPreview}
            alt="Avatar Preview"
            className="w-28 h-28 rounded-full border border-gray-300 dark:border-gray-600 object-cover mb-3"
          />
        ) : (
          <div className="w-28 h-28 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold mb-3">
            {user.userName ? user.userName[0].toUpperCase() : "U"}
          </div>
        )}
        <input
          type="file"
          name="avatar"
          onChange={handleChange}
          className="w-full text-gray-700 dark:text-gray-200"
        />
      </div>

      {/* Name Field */}
      <div className="flex flex-col">
        <label className="mb-1 text-gray-600 dark:text-gray-300 font-medium">
          Name
        </label>
        <input
          type="text"
          name="userName"
          value={formData.userName}
          onChange={handleChange}
          placeholder="Enter your name"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white dark:border-gray-600"
        />
      </div>

      {/* Email Field */}
      <div className="flex flex-col">
        <label className="mb-1 text-gray-600 dark:text-gray-300 font-medium">
          Email
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white dark:border-gray-600"
        />
      </div>

      {/* Contact Number Field */}
      <div className="flex flex-col">
        <label className="mb-1 text-gray-600 dark:text-gray-300 font-medium">
          Contact Number
        </label>
        <input
          type="text"
          name="contactNumber"
          value={formData.contactNumber}
          onChange={handleChange}
          placeholder="Enter your number"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white dark:border-gray-600"
        />
      </div>

      {/* Error Message */}
      {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="loader border-t-white border-blue-500 animate-spin rounded-full w-5 h-5 mr-2"></span>
            Updating...
          </>
        ) : (
          "Update Profile"
        )}
      </button>
    </form>
  );
}

export default UserdataUpdateForm;