import { Driver } from "../model/driver.model.js";
import bcrypt from 'bcrypt'
import { User } from "../model/user.model.js";


export const createDriver = async (req, res) => {
  try {

    const body = req.body || {};
    const { userName, email, contactNumber, password, vehicleType } = body;

    if (!userName || !email || !contactNumber || !password || !vehicleType) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Driver already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      userName,
      email,
      contactNumber,
      password: hashedPassword,
      role: "driver",
      status: "pending",
      createdBy: req.user.id,
    });

    const driver = await Driver.create({
      userId: user._id,
      vehicleType,
      createdBy: req.user.id,
      location: {
        type: "Point",
        coordinates: [0, 0],
      },
    });

    return res.status(201).json({
      success: true,
      message: "Driver created successfully",
      driver,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyDrivers = async (req, res) => {
  try {
    const adminId = req.user.id;
    if(!adminId){
      return res.status(400).json({succes: false, message: "admin id is wrong"})
    }

    const drivers = await Driver.find({ createdBy: adminId }).populate("userId", "userName email contactNumber status");

    res.status(200).json({
      success: true,
      total: drivers.length,
      drivers
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

export const driverLogin = async (req, res) => {}



export const goOnline = async (req, res) => {
try {
    const driver = await Driver.findOne({ userId: req.user.id });
    driver.isOnline = true;
    await driver.save();
    return res(200).json({ success: true, message: "Driver is online" });
} catch (error) {
  return res.status(200).json({succes: 500, message: error.message})
}};


export const goOffline = async (req, res) => {
try {
    const driver = await Driver.findOne({ userId: req.user.id });
    driver.isOnline = false;
    await driver.save();
    return res(200).json({ success: true, message: "Driver is offline" });
} catch (error) {
  return res(500).json({succes: false, message: error.message})
}};

export const updateDriverLocation = async (req, res) => {
try {
    const { latitude, longitude } = req.body;
  
    if (!latitude || !longitude) {
      return res.status(400).json({ success: false, message: "Coordinates required" });
    }
  
    await Driver.findOneAndUpdate(
      { userId: req.user.id },
      {
        location: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
      }
    );
  
    return res(200).json({ success: true, message: "Location updated" });
} catch (error) {
  return res.status(500).json({succes: false, message: error.message})
}};

export const findNearByDriver = async (req, res) => {
  try {
    const { longitude, latitude } = req.body;

    const drivers = await Driver.find({
      isOnline: true,
      isOnRide: false,
      location:{
        $near: {
          $geometry:{
            type: "Point",
            coordinates: [longitude, latitude]
          },
          $maxDistance: 5000 // 5km
        }
      }
    }).populate("userId", "userName contactNumber")
    return res(200).json({success: true, data: drivers})
  } catch (error) {
    return res.status(500).json({success: false, message: error.message})
  }
}