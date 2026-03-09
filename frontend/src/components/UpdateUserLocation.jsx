import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom';
import { updateUserLocation } from '../features/user/userSlice';

function UpdateUserLocation() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, message, user } = useSelector((state) => state.user)
  const [ locationData, setLocationData ] = useState ({
    latitude: "",
    longitude: "",
    city: "",
    state: "",
    country: "",
  })

  const [ autoLocation, setAutoLocation ] = useState (false)

  useEffect(() => {
   if(user?.location){
    setLocationData({
      latitude: user.location.coordinates[1] || "",
      longitude: user.location.coordinates[0] || "",
      city: user.city || "",
      state: user.state || "",
      country: user.country || "",
    })
   }
  }, [user])

  const handleGetLocation = () => {
    if(!navigator.geolocation){
      alert("Geolocation is not supported by your browser");
      return
    }

    navigator.geolocation.getCurrentPosition(async(position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      setLocationData((pre) => ({...pre, latitude, longitude}));
      setAutoLocation(true);
         // Optional: Use a reverse geocoding API to get city/state/country
        // Example using OpenStreetMap Nominatim API
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await res.json();
        setLocationData((prev) => ({
          ...prev, 
          city: data.address.city || data.address.town || "",
          state: data.address.state || "",
          country: data.address.country || "",
        }))
      } catch (error) {
        console.log("Reverse geocoding failed", err);
      }
    },
    (error) => {
      console.log(error);
      alert("Unable to retrieve your location")
    })}

    const handleChange = (e) => {
      const { name, value } = e.target;
      setLocationData((prev) => ({...prev , [name] : value}))
    }

    const handelSubmit = (e) => {
      e.preventDefault()
      dispatch(updateUserLocation(locationData))
    } 
  return (
    <form
    onSubmit={handelSubmit}
    className="w-full mx-auto p-6 bg-white dark:bg-gray-800 shadow-xl rounded-xl space-y-4"
  >
    <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
      {user?.location ? "Update Location" : "Add Location"}
    </h2>

    <button
      type="button"
      onClick={handleGetLocation}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
    >
      {autoLocation ? "Location Auto-Filled" : "Use My Current Location"}
    </button>

    {/* Latitude & Longitude */}
    {/* <div className="flex gap-4">
      <div className="flex-1 flex flex-col">
        <label className="text-gray-700 dark:text-gray-300">Latitude</label>
        <input
          type="text"
          name="lat"
          value={locationData.lat}
          onChange={handleChange}
          placeholder="Latitude"
          className="px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
        />
      </div>
      <div className="flex-1 flex flex-col">
        <label className="text-gray-700 dark:text-gray-300">Longitude</label>
        <input
          type="text"
          name="lng"
          value={locationData.lng}
          onChange={handleChange}
          placeholder="Longitude"
          className="px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
        />
      </div>
    </div> */}

    {/* City, State, Country */}
    <div className="flex flex-col">
      <label className="text-gray-700 dark:text-gray-300">City</label>
      <input
        type="text"
        name="city"
        value={locationData.city}
        onChange={handleChange}
        placeholder="City"
        className="px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
      />
    </div>
    <div className="flex flex-col">
      <label className="text-gray-700 dark:text-gray-300">State</label>
      <input
        type="text"
        name="state"
        value={locationData.state}
        onChange={handleChange}
        placeholder="State"
        className="px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
      />
    </div>
    <div className="flex flex-col">
      <label className="text-gray-700 dark:text-gray-300">Country</label>
      <input
        type="text"
        name="country"
        value={locationData.country}
        onChange={handleChange}
        placeholder="Country"
        className="px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
      />
    </div>

    {error && <p className="text-red-500">{error}</p>}

    <button
      type="submit"
      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      disabled={loading}
    >
      {loading ? "Saving..." : "Save Location"}
    </button>
  </form>
  )
}

export default UpdateUserLocation