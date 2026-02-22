import { uploadCloudinary } from "../config/cloudinary.config.js";
import { City } from "../model/city.model.js";
import { Place } from "../model/place.model.js";
import fs from "fs"

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
      location = JSON.parse(req.body.location)
    } catch (error) {
      return res.status(400).json({
        success : false,
        message : "Inavalid location format"
      })
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
        success : false,
        message : "All fields are required"
      })
    }

    //verify city
    const city = await City.findOne({ _id : cityId , status : "active"})
    if (!city) {
      return res.status(400).json({
        success : false,
        message : "wrong city id"
      })
    }
    console.log(city);
    

    //verify place by city
    const existingPlace = await Place.findOne({
      name,
      cityId
    })
    if (existingPlace) {
      return res.status(409).json({
        success : false,
        message : "Place is already exits in this city "
      })
    }
    console.log(existingPlace);
    
    //privent location duplicate
    const exitinglocation = await Place.findOne({
      "location.coordinates" : location.coordinates
    })
    if (exitinglocation) {
      return res.status(409).json({
        success: false,
        message: "A place already exists at this location"
      });
    }

    let imageUrl = [];
    if (req.files?.length) {
      for(const file of req.files){
        const result = await uploadCloudinary(file.path, "places")
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
      cityId,
      description,
      isPopular,
      bestTimeToVisit,
      entryfees,
      category,
      timeRequired,
      images : imageUrl,
      location,
      status : "pending",
      createdBy : req.user?._id
    })
    console.log(place);
    
    return res.status(201).json({
      success : true,
      data : place,
      success : "place created successfully"
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const approvePlace = async (req, res) => {
  
}