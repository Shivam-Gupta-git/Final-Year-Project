import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { activeRoomAction, getAllRoomsByID, inactiveRoomAction } from "../../../features/user/roomSlice";
import { Link, useParams } from "react-router-dom";

function GetAllRooms() {
  const dispatch = useDispatch();
  const { id } = useParams();
  const { rooms = [], loading } = useSelector((state) => state.room);

  const [selectedRoom, setSelectedRoom] = useState(null);

  useEffect(() => {
    if (id) dispatch(getAllRoomsByID(id));
  }, [dispatch, id]);

  const handelActiveRoomButton = (roomId) => {
    dispatch(activeRoomAction(roomId))
  }
  const handelInactiveRoomButton = (roomId) => {
    dispatch(inactiveRoomAction(roomId))
  }



  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-6">Hotel Rooms</h2>

      {loading ? (
        <p>Loading...</p>
      ) : rooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-24 text-center">
          <div className="text-6xl mb-4">🏨</div>

          <h2 className="text-2xl font-semibold text-gray-700">
            No Rooms Found
          </h2>

          <p className="text-gray-500 mt-2 max-w-md">
            This hotel does not have any rooms yet. Please create rooms to make
            this hotel available for bookings.
          </p>

          <Link to="/admin/create-room" className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
            Add Room
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <div
              key={room._id}
              onClick={() => setSelectedRoom(room)}
              className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl cursor-pointer transition"
            >
              <div className="relative">
              <img
                src={room.images?.[0]}
                className="h-48 w-full object-cover"
              />
              <div className={`absolute top-1 left-2 rounded-2xl text-white text-sm px-2 ${room.status === "inactive" ? "bg-red-600" : "bg-green-500"}`}>{room.status}</div>
              </div>

              <div className="p-4">
                <h3 className="text-xl font-semibold capitalize">
                  {room.roomType}
                </h3>
                <p className="text-gray-500">Capacity: {room.capacity}</p>
                <p className="font-bold text-blue-600">
                  ₹{room.pricePerNight} / night
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl w-175 p-6 relative animate-fadeIn">
            <button
              onClick={() => setSelectedRoom(null)}
              className="absolute top-3 right-3 text-xl"
            >
              ✖
            </button>

            <img
              src={selectedRoom.images?.[0]}
              className="h-60 w-full object-cover rounded-xl"
            />

            <h2 className="text-2xl font-bold mt-4 capitalize">
              {selectedRoom.roomType}
            </h2>

            <p className="text-gray-600 mt-2">{selectedRoom.description}</p>

            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="bg-gray-100 p-3 rounded">
                <p className="text-sm">Price</p>
                <p className="font-bold">₹{selectedRoom.pricePerNight}</p>
              </div>

              <div className="bg-gray-100 p-3 rounded">
                <p className="text-sm">Capacity</p>
                <p className="font-bold">{selectedRoom.capacity}</p>
              </div>

              <div className="bg-gray-100 p-3 rounded">
                <p className="text-sm">Total Rooms</p>
                <p className="font-bold">{selectedRoom.totalRooms}</p>
              </div>
            </div>

            {/* Amenities */}
            <div className="mt-4">
              <p className="font-semibold mb-2">Amenities</p>
              <div className="flex flex-wrap gap-2">
                {selectedRoom.amenities?.map((a, i) => (
                  <span
                    key={i}
                    className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
            {/* buttons */}
            <div className="w-full bg-gray-100 h-13 mt-5 rounded-2xl flex items-center justify-end p-2 gap-3">
              
              <Link to={`/admin/update-room/${selectedRoom._id}`} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg">Update Room</Link>
              {
                selectedRoom.status === "active" ? (
                  <button onClick={() => handelInactiveRoomButton(selectedRoom._id)} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg">Inactive</button>
                ) :
                (
                  <button onClick={() => handelActiveRoomButton(selectedRoom._id)} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg">Active</button>
                )
              }
            
            </div>

          </div>
        </div>
        
      )}
    </div>
  );
}

export default GetAllRooms;
