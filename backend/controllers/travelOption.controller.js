import { uploadCloudinary } from "../config/cloudinary.config.js";
import { TravelOption } from "../model/travelOption.model.js";
import { City } from "../model/city.model.js";

export const createTravelOptions = async (req, res) => {
  try {
    const adminId = req.user.id;
    if (!adminId) {
      return res
        .status(400)
        .json({ success: false, message: "admin not found" });
    }
    const {
      fromCity,
      toCity,
      toPlace,
      transportType,
      avgCost,
      timeRequired,
      isCheapest,
      isFastest,
      latitude,
      longitude,
    } = req.body;

    if (
      !fromCity ||
      !transportType ||
      !avgCost ||
      !timeRequired ||
      !latitude ||
      !longitude
    ) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    if (!toCity && !toPlace) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Either toCity or toPlace is required",
        });
    }

    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const upload = await uploadCloudinary(file.path, "travel-options");
        imageUrls.push(upload.secure_url);
      }
    }

    const location = {
      type: "Point",
      coordinates: [Number(longitude), Number(latitude)], // lng, lat
    };

    const travelOption = await TravelOption.create({
      fromCity,
      toCity: toCity || undefined,
      toPlace: toPlace || undefined,
      transportType,
      avgCost,
      timeRequired,
      isCheapest,
      isFastest,
      images: imageUrls,
      location,
      status: "pending",
      createdBy: adminId,
    });

    return res.status(201).json({
      success: true,
      message: "Travel option created (pending approval)",
      data: travelOption,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getApproveTravelOptions = async (req, res) => {
  try {
    const travelOptionId = req.params.id;
    if(!travelOptionId){
      return res.status(400).json({success: false, message: "Travel Options Id is required"})
    }

    const travelOption = await TravelOption.findOne({ travelOptionId })
    if(!travelOption){
      return res.status(400).json({success: false, message: 'travel Option is not found'})
    }

    travelOption.status = 'active'
    travelOption.approvedBy = req.user._id
    await travelOption.save()

    return res.status(200).json({success: true, message: "status approve successfully"})
  } catch (error) {
    return res.status(500).json({success: false, message: error.message})
  }
}

export const searchCityToCityTravelOptions = async (req, res) => {
  try {
    const { fromCity, toCity } = req.query;
    console.log(fromCity, toCity)

    if (!fromCity || !toCity) {
      return res.status(400).json({
        success: false,
        message: "fromCity and toCity are required",
      });
    }

    const fromCityName = fromCity.trim().toLowerCase();
    const toCityName = toCity.trim().toLowerCase();

    const fromCityDoc = await City.findOne({ name: fromCityName });
    const toCityDoc = await City.findOne({ name: toCityName });

    if (!fromCityDoc || !toCityDoc) {
      return res.status(404).json({
        success: false,
        message: "City not found",
      });
    }

    const travelOptions = await TravelOption.find({
      fromCity: fromCityDoc._id,
      toCity: toCityDoc._id,
      status: "active",
    })
      .populate("fromCity", "name state")
      .populate("toCity", "name state")
      .sort({ avgCost: 1 }); // cheapest first

    return res.status(200).json({
      success: true,
      count: travelOptions.length,
      data: travelOptions,
    });
  } catch (error) {
    console.error("City-to-city search error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getMyTravelOptions = async (req, res) => {
  try {
    const adminId = req.user.id;

    const travelOptions = await TravelOption.find({
      createdBy: adminId,
    })
      .populate("fromCity toCity toPlace")
      .sort({ createdAt: -1 });

    return res
      .status(200)
      .json({
        success: true,
        count: travelOptions.length,
        data: travelOptions,
      });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

