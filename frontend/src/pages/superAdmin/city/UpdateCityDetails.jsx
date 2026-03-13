import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCityById, updateCity } from "../../../features/user/citySlice";
import { useNavigate, useParams } from "react-router-dom";

function UpdateCityDetails() {
  const { id: cityId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate()
  const { city, loading, error, success } = useSelector((state) => state.city);

  const [formData, setFormData] = useState({
    name: "",
    state: "",
    country: "",
    description: "",
    bestTimeToVisit: "",
    avgDailyBudget: "",
    famousFor: "",
    images: [],
  });

  // Fetch city by ID
  useEffect(() => {
    if (cityId) dispatch(getCityById(cityId));
  }, [cityId, dispatch]);

  // When city is loaded, fill form
  useEffect(() => {
    if (city) {
      setFormData({
        name: city.name || "",
        state: city.state || "",
        country: city.country || "",
        description: city.description || "",
        bestTimeToVisit: city.bestTimeToVisit || "",
        avgDailyBudget: city.avgDailyBudget || "",
        famousFor: Array.isArray(city.famousFor) ? city.famousFor.join(", ") : city.famousFor || "",
        images: city.images || [],
      });
    }
  }, [city]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "images") {
      setFormData((prev) => ({ ...prev, images: files }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    for (const key in formData) {
      if (key === "images") {
        for (let i = 0; i < formData.images.length; i++) {
          data.append("images", formData.images[i]);
        }
      } else if (key === "famousFor") {
        // Send as array
        data.append(key, JSON.stringify(formData[key].split(",").map((s) => s.trim())));
      } else {
        data.append(key, formData[key]);
      }
    }

    dispatch(updateCity({ id: cityId, data }));
    alert("city details update successful")
    navigate("/superAdmin/get-all-active-cities")
  };


  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Update City Details</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="font-semibold">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 mt-1"
          />
        </div>

        {/* State & Country */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-semibold">State</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 mt-1"
            />
          </div>
          <div>
            <label className="font-semibold">Country</label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 mt-1"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="font-semibold">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full border rounded px-3 py-2 mt-1"
          ></textarea>
        </div>

        {/* Best Time & Budget */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-semibold">Best Time To Visit</label>
            <input
              type="text"
              name="bestTimeToVisit"
              value={formData.bestTimeToVisit}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 mt-1"
            />
          </div>
          <div>
            <label className="font-semibold">Average Daily Budget</label>
            <input
              type="number"
              name="avgDailyBudget"
              value={formData.avgDailyBudget}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 mt-1"
            />
          </div>
        </div>

        {/* Famous For */}
        <div>
          <label className="font-semibold">Famous For (comma separated)</label>
          <input
            type="text"
            name="famousFor"
            value={formData.famousFor}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 mt-1"
          />
        </div>

        {/* Images */}
        <div>
          <label className="font-semibold">Images</label>
          <input
            type="file"
            name="images"
            multiple
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 mt-1"
          />
          <div className="flex gap-2 mt-2 flex-wrap">
            {Array.from(formData.images || []).map((img, i) => {
              const src = typeof img === "string" ? img : URL.createObjectURL(img);
              return (
                <img
                  key={i}
                  src={src}
                  alt="city"
                  className="w-24 h-24 object-cover rounded"
                />
              );
            })}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          Update City
        </button>
      </form>
    </div>
  );
}

export default UpdateCityDetails;