import React from "react";

const cities = [
  {
    name: "Jaipur",
    image:
      "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    name: "Goa",  
    image:
      "https://images.unsplash.com/photo-1560179406-1c6c60e0dc76?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Z29hfGVufDB8fDB8fHww"
  },
  {
    name: "Manali",
    image:
      "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23"
  },
  {
    name: "Delhi",
    image:
      "https://images.unsplash.com/photo-1587474260584-136574528ed5"
  }
];

function PopularCities() {
  return (
    <section className="py-16 px-6 max-w-7xl mx-auto">

      <h2 className="text-3xl font-bold mb-10 text-center">
        Popular Cities
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">

        {cities.map((city, index) => (
          <div
            key={index}
            className="relative rounded-xl overflow-hidden shadow-lg cursor-pointer group"
          >

            <img
              src={city.image}
              alt={city.name}
              className="w-full h-60 object-cover group-hover:scale-110 transition duration-300"
            />

            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">

              <h3 className="text-white text-xl font-semibold">
                {city.name}
              </h3>

            </div>

          </div>
        ))}

      </div>

    </section>
  );
}

export default PopularCities;