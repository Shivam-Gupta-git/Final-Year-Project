import mongoose from "mongoose";
import { uploadCloudinary } from "../config/cloudinary.config.js";
import { City } from "../model/city.model.js";
import { Restaurant } from "../model/restaurant.model.js";
import fs from "fs";
import { User } from "../model/user.model.js";

// ADMIN - CREATE RESTAURANT
export const createRestaurant = async (req, res) => {
  try {
    let {
      name,
      address,
      stateId,
      cityId,
      famousFood,
      bestTime,
      foodType,
      avgCostForOne,
      isRecommended,
    } = req.body;
    console.log("data", req.body.openingHours);

    let openingHours;

    try {
      openingHours = JSON.parse(req.body.openingHours);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid opening hours format",
      });
    }

    // ✅ Parse location safely
    let location;
    try {
      location = JSON.parse(req.body.location);
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid location format",
      });
    }

    // ✅ Validate location
    if (
      !location ||
      !Array.isArray(location.coordinates) ||
      location.coordinates.length !== 2
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid coordinates",
      });
    }

    // ✅ Required fields validation
    if (
      !name ||
      !address ||
      !stateId ||
      !cityId ||
      !famousFood ||
      !bestTime ||
      !foodType ||
      !avgCostForOne ||
      !openingHours
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled",
      });
    }

    // ✅ Convert number
    avgCostForOne = Number(avgCostForOne);

    // ✅ Validate city
    const city = await City.findOne({ _id: cityId, status: "active" });
    if (!city) {
      return res.status(404).json({
        success: false,
        message: "Invalid city",
      });
    }

    // ✅ Duplicate name check
    const existingRestaurant = await Restaurant.findOne({
      name: name.toLowerCase(),
      city: cityId,
    });

    if (existingRestaurant) {
      return res.status(409).json({
        success: false,
        message: "Restaurant already exists in this city",
      });
    }

    // ✅ Upload images
    let imageUrls = [];

    if (req.files?.length) {
      for (const file of req.files) {
        try {
          const result = await uploadCloudinary(file.path, "restaurant");
          imageUrls.push(result.secure_url);

          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        } catch (err) {
          console.warn("Image upload failed:", err.message);
        }
      }
    }

    // ✅ Create restaurant
    const restaurant = await Restaurant.create({
      name,
      address,
      state: stateId,
      city: cityId,
      famousFood,
      bestTime,
      foodType,
      avgCostForOne,
      openingHours,
      isRecommended: isRecommended || false,
      location,
      images: imageUrls,
      owner: req.user?.id,
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      data: restaurant,
      message: "Restaurant created successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ADMIN - GET ACTIVE ADMIN'S RESTAURANT BY ADMIN
export const getActiveRestaurant = async (req, res) => {
  try {

    let filter = { status: "active" };
    if (req.user.role === "admin") {
      // admin → only own hotels
      filter.owner = req.user.id;
    }

    if (req.user.role === "user") {
      // user → only approved active hotels
      filter.isApproved = true;
    }

    const restaurant = await Restaurant.find(filter)
      .populate("city", "name state")
      .populate("owner", "name email");

    return res.status(200).json({
      success: true,
      message: "Active hotels fetched successfully",
      data: restaurant,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ADMIN - INACTIVE RESTAURANT BY ADMIN
export const inactiveRestaurantByAdmin = async (req, res) => {
  try {
    const restaurantId = req.params.id;
    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "restaurant not found",
      });
    }
    // ownership check
    if (restaurant.owner.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only inactive your own restaurant",
      });
    }

    // status validation
    if (restaurant.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Only active hotel can be inactivated",
      });
    }

    restaurant.status = "inactive";
    restaurant.approvedBy = null;
    await restaurant.save();

    return res.status(200).json({
      success: true,
      message: "restaurant inactivated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ADMIN - GET RESTAURANT STATUS
export const getRestaurantStatus = async (req, res) => {
  try {
    const { status } = req.query;

    let filter = {};

    // SUPER ADMIN → see all
    if (req.user.role === "super_admin") {
      filter = status ? { status } : {};
    }

    // ADMIN → see own
    if (req.user.role === "admin") {
      filter = {
        owner: req.user.id,
        ...(status && { status }),
      };
    }

    const restaurants = await Restaurant.find(filter).populate("city");

    return res.status(200).json({
      success: true,
      data: restaurants,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ADMIN || SUPERADMIN - GET RESTAURANT BYID
export const getResturantbyID = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Resturant ID",
      });
    }

    const restaurant = await Restaurant.findById(id)
      .populate("city", "name state")
      .lean();

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Resturant not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: restaurant,
      message: "successfully get all data",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ADMIN - UPDATE RESTAURANT 
export const updateResturant = async (req, res) => {
  try {
    const { id } = req.params;
    let updateData = { ...req.body };

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid restaurant ID",
      });
    }

    if (req.body.location) {
      try {
        updateData.location = JSON.parse(req.body.location);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid location format",
        });
      }
    }

    if (updateData.location?.coordinates) {
      const exitingResturant = await Restaurant.findOne({
        _id: { $ne: id },
        "location.coordinates": updateData.location.coordinates,
      });
      if (exitingResturant) {
        return res.status(409).json({
          success: false,
          message: "Another resturant already exists at these coordinates.",
        });
      }
    }

    if (req.files && req.files.length > 0) {
      try {
        const uploadPromises = req.files.map((file) =>
          uploadCloudinary(file.path, "Restaurant")
        );
        const uploadResults = await Promise.all(uploadPromises);
        updateData.images = uploadResults.map((result) => result.secure_url);
        // Delete local temp files
        req.files.forEach((file) => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      } catch (uploadError) {
        console.log("Upload Error:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Image upload failed",
        });
      }
    }

    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );
    console.log(updatedRestaurant);

    return res.status(200).json({
      success: true,
      data: updatedRestaurant,
      message: "Restaurant updated successfully",
    });
  } catch (error) {
    console.error("Update Restaurant Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// SUPERADMIN - GET ALL PENDING RESTAURANT CITY WISE
export const allPendingResturant = async (req, res) => {
  try {
    const { city } = req.query;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let filter = { status: "pending" };

    // ✅ city validation
    if (city) {
      if (!mongoose.Types.ObjectId.isValid(city)) {
        return res.status(400).json({
          success: false,
          message: "Invalid city ID",
        });
      }
      filter.city = city;
    }

    const total = await Restaurant.countDocuments(filter);

    const restaurants = await Restaurant.find(filter)
      .populate("city", "name")
      .populate("owner", "userName email role")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: restaurants,
      page,
      total,
      totalPages: Math.ceil(total / limit),
    });

  } catch (error) {
    console.error("ERROR:", error); // 👈 MUST ADD THIS
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// SUPERADMIN - APPROVE RESTAURANT
export const approveResturant = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid restaurant ID",
      });
    }

    //check super admin
    if (req.user?.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    if (restaurant.status === "active") {
      return res.status(400).json({
        success: false,
        message: "Restaurant already approved",
      });
    }

    restaurant.status = "active";
    restaurant.approvedBy = req.user._id;
    await restaurant.save();

    return res.status(200).json({
      success: true,
      message: "Restaurant approved successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// SUPERADMIN - REJECT RESTAURANT
export const rejectResturant = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid id",
      });
    }

    if (req.user?.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    //optimized way to reject --chatgpt
    const resturant = await Restaurant.findOneAndUpdate(
      {
        _id: id,
        status: { $ne: "rejected" },
      },
      {
        status: "rejected",
        approvedBy: null,
      },
      {
        new: true,
      }
    );

    if (!resturant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found or already rejected",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Restaurant rejected successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// SUPERADMIN - GET ALL RESTAURANT CITY WISE 
export const getAllRestaurantCityWise = async (req, res) => {
  try {
    const { city } = req.query;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let filter = {};

    // ✅ city filter
    if (city) {
      if (!mongoose.Types.ObjectId.isValid(city)) {
        return res.status(400).json({
          success: false,
          message: "Invalid city ID",
        });
      }
      filter.city = city;
    }

    // ✅ only active restaurants (optional but recommended)
    // filter.status = "active";

    const total = await Restaurant.countDocuments(filter);

    const restaurants = await Restaurant.find(filter)
      .populate("city", "name")
      .populate("owner", "name email")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: restaurants,
      page,
      total,
      totalPages: Math.ceil(total / limit),
      count: restaurants.length,
    });

  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// SUPERADMIN - GET ALL ACTIVE RESTAURANT CITY WISE
export const getAllActiveRestaurantCityWise = async (req, res) => {
  try {
    const { city } = req.query;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let filter = {};

    // ✅ city filter
    if (city) {
      if (!mongoose.Types.ObjectId.isValid(city)) {
        return res.status(400).json({
          success: false,
          message: "Invalid city ID",
        });
      }
      filter.city = city;
    }

    // ✅ only active restaurants (optional but recommended)
    filter.status = "active";

    const total = await Restaurant.countDocuments(filter);

    const restaurants = await Restaurant.find(filter)
      .populate("city", "name")
      .populate("owner", "name email")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: restaurants,
      page,
      total,
      totalPages: Math.ceil(total / limit),
      count: restaurants.length,
    });

  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}; 

// SUPERADMIN - INACTIVE RESTAURANT 
export const inactiveRestaurant = async (req, res) => {
  try {
    const restaurantId = req.params.id;
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res
        .status(402)
        .json({ success: false, message: "place not found" });
    }

    restaurant.status = "inactive";
    restaurant.approvedBy = null;
    await restaurant.save();

    return res
      .status(200)
      .json({ success: true, message: "restaurant inactive successfully" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// SUPERADMIN - GET ALL INACTIVE RESTAURANT CITY WISE
export const getAllInActiveRestaurantCityWise = async (req, res) => {
  try {
    const { city } = req.query;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let filter = {};

    // ✅ city filter
    if (city) {
      if (!mongoose.Types.ObjectId.isValid(city)) {
        return res.status(400).json({
          success: false,
          message: "Invalid city ID",
        });
      }
      filter.city = city;
    }

    // ✅ only active restaurants (optional but recommended)
    filter.status = "inactive";

    const total = await Restaurant.countDocuments(filter);

    const restaurants = await Restaurant.find(filter)
      .populate("city", "name")
      .populate("owner", "name email")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: restaurants,
      page,
      total,
      totalPages: Math.ceil(total / limit),
      count: restaurants.length,
    });

  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}; 

// SUPERADMIN - GET ALL REJECTED RESTAURANT CITY WISE
export const getAllRejectedRestaurantCityWise = async (req, res) => {
  try {
    const { city } = req.query;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let filter = {};

    // ✅ city filter
    if (city) {
      if (!mongoose.Types.ObjectId.isValid(city)) {
        return res.status(400).json({
          success: false,
          message: "Invalid city ID",
        });
      }
      filter.city = city;
    }

    // ✅ only active restaurants (optional but recommended)
    filter.status = "rejected";

    const total = await Restaurant.countDocuments(filter);

    const restaurants = await Restaurant.find(filter)
      .populate("city", "name")
      .populate("owner", "name email")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: restaurants,
      page,
      total,
      totalPages: Math.ceil(total / limit),
      count: restaurants.length,
    });

  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}; 

// SUPERADMIN - DELETE RESTAURANT
export const deleteResturant = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid id ",
      });
    }

    const deleteresturant = await Restaurant.findByIdAndDelete(id, {
      runValidators: true,
    });
    if (!deleteresturant) {
      return res.status(404).json({
        success: true,
        message: "Resturant not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: deleteresturant,
      message: "successfully deleted",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// SUPERADMIN - GET ACTIVE RESTAURANT FOR A SPECIFIC ADMIN
export const getAdminRestaurant = async (req, res) => {
  try {
    const { adminId } = req.params;

    // Check if admin exists
    const admin = await User.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    // Fetch active hotels for this admin
    const restaurants = await Restaurant.find({ owner: adminId, status: "active" })
      .populate("city")
      .populate("owner", "name email");

    return res.status(200).json({
      success: true,
      data: restaurants,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// USER - GET ALL ACTIVE RESTAURANT FOR USER
export const getAllActiveRestaurantsForUser = async (req, res) => {
  try {
    const { city, search } = req.query;

    let filter = { status: "active" };

    // ✅ HANDLE CITY NAME
    if (city) {
      const cityDoc = await City.findOne({
        name: { $regex: city, $options: "i" },
      });

      if (cityDoc) {
        filter.city = cityDoc._id;
      } else {
        return res.status(404).json({
          success: false,
          message: "City not found",
        });
      }
    }

    // ✅ SEARCH
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    const restaurants = await Restaurant.find(filter)
      .populate("city")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: restaurants,
    });
  } catch (error) {
    console.log("ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET NEARBY RESTAURANTS
export const getNearbyRestaurants = async (req, res) => {
  try {
    let lat;
    let lng;

    if (req.query.lat != null && req.query.lng != null) {
      lat = Number(req.query.lat);
      lng = Number(req.query.lng);
    } else if (req.user?.id) {
      const user = await User.findById(req.user.id);
      if (!user?.location?.coordinates?.length) {
        return res.status(400).json({
          success: false,
          message: "Location not set on profile",
        });
      }
      [lng, lat] = user.location.coordinates;
    } else {
      return res.status(400).json({
        success: false,
        message: "lat and lng are required",
      });
    }

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return res.status(400).json({
        success: false,
        message: "Invalid coordinates",
      });
    }

    const restaurants = await Restaurant.find({
      status: "active",
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [Number(lng), Number(lat)],
          },
          $maxDistance: 5000,
        },
      },
    })
      .populate("city")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: restaurants });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const allAciveResturant = async (req, res) => {
  try {
    const { cityId } = req.params;
    console.log(cityId);

    if (!mongoose.Types.ObjectId.isValid(cityId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid city ID",
      });
    }

    const city = await City.findOne({
      _id: cityId,
      status: "active",
    });
    console.log(city);

    if (!city) {
      return res.status(400).json({
        success: false,
        message: "Inavlid city id",
      });
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const restaurant = await Restaurant.find({
      city: cityId,
      status: "active",
    })
      .populate("city", "name state")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();
    console.log(restaurant);

    return res.status(200).json({
      success: true,
      data: restaurant,
      page,
      limit,
      message: "successfully get all active data",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};






