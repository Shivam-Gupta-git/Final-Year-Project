import fs from "fs";
import { uploadCloudinary } from "../config/cloudinary.config.js";
import { City } from "../model/city.model.js";
import { Place } from "../model/place.model.js";
import mongoose from "mongoose";
import { Hotel } from "../model/hotel.model.js";
import { Room } from "../model/room.model.js";
import { Restaurant } from "../model/restaurant.model.js"

function escapeRegExp(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

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

    const budgetNum = Number(budget);
    const daysNum = Math.min(30, Math.max(1, Math.floor(Number(days))));

    if (!cityId || !Number.isFinite(budgetNum) || budgetNum <= 0 || !Number.isFinite(daysNum)) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const numericEntryFee = (ef) => {
      if (ef == null) return 0;
      if (typeof ef === "string" && ef.trim().toLowerCase() === "free") return 0;
      const n = Number(String(ef).replace(/[^\d.]/g, ""));
      return Number.isFinite(n) ? n : 0;
    };

    const visitHoursForPlace = (place) => {
      const h = Number(place?.visitDurationHours);
      if (Number.isFinite(h) && h > 0) return Math.min(h, 24);
      return 2;
    };

    const rawPlaces = await Place.find({
      city: cityId,
      status: "active",
    });

    const places = rawPlaces.filter(
      (p) => numericEntryFee(p.entryfees) <= budgetNum,
    );

    const hotels = await Hotel.find({
      city: cityId,
      status: "active",
    });

    const hotelIds = hotels.map((h) => h._id);
    const rooms = await Room.find({
      hotelId: { $in: hotelIds },
      status: "active",
      pricePerNight: { $lte: budgetNum },
    });

    const restaurants = await Restaurant.find({
      city: new mongoose.Types.ObjectId(cityId),
      status: "active",
      avgCostForOne: { $lte: budgetNum },
    });

    const sortedRestaurants = restaurants.sort(
      (a, b) => (b.averageRating || 0) - (a.averageRating || 0),
    );

    if (!rawPlaces.length && !hotels.length && !restaurants.length) {
      return res.status(404).json({
        success: false,
        message: "No options found in this city",
      });
    }

    if (!places.length && (hotels.length || restaurants.length)) {
      return res.status(404).json({
        success: false,
        message:
          "This city has no places within your budget. Try a higher budget or add places in the admin panel.",
      });
    }

    const sortedPlaces = [...places].sort(
      (a, b) => (b.priorityScore || 0) - (a.priorityScore || 0),
    );

    const hotelsWithCheapestRoom = await Promise.all(
      hotels.map(async (hotel) => {
        const hotelRooms = rooms.filter(
          (r) =>
            r.hotelId.toString() === hotel._id.toString() &&
            r.pricePerNight <= budgetNum,
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

    let totalBudget = budgetNum;
    const plan = [];
    const hoursPerDay = 8;
    let currentDay = 1;
    let usedHours = 0;

    for (const place of sortedPlaces) {
      const fee = numericEntryFee(place.entryfees);
      if (totalBudget < fee) continue;

      const vh = visitHoursForPlace(place);

      while (usedHours + vh > hoursPerDay) {
        if (currentDay >= daysNum) break;
        currentDay += 1;
        usedHours = 0;
      }
      if (usedHours + vh > hoursPerDay) continue;

      const hotel = sortedHotels.find(
        (h) => h.cheapestRoom.pricePerNight <= totalBudget,
      );
      const restaurant = sortedRestaurants.find(
        (r) => r.avgCostForOne <= totalBudget,
      );

      plan.push({
        day: currentDay,
        places: [place],
        hotels: hotel ? [hotel] : [],
        restaurants: restaurant ? [restaurant] : [],
      });

      totalBudget -=
        fee +
        (hotel?.cheapestRoom.pricePerNight || 0) +
        (restaurant?.avgCostForOne || 0);

      usedHours += vh;
    }

    if (plan.length === 0 && sortedPlaces.length > 0) {
      const place = sortedPlaces[0];
      const fee = numericEntryFee(place.entryfees);
      const hotel = sortedHotels.find(
        (h) => h.cheapestRoom.pricePerNight <= totalBudget,
      );
      const restaurant = sortedRestaurants.find(
        (r) => r.avgCostForOne <= totalBudget,
      );
      plan.push({
        day: 1,
        places: [place],
        hotels: hotel ? [hotel] : [],
        restaurants: restaurant ? [restaurant] : [],
      });
      totalBudget -=
        fee +
        (hotel?.cheapestRoom.pricePerNight || 0) +
        (restaurant?.avgCostForOne || 0);
    }

    if (plan.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Could not build an itinerary. Try a higher budget, more days, or another city.",
      });
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

    const relaxCity =
      req.query.relaxCity === "true" ||
      req.query.relaxCity === "1";

    if (!relaxCity && cityId && mongoose.Types.ObjectId.isValid(cityId)) {
      query.city = new mongoose.Types.ObjectId(cityId);
    }

    if (req.query.popular === "true") {
      query.isPopular = true;
    }

    const categorySlug = String(req.query.category || "").trim();

    const pipeline = [
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
    ];

    if (categorySlug) {
      pipeline.push({
        $match: {
          category: {
            $regex: `^${escapeRegExp(categorySlug)}$`,
            $options: "i",
          },
        },
      });
    }

    const textQ = String(req.query.q || "").trim();
    if (textQ) {
      const rx = new RegExp(escapeRegExp(textQ), "i");
      pipeline.push({
        $match: {
          $or: [{ name: rx }, { description: rx }, { category: rx }],
        },
      });
    }

    pipeline.push({
      $sort: { distance: 1, priorityScore: -1 },
    });

    const places = await Place.aggregate(pipeline);

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

// Public - Distinct place categories for a city (for filter chips; matches stored `category` strings)
// GET /api/places/categories?cityId=ID
export const getPlaceCategoriesByCityId = async (req, res) => {
  try {
    const { cityId } = req.query;

    if (!cityId || !mongoose.Types.ObjectId.isValid(cityId)) {
      return res.status(400).json({
        success: false,
        message: "Valid cityId is required",
      });
    }

    const raw = await Place.distinct("category", {
      city: new mongoose.Types.ObjectId(cityId),
      status: "active",
      category: { $nin: [null, ""] },
    });

    const categories = [...new Set(raw.map((c) => String(c).trim()).filter(Boolean))].sort(
      (a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }),
    );

    return res.status(200).json({
      success: true,
      data: categories,
      count: categories.length,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Public - Get active places by city
// Query: cityId (required), category (optional), q (optional text search), sort (popularity|rating|newest)
export const getPlacesByCityId = async (req, res) => {
  try {
    const { cityId } = req.query;

    if (!cityId || !mongoose.Types.ObjectId.isValid(cityId)) {
      return res.status(400).json({
        success: false,
        message: "Valid cityId is required",
      });
    }

    const filter = {
      city: new mongoose.Types.ObjectId(cityId),
      status: "active",
    };

    const category = String(req.query.category || "").trim();
    if (category) {
      // Exact match (case-insensitive) — filter value is the DB string from /places/categories
      filter.category = {
        $regex: `^${escapeRegExp(category)}$`,
        $options: "i",
      };
    }

    const q = String(req.query.q || "").trim();
    if (q) {
      const rx = new RegExp(escapeRegExp(q), "i");
      filter.$or = [
        { name: rx },
        { description: rx },
        { category: rx },
      ];
    }

    const sortKey = String(req.query.sort || "popularity").toLowerCase();
    let sortSpec = { isPopular: -1, priorityScore: -1, createdAt: -1 };
    if (sortKey === "rating") {
      sortSpec = { averageRating: -1, totalReviews: -1, createdAt: -1 };
    } else if (sortKey === "newest") {
      sortSpec = { createdAt: -1 };
    }

    const places = await Place.find(filter).sort(sortSpec);

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
