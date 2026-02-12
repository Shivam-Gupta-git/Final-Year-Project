import jwt from 'jsonwebtoken'
import { Admin } from '../model/admin.model.js';

export const isAuthenticated = async (req, res, next) => {
  try {
    const authHeaders = req.headers.authorization;
    if(!authHeaders || !authHeaders.startsWith('Bearer ')){
      return res.status(400).json({success: false, message: 'Authorization token is missing or Invalid'})
    }

    const token = authHeaders.split(" ")[1]
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SECRET_KET)
    } catch (error) {
      if(error.name === 'TokenExpiredError'){
        return res.status(400).json({success: false, message: 'your token has expired'})
      }
      return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
    }

    const { id } = decoded;
    const registeredAdmin = await Admin.findById(id)
    if(!registeredAdmin){
      return res
      .status(404)
      .json({ success: false, message: "user is not found" });
    }

    req.adminId = registeredAdmin._id;
    next()
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
} 