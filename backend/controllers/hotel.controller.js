import mongoose from "mongoose";
import { uploadCloudinary } from "../config/cloudinary.config.js";
import { City } from "../model/city.model.js";
import { Hotel } from "../model/hotel.model.js";
import fs from "fs";
import { Place } from "../model/place.model.js";

export const createHotel = async (req, res) => {
  try {
    const { name, city, address, description, facilities } = req.body;

    let location;
    try {
      location = JSON.parse(req.body.location);
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid location format",
      });
    }

    if (!name || !city || !address || !location) {
      return res.status(400).json({
        success: false,
        message: "All required fields are mandatory",
      });
    }

    const existingCity = await City.findOne({
      _id: city,
      status: "active",
    });

    if (!existingCity) {
      return res.status(400).json({
        success: false,
        message: "Invalid or inactive city",
      });
    }

    const existingHotel = await Hotel.findOne({ name, city });

    if (existingHotel) {
      return res.status(409).json({
        success: false,
        message: "Hotel already exists in this city",
      });
    }

    const facilitiesArray =
      typeof facilities === "string"
        ? facilities.split(",").map((f) => f.trim())
        : facilities || [];

    let imageUrls = [];

    if (req.files?.length > 0) {
      for (const file of req.files) {
        const uploadResult = await uploadCloudinary(file.path, "hotels");
        imageUrls.push(uploadResult.secure_url);
        // fs.unlinkSync(file.path);
      }
    }

    const hotel = await Hotel.create({
      name,
      city,
      address,
      description,
      facilities: facilitiesArray,
      images: imageUrls,
      location,
      status: "pending",
      createdBy: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: "Hotel created & pending approval",
      data: hotel,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getHotelbyid = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Hotel ID",
      });
    }

    const hotel = await Hotel.findById(id).populate("city", "name state");

    if (!hotel) {
      return res.status(400).json({
        success: false,
        message: "Hotel not found",
      });
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid hotel ID",
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

    const updatehotel = await Hotel.findByIdAndUpdate(
      id,
      updateData,

      { new: true, runValidators: true }, //this is use to validate data

      { new: true, runValidators: true } //this is use to validate data

    )
      .populate("city")
      .populate("createdBy", "name email");
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
    console.log(id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "inavlid id",
      });
    }

    const deletedHotel = await Hotel.findByIdAndDelete(id);

    if (!deletedHotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
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
        success: false,
        message: "Hotel not found",
      });
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
    let filter = { status: "active" };
    if (req.user.role === "admin") {
      // admin → only own hotels
      filter.createdBy = req.user.id;
    }

    if (req.user.role === "user") {
      // user → only approved active hotels
      filter.isApproved = true;
    }

    const hotels = await Hotel.find(filter)
      .populate("city", "name state")
      .populate("createdBy", "name email");

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

export const getHotelsByStatus = async (req, res) => {
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
        createdBy: req.user.id,
        ...(status && { status }),
      };
    }

    const hotels = await Hotel.find(filter).populate("city");

    return res.status(200).json({
      success: true,
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
    const hotels = await Hotel.find({ status: "pending" })
      .populate("city", "name state country")
      .populate("createdBy", "name email");

    return res.status(200).json({
      success: true,
      data: hotels,
      count: hotels.length,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find().populate("city", "name state country");
    if (!hotels.length) {
      return res.status(404).json({
        success: false,
        message: "No hotels found",
      });
    }

    return res.status(200).json({
      success: true,
      data: hotels,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const inactiveHotel = async (req, res) => {
  try {
    const hotelId = req.params.id;
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res
        .status(400)
        .json({ success: false, message: "hotel not found" });
    }

    // ADMIN → only own hotel
    if (
      req.user.role === "admin" &&
      hotel.createdBy.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot inactive other admin hotels",
      });
    }

    hotel.status = "inactive";
    hotel.approvedBy = null;
    await hotel.save();

    return res
      .status(200)
      .json({ success: true, message: "hotel inactive successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getInactiveHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find({ status: "inactive" });
    return res
      .status(200)
      .json({ success: true, message: "get Inactive Hotels", data: hotels });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getRejectedHotel = async (req, res) => {
  try {
    const hotel = await Hotel.find({ status: "rejected" });
    return res
      .status(200)
      .json({ success: true, message: "get rejected hotel", data: hotel });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getPublicActiveHotels = async (req, res) => {
  try {
    const { city } = req.query; // ← read city from ?city=Delhi


    let query = { status: "active" };

    if (city && city.trim()) {
      const cityDoc = await City.findOne({
        name: { $regex: city.trim(), $options: "i" }, // case-insensitive match
      });

      if (!cityDoc) {
        return res.status(200).json({ success: true, data: [] }); // no match = empty
      }

      query.city = cityDoc._id; // filter hotels by city id
    }

    const hotels = await Hotel.find(query).populate("city", "name state");

    res.status(200).json({ success: true, data: hotels });

    res.status(200).json({
      success: true,
      data: hotels,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const inactiveHotelByAdmin = async (req, res) => {
  try {
    const hotelId = req.params.id;
    
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    // ownership check
    if (hotel.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only inactive your own hotel",
      });
    }

    // status validation
    if (hotel.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Only active hotel can be inactivated",
      });
    }

    hotel.status = "inactive";
    hotel.approvedBy = null;
    await hotel.save();



    return res.status(200).json({
      success: true,
      message: "Hotel inactivated successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
