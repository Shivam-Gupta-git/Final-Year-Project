import mongoose from "mongoose";
import { uploadCloudinary } from "../config/cloudinary.config.js";
import { City } from "../model/city.model.js";
import fs from "fs";

//with the help of this we can create city
export const createCity = async (req, res) => {
  try {
    const {
      name,
      state,
      country,
      famousFor,
      description,
      bestTimeToVisit,
      avgDailyBudget,
    } = req.body;

    let location;
    try {
      location = JSON.parse(req.body.location);
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid location format",
      });
    }

    if (
      !name ||
      !state ||
      !country ||
      !famousFor ||
      !bestTimeToVisit ||
      !avgDailyBudget ||
      !location
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields are mandatory",
      });
    }

    let imageUrls = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadResult = await uploadCloudinary(file.path, "cities");
        imageUrls.push(uploadResult.secure_url);

        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
    }

    const exestingCity = await City.findOne({
      name: name.toLowerCase(),
      state: state.toLowerCase(),
    });
    if (exestingCity) {
      return res
        .status(400)
        .json({ success: false, message: "city already exist" });
    }

    const city = await City.create({
      name: name.toLowerCase(),
      state: state.toLowerCase(),
      country: country.toLowerCase(),
      description,
      famousFor,
      avgDailyBudget,
      images: imageUrls,
      location,
      bestTimeToVisit,
      status: "pending",
      // createdBy: req.user._id,
    });
    // console.log(city);

    return res.status(201).json({
      success: true,
      message: "City created successfully",
      data: city,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const approveCity = async (req, res) => {
  try {
    const city = await City.findById(req.params.id);

    

    if (!city) {
      return res.status(404).json({ message: "City not found" });
    }

    city.status = "active";
    city.approvedBy = req.user._id; //super admin id
    await city.save();

    return res.json({ success: true, message: "City approved" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const rejectCity = async (req, res) => {
  try {
    const city = await City.findById(req.params.id);

    

    if (!city) {
      return res.status(404).json({ message: "City not found" });
    }

    city.status = "rejected";
    city.approvedBy = null;
    await city.save();

    return res.json({ success: true, message: "City rejected" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getActiveCities = async (req, res) => {
  try {
    const cities = await City.find({ status: "active" });
    console.log("cities", cities);

    return res.status(200).json({
      success: true,
      message: "get active cities succcessfully",
      data: cities,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCityById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid city ID",
      });
    }

    const city = await City.findOne({
      _id: id,
      status: "active",
    });

    if (!city) {
      return res.status(404).json({
        success: false,
        message: "City not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: city,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateCity = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid city ID",
      });
    }

    let updatedata = { ...req.body };
    delete updatedata.status;
    delete updatedata.approvedBy;

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

    const updatedCity = await City.findByIdAndUpdate(id, updatedata, {
      returnDocument: "after",
      runValidators: true,
    });
    console.log(updatedCity);

    if (!updatedCity) {
      return res.status(404).json({
        success: false,
        message: "City not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "City updated successfully",
      data: updatedCity,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//access to admin also good for soft delete
export const deleteCity = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid city ID",
      });
    }

    const city = await City.findByIdAndUpdate(
      id,
      { status: "inactive" },
      { returnDocument: "after", runValidators: true },
    );

    if (!city) {
      return res.status(404).json({
        success: false,
        message: "City not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "City delete successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getNearbyCities = async (req, res) => {
  try {
    const { lng, lat, distance = 50000 } = req.query;

    const cities = await City.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [Number(lng), Number(lat)],
          },
          $maxDistance: Number(distance),
        },
      },
      status: "active",
    });

    return res.status(200).json({
      success: true,
      data: cities,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPendingCities = async (req, res) => {
  try {
    const cities = await City.find({ status: "pending" }).populate(
      "createdBy",
      "userName email role",
    );

    return res.status(200).json({
      success: true,
      data: cities,
      count: cities.length,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
