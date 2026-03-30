import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getAdminHotels } from "../../features/user/hotelSlice";
import { getAdminRestaurant } from "../../features/user/restaurantSlice";

function AdminItemsDetailsByAdminId() {
  const { adminId } = useParams();
  const dispatch = useDispatch();

  const { hotels = [], loadingHotels, error } = useSelector((state) => state.hotel);
  const { restaurants = [], loading: loadingRestaurants } = useSelector((state) => state.restaurant);

  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    dispatch(getAdminHotels(adminId));
    dispatch(getAdminRestaurant(adminId));
  }, [dispatch, adminId]);

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">

      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
        Hosted Items
      </h1>

      {/* LOADING */}
      {(loadingHotels || loadingRestaurants) && (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 animate-pulse">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-md">
              <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-3/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      )}

      {/* ERROR */}
      {error && (
        <p className="text-center py-10 text-red-500">{error}</p>
      )}

      {/* EMPTY */}
      {!loadingHotels && !loadingRestaurants && hotels.length === 0 && restaurants.length === 0 && (
        <p className="text-center py-10 text-gray-500 dark:text-gray-400">
          No hosted items found for this admin.
        </p>
      )}

      {/* -------------------- HOTELS -------------------- */}
      {hotels.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-700 dark:text-white">
            Hotels
          </h2>

          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {hotels.map((hotel) => (
              <div
                key={hotel._id}
                onClick={() => setSelectedItem({ ...hotel, type: "hotel" })}
                className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-md cursor-pointer hover:shadow-xl transition"
              >
                <img
                  src={hotel.images?.[0]}
                  className="w-full h-48 object-cover rounded-xl mb-4"
                  alt={hotel.name}
                />

                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {hotel.name}
                </h3>

                <p className="text-gray-500">{hotel.city?.name}</p>

                <p className="text-sm text-gray-400 mt-1">
                  {hotel.address}
                </p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* -------------------- RESTAURANTS -------------------- */}
      {restaurants.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mt-10 mb-4 text-gray-700 dark:text-white">
            Restaurants
          </h2>

          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {restaurants.map((r) => (
              <div
                key={r._id}
                onClick={() => setSelectedItem({ ...r, type: "restaurant" })}
                className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-md cursor-pointer hover:shadow-xl transition"
              >
                <img
                  src={r.images?.[0]}
                  className="w-full h-48 object-cover rounded-xl mb-4"
                  alt={r.name}
                />

                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {r.name}
                </h3>

                <p className="text-gray-500">📍 {r.city?.name}</p>

                <p className="text-sm text-gray-400 mt-1">
                  {r.foodType} • ₹{r.avgCostForOne}
                </p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* -------------------- MODAL -------------------- */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full md:w-3/4 max-h-[90vh] overflow-y-auto p-6 relative">

            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-xl"
              onClick={() => setSelectedItem(null)}
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">
              {selectedItem.name}
            </h2>

            <p className="text-gray-500 mb-4">
              {selectedItem.city?.name}
            </p>

            {/* IMAGES */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {selectedItem.images?.map((img, i) => (
                <img key={i} src={img} className="w-full h-40 object-cover rounded-lg" />
              ))}
            </div>

            {/* DETAILS */}
            <div className="grid md:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">

              <p><b>Address:</b> {selectedItem.address}</p>
              <p><b>Status:</b> {selectedItem.status}</p>

              {/* HOTEL */}
              {selectedItem.type === "hotel" && (
                <>
                  <p><b>Facilities:</b> {selectedItem.facilities?.join(", ")}</p>
                </>
              )}

              {/* RESTAURANT */}
              {selectedItem.type === "restaurant" && (
                <>
                  <p><b>Food Type:</b> {selectedItem.foodType}</p>
                  <p><b>Famous Food:</b> {selectedItem.famousFood}</p>
                  <p><b>Cost:</b> ₹{selectedItem.avgCostForOne}</p>
                  <p>
                    <b>Opening:</b>{" "}
                    {selectedItem.openingHours?.open} - {selectedItem.openingHours?.close}
                  </p>
                </>
              )}

              <p>
                <b>Location:</b>{" "}
                <a
                  href={`https://maps.google.com?q=${selectedItem.location?.coordinates?.[1]},${selectedItem.location?.coordinates?.[0]}`}
                  target="_blank"
                  className="text-blue-600 underline"
                >
                  View Map
                </a>
              </p>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminItemsDetailsByAdminId;