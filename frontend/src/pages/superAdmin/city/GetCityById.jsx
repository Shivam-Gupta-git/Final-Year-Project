import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getCityById } from "../../../features/user/citySlice";

function GetCityById() {

  const dispatch = useDispatch();
  const { id } = useParams();

  const { city, loading, error } = useSelector((state) => state.city);
  console.log("city ID", id);

  useEffect(() => {
    if (id) {
      dispatch(getCityById(id));
    }
  }, [dispatch, id]);

  if (loading) {
    return <p className="p-6">Loading city...</p>;
  }

  if (error) {
    return <p className="p-6 text-red-500">{error}</p>;
  }

  return (
    <div className="p-6">

      {city && (
        <div className="bg-white shadow-lg rounded-xl p-6">

          <h2 className="text-2xl font-bold mb-4">
            {city.name}
          </h2>

          <p><strong>State:</strong> {city.state}</p>
          <p><strong>Country:</strong> {city.country}</p>
          <p><strong>Description:</strong> {city.description}</p>
          <p><strong>Best Time To Visit:</strong> {city.bestTimeToVisit}</p>
          <p><strong>Budget:</strong> ₹{city.avgDailyBudget}</p>

          <p>
            <strong>Famous For:</strong>{" "}
            {Array.isArray(city.famousFor)
              ? city.famousFor.join(", ")
              : city.famousFor}
          </p>

          {/* Images */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            {city.images?.map((img, index) => (
              <img
                key={index}
                src={img}
                alt="city"
                className="w-full h-40 object-cover rounded"
              />
            ))}
          </div>

        </div>
      )}

    </div>
  );
}

export default GetCityById;