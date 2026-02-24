import { uploadCloudinary } from "../config/cloudinary.config.js";
import { City } from "../model/city.model.js";
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
        success: false,
        message: "All required fields are mandatory",
      });
    }

    //it will check city is active or not
    const exitingCity = await City.findOne({
      _id: city,
      status: "active",
    });

    if (!exitingCity) {
      return res.status(400).json({
        success: false,
        message: "Invalid or inactive city",
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

    //it will check if hotel is created at same place, means duplicate , if you find any problem to creating hotel you can comment this part of code then it works
    const existingHotel = await Hotel.findOne({
      "location.coordinates": location.coordinates,
    });

    if (existingHotel) {
      return res.status(400).json({
        success: false,
        message: "A hotel already exists at this location",
      });
    }

    const hotel = await Hotel.create({
      name,
      city,
      address,
      pricePerNight,
      facilities: facilitiesArray,
      images: imageUrls,
      location,
      status: "pending",
      // createdBy: req.user?._id,
    });
    console.log(hotel);

    return res.status(201).json({
      success: true,
      message: "Hotel created Successfully and pending approval",
      data: hotel,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Hotel already exists at this location",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getHotelbyid = async (req, res) => {
  try {
    const { id } = req.params;

    const hotel = await Hotel.findById(id).populate("city" , "name state")

    if (!hotel) {
      return res.status(400).json({
        success : false,
        message : "Hotel not found"
      })
    }

    return res.status(200).json({
      success: true,
      data: hotel,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//update is will handle by Admin.
export const updateHotel = async (req, res) => {
  try {
    const { id } = req.params;
    let updateData = { ...req.body };

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
      const existingHotel = await Hotel.findOne({
        _id: { $ne: id },
        "location.coordinates": updateData.location.coordinates,
      });

      if (existingHotel) {
        return res.status(409).json({
          success: false,
          message: "Another hotel already exists at this location",
        });
      }
    }

    if (req.files && req.files.length > 0) {
      let imageUrls = [];

      for (const file of req.files) {
        const uploadResult = await uploadCloudinary(file.path, "hotels");
        imageUrls.push(uploadResult.secure_url);

        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }

      updateData.images = imageUrls;
    }

    const updatehotel = await Hotel.findByIdAndUpdate(id, updateData, 
      { new: true, runValidators: true } //this is use to validate data
    );
    console.log(updatehotel);

    if (!updatehotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: updatehotel,
      message: "Hotel update successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteHotel = async (req, res) => {
  try {
    const { id } = req.params;

    const hotel = await Hotel.findByIdAndUpdate(
      id,
      { status: "inactive" },
      { new: true },
    );

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    if (hotel.status === "inactive") {
      return res.status(400).json({
        success: false,
        message: "Hotel is already inactive",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Hotel delete successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const approveHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        success : false,
        message: "Hotel not found" });
    }

    hotel.status = "active";
    hotel.approveBy = req.user?._id; // super admin
    await hotel.save();

    return res.json({ success: true, message: "Hotel approved" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const rejectHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    hotel.status = "rejected";
    hotel.approveBy = null;
    await hotel.save();

    return res.json({ success: true, message: "Hotel rejected" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getActiveHotels = async (req, res) => {
  try {
    const { cityId } = req.query;

    if (!cityId) {
      return res.status(400).json({
        success: false,
        message: "cityId is required",
      });
    }

    const hotels = await Hotel.find({
      city: cityId,
      status: "active",
    }).populate("city", "name state");

    return res.status(200).json({
      success: true,
      message: "Active hotels fetched successfully",
      data: hotels,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPendingHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find({status : "pending"})
  .populate("createdBy" , "userName email role")

  return res.status(200).json({
    success : true,
    data : hotels,
    count : hotels.length
  })
  } catch (error) {
    return res.status(500).json({
      success : false,
      message  : error.message
    })
  }
}