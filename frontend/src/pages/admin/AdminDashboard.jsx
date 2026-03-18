import { useSelector } from "react-redux";
import { FaUserSecret } from "react-icons/fa";
import { Link } from "react-router-dom";
import { FaCity } from "react-icons/fa";

function AdminDashboard() {

  const { admin } = useSelector((state) => state.admin);


  // console.log(hotels);

  const getInitials = (name) => {
    if (!name) return "SA";
    const names = name.split(" ");
    return names
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col md:flex-row justify-between items-center gap-6">
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
              Hi <span className="font-medium">{admin?.userName}</span>, manage
              your platform from here.
            </p>

            <p className="flex items-center gap-1 text-gray-500">
              <span className="text-black">Host:</span>
              <FaUserSecret className="text-orange-500" />
              {admin?.host || "N/A"}
            </p>
          </div>
        </div>
        {/* right side */}
        <div className="w-[50%]  flex flex-col items-end justify-end gap-3">
          <Link
            to="/admin/create-hotel"
            className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition text-[13px]"
          >
            + Add Hotel Details
          </Link>

          <Link
            to="/admin/create-room"
            className="px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg shadow-md transition text-[13px]"
          >
            + Add Room Details
          </Link>
        </div>
      </div>

      <div className="mt-5 flex flex-row gap-5">
        <Link
          to="/admin/hotel-dashboard"
          className="w-60 p-5 bg-gray-100 rounded-xl shadow hover:shadow-lg hover:scale-105 transition flex flex-col items-center"
        >
          <span className="text-3xl mb-2 bg-purple-400 p-1 rounded-sm text-white">
            <FaCity />
          </span>
          <span className="font-semibold text-gray-700">
            Show All Hotels
          </span>
        </Link>

        <Link
          to="/admin/show-hotel-status"
          className="w-60 p-5 bg-gray-100 rounded-xl shadow hover:shadow-lg hover:scale-105 transition flex flex-col items-center"
        >
          <span className="text-3xl mb-2 bg-blue-400 p-1 rounded-sm text-white">
            <FaCity />
          </span>
          <span className="font-semibold text-gray-700">
            Show Hotels Status
          </span>
        </Link>

        {/* <Link
          to={`/admin/rooms`}
          className="w-60 p-5 bg-gray-100 rounded-xl shadow hover:shadow-lg hover:scale-105 transition flex flex-col items-center"
        >
          <span className="text-3xl mb-2 bg-gray-400 p-1 rounded-sm text-white">
            <FaCity />
          </span>
          <span className="font-semibold text-gray-700">
            Show All Rooms
          </span>
        </Link> */}
      </div>
    </div>
  );
}

export default AdminDashboard;
