import React, { useEffect, useState } from 'react'
import { useSelector } from "react-redux";
import { FiEdit } from "react-icons/fi";
import { MdOutlineEmail } from "react-icons/md";
import { IoCallOutline } from "react-icons/io5";
import SuperAdminDataUpdateForm from '../../components/SuperAdminDataUpdateForm';

function SuperAdminProfile() {
  const { superAdmin, profileUpdate } = useSelector((state) => state.superAdmin);
  const [showForm, setShowForm] = useState(false);

  const getInitials = (name) => {
    if (!name) return "SA";
    const names = name.split(" ");
    return names.map((n) => n[0]).join("").toUpperCase();
  };

  useEffect(()=> {
   if(profileUpdate){
    setShowForm(false)
   }
  }, [profileUpdate])
  return (
    <div className="w-[90%] md:w-[75%] lg:w-[65%] mx-auto mt-10 bg-white dark:bg-gray-900 shadow-xl rounded-2xl p-6 transition-all">

    {/* Profile Header */}
    <div className="flex flex-col md:flex-row md:items-center gap-6">

      {/* Avatar */}
      <div className="relative w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold overflow-hidden shadow-md">
        {superAdmin?.avatar ? (
          <img
            src={superAdmin.avatar}
            alt={superAdmin.userName || "Super Admin"}
            className="w-full h-full object-cover"
          />
        ) : (
          getInitials(superAdmin?.userName)
        )}
      </div>

      {/* SuperAdmin Info */}
      <div className="flex-1 space-y-2">

        {/* Name + Edit */}
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
            {superAdmin?.userName || "Super Admin"}
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
            {superAdmin?.email}
          </p>

          <p className="flex items-center gap-2">
            <IoCallOutline className="text-green-500" />
            {superAdmin?.contactNumber || "N/A"}
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
        <p>{superAdmin?.role}</p>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
        <span className="font-medium">Account Status</span>
        <p className={superAdmin?.isVerified ? "text-green-500" : "text-red-500"}>
          {superAdmin?.isVerified ? "Verified" : "Not Verified"}
        </p>
      </div>

    </div>

    {/* Update Form */}
    {showForm && (
      <div className="mt-6 bg-gray-50 dark:bg-gray-800 p-5 rounded-xl shadow-inner transition-all">
        {/* Your SuperAdmin update form */}
        <SuperAdminDataUpdateForm/>
      </div>
    )}

  </div>
  )
}

export default SuperAdminProfile