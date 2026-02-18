import { uploadCloudinary } from "../config/cloudinary.config.js";
import { Hotel } from "../model/hotel.model.js";
import fs from "fs";

export const createHotel = async (req, res) => {
  try {
    const { name, city, address, pricePerNight, facilities } = req.body;

    let location;
    try {
      location = JSON.parse(req.body.location);
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid location format",
      });
    }

    if (!name || !city || !address || !pricePerNight || !location) {
      return res.status(400).json({
        success: "false",
        message: "All required fields are mandatory",
      });
    }

    const facilitiesArray =
      typeof facilities === "string"
        ? facilities.split(",").map((f) => f.trim())
        : facilities || [];

    let imageUrls = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadResult = await uploadCloudinary(file.path, "hotels");
        imageUrls.push(uploadResult.secure_url);

        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
    }

    const hotel = await Hotel.create({
      name,
      city,
      address,
      pricePerNight,
      facilities : facilitiesArray,
      images: imageUrls,
      location,
    });
    console.log(hotel);

    return res.status(201).json({
      success: true,
      message: "Hotel created Successfully",
      data: hotel,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
