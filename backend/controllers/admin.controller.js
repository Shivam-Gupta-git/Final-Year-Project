import { uploadCloudinary } from "../config/cloudinary.config.js";
import { Admin } from "../model/admin.model.js";
import bcrypt from 'bcrypt'

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

    res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      adminId: newAdmin._id,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};