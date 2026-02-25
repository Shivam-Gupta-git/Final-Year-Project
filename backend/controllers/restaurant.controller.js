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
