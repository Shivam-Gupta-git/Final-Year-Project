import { uploadCloudinary } from "../config/cloudinary.config.js";
import { Admin } from "../model/admin.model.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { verifyEmail } from "../verifyEmail/verifyEmail.js";
import { AdminSession } from "../model/adminSession.model.js";

export const adminRegistration = async (req, res) => {
  try {
    const { adminName, email, contactNumber, password, role } = req.body;

    if (
      [adminName, email, contactNumber, password, role].some(
        (field) => !field || field.trim() === ""
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const adminExistance = await Admin.findOne({ email });
    if (adminExistance) {
      return res.status(400).json({
        success: false,
        message: "Admin already exists",
      });
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    if (!avatarLocalPath) {
      return res.status(400).json({
        success: false,
        message: "Avatar file is required",
      });
    }

    const avatar = await uploadCloudinary(avatarLocalPath);
    if (!avatar) {
      return res.status(400).json({
        success: false,
        message: "Failed to upload avatar",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await Admin.create({
      adminName,
      email,
      contactNumber,
      password: hashedPassword,
      avatar: avatar.url,
      role,
    });

    const token = jwt.sign({id: newAdmin._id}, process.env.SECRET_KET, {expiresIn: '1d'});
    newAdmin.token = token;
    verifyEmail(email, token);

    console.log(token);
    

    await newAdmin.save();


    return res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      adminId: newAdmin._id,
      data: newAdmin
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const adminVerification = async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if(!authHeader || !authHeader.startsWith('Bearer ')){
      return res.status(400).json({success: false, message: 'Authorization token is missing or Invalid'})
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SECRET_KET)
    } catch (error) {
      if(error.name === 'TokenExpiredError'){
        return res.status(400).json({success: false, message: 'this registration token has expired'})
      }
      return res.status(400).json({success: false, message: 'token verification is failed'})
    }

    const admin = await Admin.findById(decoded.id)
    if(!admin){
      return res.status(400).json({success: false, message: 'admin not found'})
    }

    admin.token = null,
    admin.isVerified = true
    await admin.save();

    return res.status(200).json({success: true, message:'admin verification successfully'})
  } catch (error) {
    return res.status(500).json({success: false, message: error.message})
  }
}

export const adminLogin = async (req, res) => {
try {
    const {email, password} = req.body;
  
    if([email, password].some((fields) => !fields || fields?.trim() === '')){
      return res.status(400).json({success: false, message: 'all fields must be required !'})
    }
  
    const registeredAdmin = await Admin.findOne({email});
    if(!registeredAdmin){
      return res.status(400).json({success: false, message: "Admin is not exist"})
    }
  
    const checkAdminPassword = await bcrypt.compare(password, registeredAdmin.password);
    if(!checkAdminPassword){
      return res.status(400).json({success: false, message: 'Incorrect Password'})
    }
  
    if(registeredAdmin.isVerified !== true){
      return res.status(400).json({success: false, message: "admin is not verified. go and verify your account first."})
    }
  
    const existingSession = await AdminSession.findOne({ adminId: registeredAdmin._id })
    if(existingSession){
      await AdminSession.deleteOne({ adminId: registeredAdmin._id })
    }
  
    await AdminSession.create({ adminId: registeredAdmin._id })
  
    const accessToken = jwt.sign({id: registeredAdmin._id}, process.env.SECRET_KET, {expiresIn: '7d'})
  
    const refreshToken = jwt.sign({id: registeredAdmin._id}, process.env.SECRET_KET, {expiresIn: '10d'})
  
    registeredAdmin.isLoggedIn = true;
    await registeredAdmin.save();

    return res.status(200).json({success: true, message:`admin login successfully ${registeredAdmin.adminName}`,registeredAdmin, accessToken, refreshToken })
} catch (error) {
  return res.status(500).json({success: false, message: error.message})
}}

export const adminLogout = async (req, res) => {
try {
    const adminId = req.adminId;
    await AdminSession.deleteMany({ adminId })
  
    await Admin.findByIdAndUpdate(adminId, {isLoggedIn: false}, {new: true});
    return res.status(200).json({success: true, message: "Admin Logout successfully"})
} catch (error) {
  return res.status(500).json({success: false, message: error.message})
}
}