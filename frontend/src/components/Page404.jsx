import React from 'react'
export default function Page404({
  type = navigator.onLine ? '404' : 'offline',
}) {
  const isOffline = type === 'offline';

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#020617] px-6">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.12),transparent_35%)]" />

      {/* Floating Blur Orbs */}
      <div className="absolute -top-20 left-10 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-10 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl animate-pulse" />

      <div className="relative z-10 w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 p-8 md:p-12 backdrop-blur-2xl shadow-[0_25px_80px_rgba(0,0,0,0.55)] text-center">
        {/* Icon */}
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-white/10 bg-white/10 shadow-lg">
          {isOffline ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-12 w-12 text-red-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18.364 5.636a9 9 0 10-12.728 12.728M15 12a3 3 0 11-6 0m10.5-4.5L4.5 19.5"
              />
            </svg>
          ) : (
            <div className="text-5xl font-extrabold text-white">404</div>
          )}
        </div>

        {/* Title */}
        <h1 className="mt-8 text-3xl md:text-4xl font-bold text-white">
          {isOffline ? 'No Internet Connection' : 'Page Not Found'}
        </h1>

        {/* Subtitle */}
        <p className="mt-4 text-sm md:text-base leading-7 text-slate-400">
          {isOffline
            ? 'It looks like your network is disconnected. Please check your internet connection and try again.'
            : "The page you're looking for doesn't exist, may have been moved, or the URL is incorrect."}
        </p>

        {/* Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto rounded-2xl bg-linear-to-r from-blue-600 via-cyan-500 to-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all duration-300 hover:scale-[1.03] hover:shadow-cyan-500/40"
          >
            {isOffline ? 'Retry Connection' : 'Reload Page'}
          </button>

          <button
            onClick={() => (window.location.href = '/')}
            className="w-full sm:w-auto rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-slate-200 transition-all duration-300 hover:border-white/20 hover:bg-white/10"
          >
            Go To Home
          </button>
        </div>
      </div>
    </div>
  );
}