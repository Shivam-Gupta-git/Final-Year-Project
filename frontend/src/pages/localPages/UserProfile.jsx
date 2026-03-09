import React, { useState } from "react";
import { useSelector } from "react-redux";
import UserdataUpdateForm from "../../components/UserdataUpdateForm";
import { FiEdit } from "react-icons/fi";
import { IoCallOutline } from "react-icons/io5";
import { MdOutlineEmail } from "react-icons/md";
import { IoLocationOutline } from "react-icons/io5";

function UserProfile() {
  const { user } = useSelector((state) => state.user);
  const [showForm, setShowForm] = useState(false);

  // fallback initials function
  const getInitials = (name = "User") => {
    if (typeof name !== "string") return "U";
    return name
      .trim()
      .split(" ")
      .filter((n) => n)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (!user) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        {/* Spinner */}
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin"></div>

        {/* Loading text */}
        <p className="text-gray-500 dark:text-gray-300 text-lg font-medium">
          Loading user data...
        </p>
      </div>
    );
  }

  return (
    <div className="w-[90%] md:w-[75%] lg:w-[65%] mx-auto mt-10 bg-white dark:bg-gray-900 shadow-xl rounded-2xl p-6 transition-all">

    {/* Profile Header */}
    <div className="flex flex-col md:flex-row md:items-center gap-6">
  
      {/* Avatar */}
      <div className="relative w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold overflow-hidden shadow-md">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.userName || "User"}
            className="w-full h-full object-cover"
          />
        ) : (
          getInitials(user.userName)
        )}
      </div>
  
      {/* User Info */}
      <div className="flex-1 space-y-2">
  
        {/* Name + Edit */}
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
            {user.userName || "User"}
          </h2>
  
          <button
            onClick={() => setShowForm(!showForm)}
            className="p-1 rounded-md text-blue-600 hover:bg-blue-100 dark:hover:bg-gray-700 transition"
          >
            <FiEdit size={18} />
          </button>
        </div>
  
        {/* Contact Info */}
        <div className="space-y-1 text-gray-600 dark:text-gray-300 text-sm">
  
          <p className="flex items-center gap-2">
            <MdOutlineEmail className="text-blue-500" />
            {user.email}
          </p>
  
          <p className="flex items-center gap-2">
            <IoCallOutline className="text-green-500" />
            {user.contactNumber || "N/A"}
          </p>
  
          <p className="flex items-center gap-2">
            <IoLocationOutline className="text-red-500" />
            {user?.location?.city
              ? `${user.location.city}, ${user.location.state}`
              : "Location not added"}
          </p>
  
        </div>
  
      </div>
  
    </div>
  
    {/* Divider */}
    <div className="my-5 border-t border-gray-200 dark:border-gray-700"></div>
  
    {/* Extra Info */}
    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
  
      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
        <span className="font-medium">Role</span>
        <p>{user.role}</p>
      </div>
  
      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
        <span className="font-medium">Account Status</span>
        <p className={user.isVerified ? "text-green-500" : "text-red-500"}>
          {user.isVerified ? "Verified" : "Not Verified"}
        </p>
      </div>
  
    </div>
  
    {/* Update Form */}
    {showForm && (
      <div className="mt-6 bg-gray-50 dark:bg-gray-800 p-5 rounded-xl shadow-inner transition-all">
        <UserdataUpdateForm />
      </div>
    )}
  
  </div>
  );
}

export default UserProfile;
