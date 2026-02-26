import mongoose from "mongoose";
import { uploadCloudinary } from "../config/cloudinary.config.js";
import { City } from "../model/city.model.js";
import { Restaurant } from "../model/restaurant.model.js";
import fs from "fs";

export const createResturant = async (req, res) => {
  try {
    let {
      name,
      address,
      cityId,
      famousFood,
      foodType,
      avgCostForOne,
      bestTime,
      isRecommended,
    } = req.body;

    let location;
    try {
      location = JSON.parse(req.body.location);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Inavalid location format",
      });
    }
    console.log(location);

    if (
      !name ||
      !address ||
      !cityId ||
      !foodType ||
      !avgCostForOne ||
      !bestTime ||
      !famousFood ||
      isRecommended === undefined //boolean value that why
    ) {
      return res.status(404).json({
        success: false,
        message: "All fields are required",
      });
    }

    //validating city
    const city = await City.findOne({ _id: cityId, status: "active" });
    if (!city) {
      return res.status(404).json({
        success: false,
        message: "Invalid city id",
      });
    }
    console.log(city);

    const exitingResturant = await Restaurant.findOne({
      name,
      city: cityId,
    });
    if (exitingResturant) {
      return res.status(409).json({
        success: false,
        message: "Resturant is already exists in this city with same name",
      });
    }

    //privent location
    const exitinglocation = await Restaurant.findOne({
      "location.coordinates": location.coordinates,
    });
    if (exitinglocation) {
      return res.status(409).json({
        success: false,
        message: "A restaurant already exists at this location",
      });
    }

    let imageUrl = [];
    if (req.files?.length) {
      for (const file of req.files) {
        //we can put try and catch later
        const result = await uploadCloudinary(file.path, "resturant");
        imageUrl.push(result.secure_url);
        try {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        } catch (error) {
          console.warn("File delete skipped:", err.message);
        }
      }
    }

    const resturant = await Restaurant.create({
      name,
      city: cityId,
      address,
      bestTime,
      avgCostForOne,
      isRecommended,
      location,
      images: imageUrl,
      famousFood,
      foodType,
      status: "pending",
      createdBy: req.user?._id,
    });

    return res.status(201).json({
      success: true,
      data: resturant,
      message: "successfully created resturant",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

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

export const rejectResturant = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid id",
      });
    }

    if (req.user?.role !== "super-admin") {
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
      },
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

export const allPendingResturant = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Restaurant.countDocuments({ status: "pending" });

    const restaurant = await Restaurant.find({ status: "pending" })
      .populate("createdBy", "userName email role")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: restaurant,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      count: restaurant.length,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const allAciveResturant = async (req, res) => {
  try {
    const { cityId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(cityId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Resturant ID",
      });
    }

    const city = await City.findOne({
      _id: cityId,
      status: "active",
    });

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

export const updateResturant = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid restaurant ID",
      });
    }

    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    if (
      restaurant.createdBy.toString() !== req.user.id &&
      !["admin", "super_admin"].includes(req.user.role)
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this restaurant",
      });
    }

    const allowedFields = [
      "name",
      "address",
      "famousFood",
      "foodType",
      "avgCostForOne",
      "bestTime",
      "isRecommended",
      "location",
    ];

    const updatedData = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updatedData[field] = req.body[field];
      }
    });

    //parse location
    if (req.body.location) {
      try {
        updatedData.location =
          typeof req.body.location === "string"
            ? JSON.parse(req.body.location)
            : req.body.location;
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid location format",
        });
      }
    }

    if (updatedData.location?.coordinates) {
      const existingRestaurant = await Restaurant.findOne({
        _id: { $ne: id },
        "location.coordinates": updatedData.location.coordinates,
      });

      if (existingRestaurant) {
        return res.status(409).json({
          success: false,
          message: "Another restaurant already exists at these coordinates",
        });
      }
    }

    if (req.files && req.files.length > 0) {
      try {
        const uploadPromises = req.files.map((file) =>
          uploadCloudinary(file.path, "Restaurant"),
        );

        const uploadResults = await Promise.all(uploadPromises);

        updatedData.images = uploadResults.map((result) => result.secure_url);

        // Delete local temp files
        req.files.forEach((file) => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      } catch (uploadError) {
        return res.status(500).json({
          success: false,
          message: "Image upload failed",
        });
      }
    }

    // 9️⃣ Update
    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      id,
      updatedData,
      {
        new: true,
        runValidators: true,
      },
    ).lean();

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

export const deleteResturant = async (req, res) => {};
