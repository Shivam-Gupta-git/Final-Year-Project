import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaUserSecret } from "react-icons/fa";
import AddHotelDetails from "./hotel/AddHotelDetails";
import { Link } from "react-router-dom";

function AdminDashboard() {
  const [showAddHotemForm, setShowAddHotelForm] = useState(false)
  const [showUpdateHotemForm, setShowUpdateHotelForm] = useState(false)

  const { admin } = useSelector((state) => state.admin);

  const getInitials = (name) => {
    if (!name) return "SA";
    const names = name.split(" ");
    return names
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
  
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
        {/* Left side */}
      <div className="w-[50%] flex items-center gap-5">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold overflow-hidden">
          {admin?.avatar ? (
            <img
              src={admin.avatar}
              alt={admin.userName}
              className="w-full h-full object-cover"
            />
          ) : (
            getInitials(admin?.userName)
          )}
        </div>

        {/* Info */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
            Welcome Back 👋
          </h1>

          <p className="text-gray-600 dark:text-gray-300">
            Hi <span className="font-medium">{admin?.userName}</span>,
            manage your platform from here.
          </p>


          <p className="flex items-center gap-1 text-gray-500"><span className="text-black">Host:</span>
          <FaUserSecret className="text-orange-500"/>
            {admin?.host || "N/A"}
          </p>

        </div>
      </div>
      {/* right side */}
      <div className="w-[50%]  flex flex-col items-end justify-end gap-3">
       <Link to="/admin/create-hotel" className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition text-[13px]">+ Add Hotel Details</Link>
       <button onClick={() => setShowUpdateHotelForm(true)} className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-md transition text-[13px]">update Hotel Details</button>
      </div>
      </div>

      {(showAddHotemForm || showUpdateHotemForm) && (
          <div className=" fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-y-auto p-6 ">
            <div className="bg-white dark:bg-gray-900  rounded-xl shadow-lg w-[90%] relative">
              {/* Close Button */}
              <button
                onClick={() => {
                  setShowAddHotelForm(false);
                  setShowUpdateHotelForm(false)
                }}
                className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-lg"
              >
                ✕
              </button>

              {/* Form Component */}

              <AddHotelDetails/>

            </div>
          </div>
        )}
    </div>
  );
}

export default AdminDashboard;
