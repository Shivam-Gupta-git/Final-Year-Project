import { uploadCloudinary } from "../config/cloudinary.config.js";
import { User } from "../model/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { verifyEmail } from "../verifyEmail/verifyEmail.js";
import { UserSession } from "../model/userSession.model.js";
import { sendOtpMail } from "../verifyEmail/sendOtpMail.js";

export const userRegistration = async (req, res) => {
  try {
    const { userName, email, contactNumber, password } = req.body;

    if (
      [userName, email, contactNumber, password].some(
        (field) => !field || field.trim() === ""
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const userExistance = await User.findOne({ email });
    if (userExistance) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
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

    const newUser = await User.create({
      userName,
      email,
      contactNumber,
      password: hashedPassword,
      avatar: avatar.url,
      role: "user",
    });

    const token = jwt.sign({ id: newUser._id }, process.env.SECRET_KET, {
      expiresIn: "1d",
    });
    newUser.token = token;
    verifyEmail(email, token);

    console.log(token);

    await newUser.save();

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      adminId: newUser._id,
      data: newUser,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if ([email, password].some((f) => !f || f.trim() === "")) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const registeredUser = await User.findOne({
      email,
      role: "user",
    }).select("+password");

    if (!registeredUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, registeredUser.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password",
      });
    }

    if (!registeredUser.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Verify your account first",
      });
    }

    await UserSession.deleteMany({
      userId: registeredUser._id,
      role: "user",
    });

    await UserSession.create({
      userId: registeredUser._id,
      role: "user",
    });

    const accessToken = jwt.sign(
      { id: registeredUser._id },
      process.env.SECRET_KET,
      { expiresIn: "7d" }
    );

    const refreshToken = jwt.sign(
      { id: registeredUser._id },
      process.env.SECRET_KET,
      { expiresIn: "10d" }
    );

    registeredUser.isLoggedIn = true;
    await registeredUser.save();

    return res.status(200).json({
      success: true,
      message: `User logged in successfully`,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const userLogout = async (req, res) => {
  try {
    const userId = req.user.id;
    await UserSession.deleteMany({ userId: userId, role: "user" });

    await User.findByIdAndUpdate(
      userId,
      { isLoggedIn: false },
      { returnDocument: "after" }
    );
    return res
      .status(200)
      .json({ success: true, message: "user Logout successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if(!userId){
      return res.status(400).json({success: false, message:'Unauthorize user'})
    }

    const {userName, contactNumber} = req.body;
    const updateData = {}
    
    if(userName?.trim()) updateData.userName = userName;
    if(contactNumber?.trim()) updateData.contactNumber = contactNumber;

    if(req.files?.avatar?.[0]?.path){
      const avatar = await uploadCloudinary(req.files.avatar[0].path);
      if(!avatar){
        return res.status(400).json({success: false, message: 'Avatar upload failed'})
      }
      updateData.avatar.url;
    }

    if(Object.keys(updateData).length === 0){
      return res.status(400).json({success: false, message: 'Nothing is updated'})
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData,
    {returnDocument: 'after', runValidators: true}) ;

    if(!updatedUser){
      return res.status(400).json({status: false, message: 'User not found'})
    }

    return res.status(200).json({success: true, message: 'user profile successfully updated'})
  } catch (error) {
    return res.status(500).json({success: false, message: error.message})
  }
}

export const superAdminRegistration = async (req, res) => {
  try {
    const { userName, email, contactNumber, password } = req.body;

    if (
      [userName, email, contactNumber, password].some(
        (field) => !field || field.trim() === ""
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingSuperAdmin = await User.findOne({ role: "super_admin" });
    if (existingSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: "Super admin already exists",
      });
    }

    const userExistance = await User.findOne({ email });
    if (userExistance) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
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

    const newUser = await User.create({
      userName,
      email,
      contactNumber,
      password: hashedPassword,
      avatar: avatar.url,
      role: "super_admin",
    });

    const token = jwt.sign({ id: newUser._id }, process.env.SECRET_KET, {
      expiresIn: "1d",
    });
    newUser.token = token;
    verifyEmail(email, token);

    console.log(token);

    await newUser.save();

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      adminId: newUser._id,
      data: newUser,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const superAdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if ([email, password].some((f) => !f || f.trim() === "")) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const superAdmin = await User.findOne({
      email,
      role: "super_admin",
    });

    if (!superAdmin) {
      return res.status(404).json({
        success: false,
        message: "Super-admin not found",
      });
    }

    const isMatch = await bcrypt.compare(password, superAdmin.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password",
      });
    }

    if (!superAdmin.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Verify your account first",
      });
    }

    await UserSession.deleteMany({
      userId: superAdmin._id,
      role: "super_admin",
    });

    await UserSession.create({
      userId: superAdmin._id,
      role: "super_admin",
    });

    const accessToken = jwt.sign(
      { id: superAdmin._id },
      process.env.SECRET_KET,
      { expiresIn: "7d" }
    );

    const refreshToken = jwt.sign(
      { id: superAdmin._id },
      process.env.SECRET_KET,
      { expiresIn: "10d" }
    );

    superAdmin.isLoggedIn = true;
    await superAdmin.save();

    return res.status(200).json({
      success: true,
      message: "Super-admin logged in successfully",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const superAdminLogout = async (req, res) => {
  try {
    const superAdminId = req.user.id;

    await UserSession.deleteMany({
      userId: superAdminId,
      role: "super_admin",
    });

    await User.findByIdAndUpdate(
      superAdminId,
      { isLoggedIn: false },
      { returnDocument: "after" }
    );

    return res.status(200).json({
      success: true,
      message: "Super admin logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateSuperAdminProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if(!userId){
      return res.status(400).json({success: false, message: 'Unauthorized user'})
    }

    const { userName, contactNumber } = req.body;

    const updateData = {};

    if(userName?.trim()) updateData.userName = userName;
    if(contactNumber?.trim()) updateData.contactNumber = contactNumber;

    if(req.files?.avatar?.[0]?.path){
      const avatar = await uploadCloudinary(req.files.avatar[0].path)
      if(!avatar){
        return res.status(400).json({success: false, message: 'Avatar upload failed'})
      }
      updateData.avatar = avatar.url;
    }

    if(Object.keys(updateData).length === 0){
      return res.status(400).json({success: false, message:'Nothing to update'})
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {returnDocument:'after', runValidators: true})

    if(!updatedUser){
      return res.status(400).json({success: false, message: 'User not found'})
    }

    return res.status(200).json({success: true, message: 'Super Admin Profile updated successfully'})
  } catch (error) {
    return res.status(500).json({success: false, message: error.message})
  }
}

export const createAdminRegistration = async (req, res) => {
  try {
    const { userName, email, contactNumber, password } = req.body || {};

    if (
      [userName, email, contactNumber, password].some(
        (field) => !field || field.trim() === ""
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const userExistance = await User.findOne({ email });
    if (userExistance) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await User.create({
      userName,
      email,
      contactNumber,
      password: hashedPassword,
      avatar: null,
      role: "admin",
      isActive: false,
      isVerified: false,
    });

    return res.status(201).json({
      success: true,
      message: "Admin created. Awaiting super-admin approval.",
      adminId: admin._id,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if ([email, password].some((fields) => !fields || fields?.trim() === "")) {
      return res
        .status(400)
        .json({ success: false, message: "all fields must be required" });
    }

    const registredAdmin = await User.findOne({ email, role: "admin" }).select(
      "+password"
    );
    if (!registredAdmin) {
      return res
        .status(400)
        .json({ success: false, message: "admin not found" });
    }

    const checkPassword = await bcrypt.compare(
      password,
      registredAdmin.password
    );
    if (!checkPassword) {
      return res
        .status(400)
        .json({ success: false, message: "password Invalid" });
    }

    if (!registredAdmin.isVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Verify your account first" });
    }

    await UserSession.deleteMany({
      userId: registredAdmin._id,
      role: "admin",
    });

    await UserSession.create({
      userId: registredAdmin._id,
      role: "admin",
    });

    const accessToken = jwt.sign(
      { id: registredAdmin._id },
      process.env.SECRET_KET,
      { expiresIn: "10d" }
    );
    const refreshToken = jwt.sign(
      { id: registredAdmin._id },
      process.env.SECRET_KET,
      { expiresIn: "14d" }
    );

    registredAdmin.isLoggedIn = true;
    await registredAdmin.save();

    return res
      .status(200)
      .json({
        success: true,
        message: "admin login successfully",
        accessToken,
        refreshToken,
      });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const adminLogout = async (req, res) => {
  try {
    await UserSession.deleteOne({
      userId: req.user.id,
      role: "admin",
    });

    await User.findByIdAndUpdate(
      req.user.id,
      { isLoggedIn: false },
      { returnDocument: "after" }
    );

    return res.status(200).json({
      success: true,
      message: "admin logout successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateAdminProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if(!userId){
      return res.status(400).json({success: false, message: 'Unauthorize User'})
    }

    const { userName, contactNumber } = req.body;

    const updateData = {};

    if(userName?.trim()) updateData.userName = userName;
    if(contactNumber?.trim()) updateData.contactNumber = contactNumber;

    if(req.files?.avatar?.[0]?.path){
      const avatar = await uploadCloudinary(req.files.avatar[0].path)
      if(!avatar){
        return res.status(400).json({success: false, message:'Avatar upload failed'})
      }
      updateData.avatar = avatar.url;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {returnDocument:"after", runValidators: true})

    if(!updatedUser){
      return res.status(400).json({success: false, message: 'admin profile not updated'})
    }

    return res.status(200).json({success: true, message: 'admin profile update successfully'})
  } catch (error) {
    return res.status(500).json({success: false, message: error.message})
  }
}

export const approveAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;

    const admin = await User.findById(adminId);

    if (!admin || admin.role !== "admin") {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    admin.isActive = true;
    admin.isVerified = true;

    await admin.save();

    res.status(200).json({
      success: true,
      message: "Admin approved successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const userVerification = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(400).json({
        success: false,
        message: "Authorization token is missing or Invalid",
      });
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SECRET_KET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(400).json({
          success: false,
          message: "this registration token has expired",
        });
      }
      return res
        .status(400)
        .json({ success: false, message: "token verification is failed" });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "user not found" });
    }

    (user.token = null), (user.isVerified = true);
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "user verification successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const forgotUserPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(402)
        .json({ success: false, message: "email filed must be required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(402)
        .json({ success: false, message: "user not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expOTP = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.expOTP = expOTP;
    await user.save();

    await sendOtpMail(email, otp);
    return res
      .status(200)
      .json({ success: true, message: "forgotAdminPassword successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyUserOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    const email = req.params.email;

    if (!otp) {
      return res
        .status(400)
        .json({ success: false, message: "otp is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "user not found" });
    }

    if (!user || !user.expOTP) {
      return res.status(400).json({
        success: false,
        message: "OTP not generated or allready vieified",
      });
    }

    if (user.expOTP < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP is expired. please generate a new one",
      });
    }

    if (otp !== user.otp) {
      return res.status(400).json({ success: false, message: "Invalid otp" });
    }

    user.otp = null;
    user.expOTP = null;

    await user.save();
    return res
      .status(200)
      .json({ success: true, message: "OTP verification successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { email } = req.params;
    const { newPassword, confirmPassword } = req.body;

    if([newPassword, confirmPassword].some((fields) => !fields || fields?.trim() === "")){
      return res.status(400).json({success: false, message: "all fields mush be required"})
    }

    if(newPassword !== confirmPassword){
      return res.status(400).json({success: false, message: "both password are not same"})
    }

    const user = await User.findOne({ email })
    if(!user){
      return res.status(400).json({success: false, message: "user not found"})
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({success: true, message: "password change successfully"})
  } catch (error) {
    return res.status(500).json({success: false, message: error.message})
  }
}

export const userChangePassword = async (req, res) => {
try {
    const userId = req.user.id;
    const { oldPassword, newPassword, confirmPassword } = req.body;
  
    if([oldPassword, newPassword, confirmPassword].some((fields) => !fields || fields?.trim() === "")){
      return res.status(200).json({success: false, message: "all fields must be required"})
    }

    if(newPassword !== confirmPassword){
      return res.status(400).json({success: false, message: "both password are not matched"})
    }

    const user = await User.findOne( userId ).select("+password")
    if(!user){
      return res.status(400).json({success: false, message: 'user not found'})
    }

    const checkPassword = await bcrypt.compare(oldPassword, user.password);
    if(!checkPassword){
      return res.status(400).json({success: false, message: "old password is Incorrect"})
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await user.save();
    return res.status(200).json({success: false, message: 'password change successfully'})
} catch (error) {
  return res.status(500).json({success: false, message: error.message})
}
}

export const updateUserLocation = async (req, res) => {
  try {
    const userId = req.user?.id;
    if(!userId){
      return res.status(400).json({success: false, message: 'User Unauthorize'})
    }

    const { latitude, longitude, city, state, country, address } = req.body;

    if(!latitude && !city){
      return res.status(400).json({success: false, message: 'Provide latitude/longitude or city'})
    }

    const updateData = {};
    if(latitude && longitude){
      updateData.location = {
        type: 'Point',
        coordinates:[longitude, latitude],
        city,
        state,
        country,
        address
      }
    }else{
      updateData.location = {city, state, country, address}
    }

    const user = await User.findByIdAndUpdate(userId, updateData, {returnDocument: 'after', runValidators: true})
    if(!user){
      return res.status(400).json({success: false, message: 'Location updated failed'})
    }

    return res.status(200).json({success: true, message: 'Location updated successfully', location: user.location})
  } catch (error) {
    return res.status(500).json({success: false, message: error.message})
  }
}

export const findNearbyAdmins = async (req, res) => {
  try {
    const { latitude, longitude, distance = 10 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "latitude and longitude are required"
      });
    }

    const admins = await User.find({
      role: "admin",
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [
              Number(latitude),
              Number(longitude)
            ]
          },
          $maxDistance: distance * 1000 // km → meters
        }
      }
    });

    res.status(200).json({
      success: true,
      count: admins.length,
      admins
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

