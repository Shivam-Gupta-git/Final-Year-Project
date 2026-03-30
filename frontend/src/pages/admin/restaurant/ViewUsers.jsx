import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminOrders } from "../../../features/user/foodSlice";

function ViewUsers() {
  const dispatch = useDispatch();
  const { orders = [], loading } = useSelector((state) => state.food);

  useEffect(() => {
    dispatch(fetchAdminOrders());
  }, [dispatch]);

  // Calculate unique users with order count
  const usersMap = {};
  orders.forEach((order) => {
    const userId = order.user._id;
    if (!usersMap[userId]) {
      usersMap[userId] = {
        id: userId,
        name: order.user.name || "No Name",
        email: order.user.email,
        ordersCount: 1,
      };
    } else {
      usersMap[userId].ordersCount += 1;
    }
  });
  const uniqueUsers = Object.values(usersMap);

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-950 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
        Users Dashboard
      </h1>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
              <tr>
                <th className="p-4">User Name</th>
                <th className="p-4">Email</th>
                <th className="p-4 text-center">Orders Placed</th>
              </tr>
            </thead>
            <tbody>
              {uniqueUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="p-4 font-medium">{user.name}</td>
                  <td className="p-4">{user.email}</td>
                  <td className="p-4 text-center font-semibold">
                    {user.ordersCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {uniqueUsers.length === 0 && (
            <p className="p-6 text-gray-500">No users found.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default ViewUsers;