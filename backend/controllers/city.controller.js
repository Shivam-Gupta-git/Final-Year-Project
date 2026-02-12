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

    const location = JSON.parse(req.body.location);

    if (
      !name ||
      !state ||
      !country ||
      !famousFor ||
      !bestTimeToVisit ||
      !avgDailyBudget ||
      !location
    ) {
      throw new Error("Bad request");
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

export const getActiveCities = async (req , res) => {
  try {
    const cities = await City.find({status : "active"})
    console.log("cities", cities);
    
    return res
    .status(200)
    .json({
      success : true,
      message : "get active cities succcessfully",
      data : cities
    })
  } catch (error) {
    return res
    .status(500)
    .json({
      success : false,
      message : error.message
    })
  }
}
