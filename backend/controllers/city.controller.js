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
      status
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
      !location ||
      !status
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

    const city = await City.create({
      name,
      state,
      country,
      description,
      famousFor,
      avgDailyBudget,
      images: imageUrls,
      location,
      bestTimeToVisit,
      status
    });
    console.log(city);

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

    const city = await City.findById(id);

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

    let updatedata = {...req.body}

    if (req.body.location) {
      try {
        updatedata.location = JSON.parse(req.body.location)
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid location format",
        });
      }
    }

    const updatedCity = await City.findByIdAndUpdate(id, updatedata ,{
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

//access to admin also
export const deleteCity = async (req, res) => {
  try {
    const { id } = req.params;

    const city = await City.findByIdAndUpdate(
      id,
      { status: "inactive" },
      { new: true },
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
