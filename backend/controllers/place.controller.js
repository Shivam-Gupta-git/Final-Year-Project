import fs from "fs";
import { uploadCloudinary } from "../config/cloudinary.config.js";
import { City } from "../model/city.model.js";
import { Place } from "../model/place.model.js";
import mongoose from "mongoose";
import { Hotel } from "../model/hotel.model.js";
import { Room } from "../model/room.model.js";
import { Restaurant } from "../model/restaurant.model.js"

// SuperAdmin - Create Place
export const createPlace = async (req, res) => {
  try {
    let {
      name,
      cityId,
      description,
      category,
      timeRequired,
      entryfees,
      isPopular,
      bestTimeToVisit,
    } = req.body;

    name = name?.trim().toLowerCase();
    category = category?.trim().toLowerCase();
    bestTimeToVisit = bestTimeToVisit?.trim();

    let location;
    try {
      location = JSON.parse(req.body.location);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Inavalid location format",
      });
    }
    // console.log(location);

    if (
      !name ||
      !cityId ||
      !description ||
      !category ||
      !timeRequired ||
      !entryfees ||
      isPopular === undefined ||
      !bestTimeToVisit
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    //verify city
    const city = await City.findOne({ _id: cityId, status: "active" });
    if (!city) {
      return res.status(400).json({
        success: false,
        message: "wrong city id",
      });
    }
    // console.log(city);

    //verify place by city
    const existingPlace = await Place.findOne({
      name,
      city: cityId,
    });
    if (existingPlace) {
      return res.status(409).json({
        success: false,
        message: "Place is already exits in this city ",
      });
    }
    // console.log(existingPlace);

    //privent location duplicate
    const exitinglocation = await Place.findOne({
      "location.coordinates": location.coordinates,
    });
    if (exitinglocation) {
      return res.status(409).json({
        success: false,
        message: "A place already exists at this location",
      });
    }

    let imageUrl = [];
    if (req.files?.length) {
      for (const file of req.files) {
        const result = await uploadCloudinary(file.path, "places");
        console.log(result);
        imageUrl.push(result.secure_url);
        //unlink when upload to cloudnary
        try {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        } catch (err) {
          console.warn("File delete skipped:", err.message);
        }
      }
    }

    const place = await Place.create({
      name,
      city: cityId,
      description,
      isPopular,
      bestTimeToVisit,
      entryfees,
      category,
      timeRequired,
      images: imageUrl,
      location,
      status: "pending",
      createdBy: req.user?.id,
    });
    console.log(place);

    return res.status(201).json({
      success: true,
      data: place,
      message: "place created successfully",
    });
  } catch (error) {
    console.log("🔥 ERROR FULL:", error);
    console.log("🔥 ERROR MESSAGE:", error.message);
    console.log("🔥 ERROR STACK:", error.stack);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// SuperAdmin - Approve Place
export const approvePlace = async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);
    console.log(place);

    if (!place) {
      return res.status(400).json({
        success: false,
        message: "not found place ",
      });
    }

    place.status = "active";
    place.approvedBy = req.user?._id; //super admin
    await place.save();

    return res.status(200).json({
      success: true,
      message: "place approved",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// SuperAdmin - Reject Place
export const rejectPlace = async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);

    if (!place) {
      return res.status(404).json({ message: "place not found" });
    }

    place.status = "rejected";
    place.approvedBy = null;
    await place.save();

    return res.json({ success: true, message: "place rejected" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// SuperAdmin - Pending Place
export const pendingPlace = async (req, res) => {
  try {
    const place = await Place.find({ status: "pending" })
    .populate("createdBy", "userName email role")
    .populate("city", "name state");


    // console.log("Place: ", place);

    return res.status(200).json({
      success: true,
      data: place,
      count: place.length,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// SuperAdmin - Inactive Place
export const inactivePlace = async (req, res) => {
  try {
    const placeId = req.params.id;
    const place = await Place.findById(placeId);
    if (!place) {
      return res
        .status(403)
        .json({ success: false, message: "place not found" });
    }

    place.status = "inactive";
    place.approvedBy = null;
    await place.save();

    return res
      .status(200)
      .json({ success: true, message: "place inactive successfully" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// SuperAdmin - Get All Place CityWise
export const getPlacesCityWise = async (req, res) => {
  try {
    const places = await Place.aggregate([
      {
        $lookup: {
          from: "cities", // collection name in MongoDB
          localField: "city",
          foreignField: "_id",
          as: "cityDetails",
        },
      },
      { $unwind: "$cityDetails" },

      {
        $group: {
          _id: "$cityDetails._id",
          cityName: { $first: "$cityDetails.name" },
          places: { $push: "$$ROOT" },
        },
      },
    ]);

    if (!places.length) {
      return res.status(404).json({
        success: false,
        message: "No places found",
      });
    }

    return res.status(200).json({
      success: true,
      data: places,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// SuperAdmin - Get Active Place CityWise
export const getActivePlacesCityWise = async (req, res) => {
  try {
    const places = await Place.aggregate([
      // ✅ only active places
      {
        $match: { status: "active" },
      },

      // ✅ join city data
      {
        $lookup: {
          from: "cities", // collection name (IMPORTANT ⚠️)
          localField: "city",
          foreignField: "_id",
          as: "city",
        },
      },

      // ✅ convert array → object
      {
        $unwind: "$city",
      },

      // ✅ group by city
      {
        $group: {
          _id: "$city._id",
          cityName: { $first: "$city.name" },
          state: { $first: "$city.state" },

          places: {
            $push: {
              _id: "$_id",
              name: "$name",
              category: "$category",
              description: "$description",
              images: "$images",
              timeRequired: "$timeRequired",
              entryfees: "$entryfees",
              bestTimeToVisit: "$bestTimeToVisit",
              location: "$location",
            },
          },
        },
      },

      // ✅ optional sorting
      {
        $sort: { cityName: 1 },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: places,
    });
  } catch (error) {
    console.log("ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// SuperAdmin - Get All Inactive Place CityWise
export const getInactivePlacesCityWise = async (req, res) => {
  try {
    const places = await Place.aggregate([
      {
        $match: { status: "inactive" }, // only inactive
      },
      {
        $lookup: {
          from: "cities",
          localField: "city",
          foreignField: "_id",
          as: "cityData",
        },
      },
      { $unwind: "$cityData" },

      {
        $group: {
          _id: "$city",
          cityName: { $first: "$cityData.name" },
          places: { $push: "$$ROOT" },
        },
      },

      {
        $project: {
          _id: 1,
          cityName: 1,
          places: 1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: places,
      message: "Inactive places city-wise fetched successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// SuperAdmin - Get PlaceById
export const getplacebyid = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Place ID",
      });
    }

    const place = await Place.findById(id).populate("city", "name state");

    if (!place) {
      return res.status(400).json({
        success: false,
        message: "Place not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: place,
      message: "successfully get place location",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// SuperAdmin - Update Place
export const updatePlace = async (req, res) => {
  try {
    const { id } = req.params;
    let updatedata = { ...req.body };

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Hotel ID",
      });
    }

    //converting into parsing location
    if (req.body.location) {
      try {
        updatedata.location = JSON.parse(req.body.location);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid location format",
        });
      }
    }

    //prevent duplicate location
    if (updatedata.location?.coordinates) {
      const exitingPlace = await Place.findOne({
        _id: { $ne: id },
        "location.coordinates": updatedata.location.coordinates,
      });
      if (exitingPlace) {
        return res.status(409).json({
          success: false,
          message: "Another place already exists at these coordinates.",
        });
      }
    }

    if (req.files && req.files.length > 0) {
      let imageUrls = [];

      for (const file of req.files) {
        const uploadResult = await uploadCloudinary(file.path, "places");
        imageUrls.push(uploadResult.secure_url);

        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
      updatedata.images = imageUrls;
    }

    const updatedPlace = await Place.findByIdAndUpdate(id, updatedata, {
      new: true,
      runValidators: true,
    });
    console.log(updatedPlace);

    if (!updatedPlace) {
      return res.status(404).json({
        success: false,
        message: "Place not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedPlace,
      message: "successfully updated place",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// SuperAdmin - Delete Place
export const deletePlace = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "invalid Place Id",
      });
    }

    const deletedPlace = await Place.findByIdAndDelete(id);

    if (!deletedPlace) {
      return res.status(404).json({
        success: false,
        message: "Place not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "delete successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Public - generateTravelPlan
export const generateTravelPlan = async (req, res) => {
  try {
    const { cityId, budget, days } = req.body;

    if (!cityId || !budget || !days) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Fetch active places, hotels, restaurants
    const places = await Place.find({
      city: cityId,
      status: "active",
      entryfees: { $lte: budget },
    });

    const hotels = await Hotel.find({
      city: cityId,
      status: "active",
    });

    const rooms = await Room.find({
      status: "active",
      pricePerNight: { $lte: budget },
    });

    const restaurants = await Restaurant.find({
      city: new mongoose.Types.ObjectId(cityId),
      status: "active",
      avgCostForOne: { $lte: Number(budget) },
    });
    
    const sortedRestaurants = restaurants.sort(
      (a, b) => (b.averageRating || 0) - (a.averageRating || 0)
    );

  
    if (!places.length && !hotels.length && !restaurants.length) {
      return res
        .status(404)
        .json({ success: false, message: "No options found in this city" });
    }

    // 2️⃣ Sort by priority/ratings
    const sortedPlaces = places.sort(
      (a, b) => b.priorityScore - a.priorityScore,
    );
    

    // Map hotels with cheapest room
    const hotelsWithCheapestRoom = await Promise.all(
      hotels.map(async (hotel) => {
        const hotelRooms = rooms.filter(
          (r) =>
            r.hotelId.toString() === hotel._id.toString() &&
            r.pricePerNight <= budget,
        );
        if (!hotelRooms.length) return null;
        const cheapestRoom = hotelRooms.reduce((a, b) =>
          a.pricePerNight < b.pricePerNight ? a : b,
        );
        return { ...hotel.toObject(), cheapestRoom };
      }),
    );

    const filteredHotels = hotelsWithCheapestRoom.filter(Boolean);

    const sortedHotels = filteredHotels.sort((a, b) => {
      const scoreA = 1 / (a.cheapestRoom.pricePerNight || 1) + (a.rating || 0);
      const scoreB = 1 / (b.cheapestRoom.pricePerNight || 1) + (b.rating || 0);
      return scoreB - scoreA; 
    });

    // const sortedRestaurants = restaurants.sort((a, b) => b.rating - a.rating);

    // Allocate per day
    let totalBudget = budget;
    let plan = [];
    let hoursPerDay = 8;
    let currentDay = 1;
    let usedHours = 0;

    for (let place of sortedPlaces) {
      // Skip if budget too low
      if (totalBudget < place.avgCost) continue;

      // Check day limit
      if (usedHours + place.visitDurationHours > hoursPerDay) {
        currentDay++;
        usedHours = 0;
      }
      if (currentDay > days) break;

      
      // const restaurant = sortedRestaurants.find((r) => r.avgCost <= totalBudget);
      const hotel = sortedHotels.find((h) => h.cheapestRoom.pricePerNight <= totalBudget);
      const restaurant = sortedRestaurants.find((r) => r.avgCostForOne <= totalBudget);

      // Push to plan
      plan.push({
        day: currentDay,
        places: [place],
        hotels: hotel ? [hotel] : [],
        restaurants: restaurant ? [restaurant] : [],
        // travel: [], // optional: add travel distance objects here
      });

      // Deduct budget
      totalBudget -= place.avgCost + (hotel?.cheapestRoom.pricePerNight || 0);
      // + (restaurant?.avgCost || 0);
      totalBudget -=
        place.avgCost +
        (hotel?.cheapestRoom.pricePerNight || 0) 
        + (restaurant?.avgCostForOne || 0);

      usedHours += place.visitDurationHours;
    }

    return res.status(200).json({
      success: true,
      data: plan,
      remainingBudget: totalBudget,
    });
  } catch (error) {
    console.error("Error generating travel plan:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getNearbyPlaces = async (req, res) => {
  try {
    let { lat, lng, cityId } = req.query;
    // distance comes in KM (default 20km) -> convert to meters for MongoDB
    const distanceKm = Number(req.query.distance ?? 20);
    const distance = (Number.isFinite(distanceKm) ? distanceKm : 20) * 1000;

    lat = parseFloat(lat);
    lng = parseFloat(lng);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({
        success: false,
        message: "Latitude and Longitude are required",
      });
    }

    let query = { status: "active" };

    if (cityId && mongoose.Types.ObjectId.isValid(cityId)) {
      query.city = new mongoose.Types.ObjectId(cityId);
    }

    if (req.query.popular === "true") {
      query.isPopular = true;
    }

    if (req.query.category) {
      query.category = String(req.query.category).trim().toLowerCase();
    }

    const places = await Place.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: [lng, lat] },
          distanceField: "distance",
          maxDistance: distance,
          spherical: true,
          query,
        },
      },
      {
        $addFields: {
          distanceInKm: {
            $round: [{ $divide: ["$distance", 1000] }, 2],
          },
        },
      },
      {
        $sort: { distance: 1, priorityScore: -1 },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: places,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Public - Get active places by city
export const getPlacesByCityId = async (req, res) => {
  try {
    const { cityId } = req.query;

    if (!cityId || !mongoose.Types.ObjectId.isValid(cityId)) {
      return res.status(400).json({
        success: false,
        message: "Valid cityId is required",
      });
    }

    const places = await Place.find({
      city: cityId,
      status: "active",
    }).sort({ isPopular: -1, priorityScore: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: places,
      count: places.length,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Public - Get single active place
export const getPlacePublicById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Place ID",
      });
    }

    const place = await Place.findOne({ _id: id, status: "active" }).populate(
      "city",
      "name state country",
    );

    if (!place) {
      return res.status(404).json({
        success: false,
        message: "Place not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: place,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Public - Search active places by keyword
export const searchPlaces = async (req, res) => {
  try {
    const q = String(req.query.q || "").trim();
    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Query parameter q is required",
      });
    }

    const cityId = req.query.cityId;
    const filter = { status: "active" };
    if (cityId && mongoose.Types.ObjectId.isValid(cityId)) {
      filter.city = cityId;
    }

    const places = await Place.find({
      ...filter,
      $or: [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
      ],
    })
      .limit(50)
      .sort({ isPopular: -1, priorityScore: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: places,
      count: places.length,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
