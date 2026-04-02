import React, {useState, useEffect} from 'react'
import { useSelector } from 'react-redux'
import { FiEdit } from "react-icons/fi";
import { MdOutlineEmail } from "react-icons/md";
import { IoCallOutline } from "react-icons/io5";
import AdmindataUpdateForm from '../../components/AdmindataUpdateForm';
import { FaUserSecret } from "react-icons/fa";

function AdminProfile() {

  const [showForm, setShowForm] = useState(false);

  const {admin, profileUpdate} = useSelector((state) => state.admin)

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
  // console.log(admin);
  return (
    <div className="w-[90%] md:w-[75%] lg:w-[65%] mx-auto mt-10 bg-zinc-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 transition-all">
  
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row md:items-center gap-6">
  
        {/* Avatar */}
        <div className="relative w-20 h-20 rounded-full bg-linear-to-br from-orange-500 to-red-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden shadow-lg">
          {admin?.avatar ? (
            <img
              src={admin.avatar}
              alt={admin.userName || "Super Admin"}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            getInitials(admin?.userName)
          )}
        </div>
  
        {/* SuperAdmin Info */}
        <div className="flex-1 space-y-2">
  
          {/* Name + Edit */}
          <div className="flex items-center gap-3">
            <h2 className="text-2xl md:text-3xl font-bold bg-linear-to-r from-white via-orange-300 to-orange-500 bg-clip-text text-transparent">
              {admin?.userName || "Super Admin"}
            </h2>
  
            <button
              onClick={() => setShowForm(!showForm)}
              className="p-1 rounded-md text-blue-500 hover:bg-blue-700/30 transition"
            >
              <FiEdit size={18} />
            </button>
          </div>
  
          {/* Contact Info */}
          <div className="space-y-1 text-gray-300 text-sm md:text-base">
            <p className="flex items-center gap-2 hover:text-blue-400 transition">
              <MdOutlineEmail className="text-blue-500" /> {admin?.email}
            </p>
  
            <p className="flex items-center gap-2 hover:text-green-400 transition">
              <IoCallOutline className="text-green-500" /> {admin?.contactNumber || "N/A"}
            </p>
  
            <p className="flex items-center gap-2 hover:text-orange-400 transition">
              <FaUserSecret className="text-orange-500"/> {admin?.host || "N/A"}
            </p>
          </div>
  
        </div>
  
      </div>
  
      {/* Divider */}
      <div className="my-5 border-t border-white/20"></div>
  
      {/* Extra Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300 text-sm md:text-base">
        <div className="bg-zinc-800/60 backdrop-blur-md p-3 rounded-lg shadow-inner hover:shadow-lg transition">
          <span className="font-medium text-gray-200">Role</span>
          <p className="mt-1">{admin?.role}</p>
        </div>
  
        <div className="bg-zinc-800/60 backdrop-blur-md p-3 rounded-lg shadow-inner hover:shadow-lg transition">
          <span className="font-medium text-gray-200">Account Status</span>
          <p className={admin?.isVerified ? "text-green-400 mt-1" : "text-red-400 mt-1"}>
            {admin?.isVerified ? "Verified" : "Not Verified"}
          </p>
        </div>
      </div>
  
      {/* Update Form */}
      {showForm && (
        <div className="mt-6 bg-zinc-800/50 backdrop-blur-md p-5 rounded-2xl shadow-inner transition-all">
          <AdmindataUpdateForm/>
        </div>
      )}
  
    </div>
  )
}

export default AdminProfile