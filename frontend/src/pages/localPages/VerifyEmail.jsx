import React from 'react'

function VerifyEmail() {
  return (
    <div className='w-full flex items-center justify-center'>
      <div className='w-[50] border h-50 flex flex-col items-center justify-center p-2 mt-5 rounded-2xl bg-blue-300'>
      <h2 className="text-2xl font-semibold text-gray-800">
      Check your email
    </h2>
    <p className="text-gray-600 text-sm leading-relaxed">
      We’ve sent a verification link to your email address.  
      Please check your inbox and click the link to activate your account.
    </p>

    <p className="text-xs text-gray-500">
      Didn’t receive the email? Check your spam folder.
    </p>

      </div>
    </div>
  )
}

export default VerifyEmail