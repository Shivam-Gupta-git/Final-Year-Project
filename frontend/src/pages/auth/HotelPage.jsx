import React, { useState } from 'react'
import HeroSearch from '../../components/Hotel/HotelSearch'
import HotelFilter from '../../components/Hotel/HotelFilter'



function HotelPage() {
  const [filters, setFilters] = useState({});

  const handleFilters = (newFilters) => {
    console.log("Filters selected:", newFilters);

    setFilters(newFilters);

    // later you can call API or redux here
    // dispatch(fetchHotels(newFilters))
  };
  return (
    <>
    <div className="max-w-7xl mx-auto p-4"></div>
    <HeroSearch />
    <div className="flex gap-6 mt-6">

        {/* Sidebar filter */}
        <HotelFilter onFilterChange={handleFilters} />

        {/* Hotel results */}
        <div className="flex-1">
          <h2 className="text-xl font-bold mb-4">
            Hotel Results
          </h2>

          {/* Example */}
          <pre className="bg-gray-100 p-4 rounded">
            {JSON.stringify(filters, null, 2)}
          </pre>

        </div>

      </div>
    </>
  )
}

export default HotelPage