import axios from 'axios';
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom'
import { changePassword } from '../../features/auth/authSlice';


function ChangePassword() {

  const { email } = useParams();
  const[errorMessage, setErrorMessage] = useState("");
  const[successMessage, setSuccessMessage] = useState("");
  const[newPassword, setNewPassword] = useState("");
  const[confirmPassword, setConfirmPassword] = useState("");

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { loading, error } = useSelector((state) => state.auth)

  const handelChangePassword = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if(!newPassword || !confirmPassword){
      setErrorMessage("Please fill all the fields");
      return;
    }

    if(newPassword !== confirmPassword){
      setErrorMessage("Password do not match");
      return;
    }

    try {
      const result = await dispatch(changePassword({email, newPassword, confirmPassword})).unwrap()
      if(result.success){
        navigate("/login")
      }
    } catch (error) {
      console.log(error);
    }
    
  }
  
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
  <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-xl flex flex-col gap-6">

    {/* Header */}
    <div className="text-center">
      <h2 className="text-3xl font-bold text-indigo-700">
        Change Password
      </h2>
      <p className="mt-2 text-gray-600">
        Set a new password for
        <span className="block font-medium text-indigo-600 break-all">
          {email}
        </span>
      </p>
    </div>

    {/* Messages */}
    {errorMessage && (
      <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-center">
        {errorMessage}
      </div>
    )}

    {successMessage && (
      <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-center">
        {successMessage}
      </div>
    )}

    {/* Form */}
    <div className="flex flex-col gap-4 mt-2">

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          New Password
        </label>
        <input
          type="password"
          placeholder="Enter new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Confirm Password
        </label>
        <input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      <button
        disabled={loading}
        onClick={handelChangePassword}
        className="mt-4 w-full py-2 bg-indigo-600 text-white font-medium rounded-lg 
                   hover:bg-indigo-700 transition disabled:opacity-50"
      >
        {loading ? "Changing..." : "Change Password"}
      </button>
    </div>

  </div>
</div>
  )
}

export default ChangePassword