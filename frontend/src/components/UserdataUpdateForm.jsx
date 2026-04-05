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
  className="mx-auto w-full max-w-5xl overflow-hidden rounded-4xl border border-white/10 bg-[#0b0b0f] shadow-[0_30px_80px_rgba(0,0,0,0.65)]"
>
  <div className="grid lg:grid-cols-[340px_1fr]">
    {/* LEFT PANEL */}
    <div className="relative border-b border-white/10 bg-linear-to-b from-[#111827] via-[#0f172a] to-[#020617] p-6 sm:p-8 lg:border-b-0 lg:border-r lg:border-white/10">
      {/* subtle glow */}
      <div className="absolute -left-20 top-0 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-blue-600/10 blur-3xl" />

      <div className="relative z-10 flex h-full flex-col">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-cyan-300">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            Account Settings
          </div>

          <h2 className="mt-5 text-3xl font-bold leading-tight text-white sm:text-4xl">
            Update Profile
          </h2>

          <p className="mt-3 text-sm leading-7 text-zinc-400 sm:text-base">
            Manage your personal details, upload a new profile image and keep
            your account information up to date.
          </p>
        </div>

        {/* Profile Preview Card */}
        <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <div className="flex flex-col items-center text-center">
            <div className="group relative">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar Preview"
                  className="h-28 w-28 rounded-3xl object-cover ring-4 ring-cyan-500/20 transition duration-300 group-hover:scale-[1.02]"
                />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-linear-to-br from-cyan-500 via-blue-600 to-indigo-700 text-4xl font-bold text-white ring-4 ring-cyan-500/20 transition duration-300 group-hover:scale-[1.02]">
                  {user?.userName?.[0]?.toUpperCase() || "U"}
                </div>
              )}

              <label className="absolute -bottom-2 -right-2 flex h-10 w-10 cursor-pointer items-center justify-center rounded-2xl border border-white/10 bg-cyan-500 text-white shadow-lg transition hover:scale-105 hover:bg-cyan-400">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.232 5.232l3.536 3.536M9 13l6.768-6.768a2.5 2.5 0 113.536 3.536L12.536 16.536A4 4 0 019.707 17.707L7 18l.293-2.707A4 4 0 018.464 12.536z"
                  />
                </svg>

                <input
                  type="file"
                  name="avatar"
                  onChange={handleChange}
                  className="hidden"
                />
              </label>
            </div>

            <h3 className="mt-5 text-xl font-semibold text-white">
              {formData.userName || "Your Name"}
            </h3>

            <p className="mt-1 text-sm text-zinc-400">
              {formData.email || "your@email.com"}
            </p>

            <div className="mt-6 w-full rounded-2xl border border-white/10 bg-black/30 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Status</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto hidden pt-8 lg:block">
          <p className="text-xs leading-6 text-zinc-500">
            Tip: Use a professional profile photo and updated contact details
            to make your account look more trustworthy.
          </p>
        </div>
      </div>
    </div>

    {/* RIGHT PANEL */}
    <div className="bg-[#0f1117] p-6 sm:p-8 lg:p-10">
      <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-5">
        <div>
          <h3 className="text-2xl font-semibold text-white">
            Personal Information
          </h3>
          <p className="mt-1 text-sm text-zinc-400">
            Edit your account details below
          </p>
        </div>

        <div className="hidden rounded-2xl border border-white/10 bg-white/5 px-4 py-3 sm:flex sm:items-center sm:gap-3">
          <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 11c0 3.866-3.582 7-8 7m16-7c0 3.866-3.582 7-8 7m0-7V4m0 7c4.418 0 8 3.134 8 7"
              />
            </svg>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              Secure Account
            </p>
            <p className="text-sm font-medium text-white">
              Information Protected
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Name */}
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Full Name
          </label>

          <div className="group flex items-center rounded-2xl border border-white/10 bg-[#151922] px-4 transition duration-300 focus-within:border-cyan-500/50 focus-within:ring-2 focus-within:ring-cyan-500/10">
            <svg
              className="mr-3 h-5 w-5 text-zinc-500 transition group-focus-within:text-cyan-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5.121 17.804A9 9 0 1118.879 6.196 9 9 0 015.12 17.804z"
              />
            </svg>

            <input
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              placeholder="Enter your full name"
              className="w-full bg-transparent py-4 text-white placeholder:text-zinc-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Email Address
          </label>

          <div className="group flex items-center rounded-2xl border border-white/10 bg-[#151922] px-4 transition duration-300 focus-within:border-cyan-500/50 focus-within:ring-2 focus-within:ring-cyan-500/10">
            <svg
              className="mr-3 h-5 w-5 text-zinc-500 transition group-focus-within:text-cyan-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 12H8m8 0l-4-4m4 4l-4 4"
              />
            </svg>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full bg-transparent py-4 text-white placeholder:text-zinc-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Contact */}
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Contact Number
          </label>

          <div className="group flex items-center rounded-2xl border border-white/10 bg-[#151922] px-4 transition duration-300 focus-within:border-cyan-500/50 focus-within:ring-2 focus-within:ring-cyan-500/10">
            <svg
              className="mr-3 h-5 w-5 text-zinc-500 transition group-focus-within:text-cyan-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 5h2l3 7-1.5 2.5A1 1 0 007.5 16H19v2H7.5a3 3 0 01-2.59-4.5L6 11 3 5zm6 14a1 1 0 100 2 1 1 0 000-2zm8 0a1 1 0 100 2 1 1 0 000-2z"
              />
            </svg>

            <input
              type="text"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              placeholder="Enter your contact number"
              className="w-full bg-transparent py-4 text-white placeholder:text-zinc-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="mt-10 flex flex-col-reverse gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-zinc-500">
          Changes are saved securely to your account.
        </p>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-3 rounded-2xl bg-cyan-500 px-7 py-4 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition duration-300 hover:bg-cyan-400 hover:shadow-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Updating...
            </>
          ) : (
            <>
              Save Changes
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 12h14m-5-5l5 5-5 5"
                />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  </div>
</form>
  );
}

export default UserdataUpdateForm;