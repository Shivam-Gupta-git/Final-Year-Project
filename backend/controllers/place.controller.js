import fs from "fs";
import { uploadCloudinary } from "../config/cloudinary.config.js";
import { City } from "../model/city.model.js";
import { Place } from "../model/place.model.js";
import mongoose from "mongoose";

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

    //normalize text
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
    console.log(location);

    if (
      !name ||
      !cityId ||
      !description ||
      !category ||
      !timeRequired ||
      !entryfees ||
      !isPopular ||
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
    console.log(city);

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
    console.log(existingPlace);

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
      createdBy: req.user?._id,
    });
    console.log(place);

    return res.status(201).json({
      success: true,
      data: place,
      message: "place created successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

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

export const rejectPlace = async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);

    
    if (!place) {
      return res.status(404).json({ message: "place not found" });
    }

    place.status = "rejected";
    place.approveBy = null;
    await place.save();

    return res.json({ success: true, message: "place rejected" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const pendingPlace = async (req, res) => {
  try {
    const place = await Place.find({ status: "pending" }).populate(
      "createdBy",
      "userName email role",
    );

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

export const getActivePlace = async (req, res) => {
  try {
    const { cityId } = req.params;

    if (!cityId) {
      return res.status(400).json({
        success: false,
        message: "cityid not found",
      });
    }
    if (!mongoose.Types.ObjectId.isValid(cityId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid city ID",
      });
    }

    const place = await Place.find({
      city: cityId,
      status: "active",
    }).populate("city", "name state");

    return res.status(200).json({
      success: true,
      data: place,
      message: "get Active place successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

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
