import { Driver } from "../model/driver.model.js";
import bcrypt from 'bcrypt'
import { User } from "../model/user.model.js";


export const createDriver = async (req, res) => {
  try {
    const { name, email, phone, vehicleType, latitude, longitude } = req.body;

    if (!name || !email || !phone || !vehicleType || !latitude || !longitude) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }

    const driverExistance = await Driver.findOne({ email })

    if(driverExistance){
      return res.status(400).json({succes: false, message: "drive already exists"})
    }

    const tempPassword = "Driver@123"; // later auto-generate
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const user = await User.create({
      userName: name ,
      email,
      contactNumber: phone,
      password: hashedPassword,
      role: "driver",
      isVerified: true
    })

    const driver = await Driver.create({
      userId: user._id,
      vechalType,
      location:{
        type: "Point",
        coordinates: [longitude, latitude]
      }
    })

    return res(200).json({succes: true, message: "Driver Created", loginPassword: tempPassword, data: driver})

  } catch (error) {
    console.error(error);
    return res.status(500).json({succes: false, message: error.message})
  }
}

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