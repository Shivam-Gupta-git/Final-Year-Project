import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getHotelById, updateHotel } from "../../../features/user/hotelSlice";

function UpdateHotelDetails() {
  const { id: hotelId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { hotel, loading, error } = useSelector((state) => state.hotel);

  const [formData, setFormData] = useState({
    name: "",
    cityName: "",     // only display
    cityId: "",       // hidden id to send backend
    address: "",
    description: "",
    facilities: "",
    latitude: "",
    longitude: "",
    images: [],
  });

  // fetch hotel
  useEffect(() => {
    if (hotelId) dispatch(getHotelById(hotelId));
  }, [hotelId, dispatch]);

  // prefill
  useEffect(() => {
    if (hotel) {
      setFormData({
        name: hotel.name || "",
        cityName: hotel.city?.name || "",
        cityId: hotel.city?._id || "",
        address: hotel.address || "",
        description: hotel.description || "",
        facilities: hotel.facilities?.join(", ") || "",
        latitude: hotel.location?.coordinates?.[1] || "",
        longitude: hotel.location?.coordinates?.[0] || "",
        images: hotel.images || [],
      });
    }
  }, [hotel]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "images") {
      setFormData((prev) => ({ ...prev, images: files }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // live location
  const handleLiveLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({
          ...prev,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }));
      },
      () => alert("Location permission denied")
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("name", formData.name);
    data.append("city", formData.cityId); // send hidden id
    data.append("address", formData.address);
    data.append("description", formData.description);

    data.append(
      "location",
      JSON.stringify({
        type: "Point",
        coordinates: [formData.longitude, formData.latitude],
      })
    );

    data.append(
      "facilities",
      JSON.stringify(
        formData.facilities.split(",").map((f) => f.trim())
      )
    );

    for (let i = 0; i < formData.images.length; i++) {
      data.append("images", formData.images[i]);
    }

    dispatch(updateHotel({ hotelId, data }));
    alert("Hotel Updated Successfully");
    navigate("/admin/hotel-dashboard");
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-red-500 text-center">{error}</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Update Hotel</h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          placeholder="Hotel Name"
        />

        {/* READ ONLY CITY */}
        <input
          value={formData.cityName}
          readOnly
          className="w-full border p-2 rounded bg-gray-100 cursor-not-allowed"
          placeholder="City"
        />

        <input
          name="address"
          value={formData.address}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          placeholder="Address"
        />

        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          placeholder="Description"
        />

        <input
          name="facilities"
          value={formData.facilities}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          placeholder="wifi, parking, pool"
        />

        <div className="grid grid-cols-2 gap-3">
          <input
            name="latitude"
            value={formData.latitude}
            onChange={handleChange}
            className="border p-2 rounded"
            placeholder="Latitude"
          />

          <input
            name="longitude"
            value={formData.longitude}
            onChange={handleChange}
            className="border p-2 rounded"
            placeholder="Longitude"
          />
        </div>

        <button
          type="button"
          onClick={handleLiveLocation}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Get Live Location
        </button>

        <input
          type="file"
          name="images"
          multiple
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <div className="flex gap-2 flex-wrap">
          {Array.from(formData.images || []).map((img, i) => {
            const src =
              typeof img === "string"
                ? img
                : URL.createObjectURL(img);

            return (
              <img
                key={i}
                src={src}
                className="w-24 h-24 object-cover rounded"
              />
            );
          })}
        </div>

        <button className="bg-blue-600 text-white px-6 py-2 rounded">
          Update Hotel
        </button>

      </form>
    </div>
  );
}

export default UpdateHotelDetails;