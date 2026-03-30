import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchAdminOrders } from "../../../features/user/foodSlice";

function OrdersDashboard() {
  const dispatch = useDispatch()
  const {orders = [], loading} = useSelector((state) => state.food)


  useEffect(() => {
   dispatch(fetchAdminOrders())
  }, [dispatch])

  const recentOrders = [...orders]
  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // newest first
  .slice(0, 3); 

  const revenue = orders
  .filter(order => order.status === "confirmed" || order.status === "delivered")
  .reduce((acc, order) => acc + order.totalAmount, 0);

  const pendingOrders = orders.filter(order => order.status === "pending").length;

  const uniqueUsers = [...new Set(orders.map(order => order.user._id))].length;


  return (
    <div className="min-h-screen bg-linear-to-br from-gray-100 via-white to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">

      {/* HEADER */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-gray-500">
            Overview of your platform performance
          </p>
        </div>

        <Link to={"/admin/create-food"} className="bg-blue-600 text-white px-5 py-2 rounded-xl shadow hover:scale-105 transition">
          + Add Food
        </Link>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow">
          <p className="text-gray-500 text-sm">Total Orders</p>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{orders.length}</h2>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow">
          <p className="text-gray-500 text-sm">Revenue</p>
          <h2 className="text-2xl font-bold text-green-500">₹{revenue}</h2>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow">
          <p className="text-gray-500 text-sm">Pending Orders</p>
          <h2 className="text-2xl font-bold text-yellow-500">{pendingOrders}</h2>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow">
          <p className="text-gray-500 text-sm">Users</p>
          <h2 className="text-2xl font-bold text-blue-500">{uniqueUsers}</h2>
        </div>

      </div>

      {/* RECENT ORDERS */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow mb-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Recent Orders
        </h2>

        <div className="space-y-3">
          {recentOrders.map((order, index) => (
          <div key={index} className="flex justify-between items-center border-b pb-2">
            <div>
              <p className="font-semibold text-gray-800 dark:text-white">
              #{order._id.slice(-6)} - {order.deliveryAddress?.name}
              </p>
              <p className="text-sm text-gray-500">₹{order.totalAmount}</p>
            </div>
            <span className="text-yellow-500 text-sm">{order.status}</span>
          </div>
          ))}
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <Link to={"/admin/manage-orders"} className="bg-blue-600 text-white p-4 rounded-xl shadow hover:scale-105 transition">
          Manage Orders
        </Link>

        <Link to={"/admin/create-food"} className="bg-green-600 text-white p-4 rounded-xl shadow hover:scale-105 transition">
          Add Food Item
        </Link>

        <Link to={"/admin/ViewUsers"} className="bg-purple-600 text-white p-4 rounded-xl shadow hover:scale-105 transition">
          View Users
        </Link>

      </div>

    </div>
  );
}

export default OrdersDashboard;