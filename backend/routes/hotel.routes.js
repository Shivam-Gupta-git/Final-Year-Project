import express from "express";
import {
  createHotel,
  deleteHotel,
  getActiveHotels,
  getAdminHotels,
  getAllHotels,
  getHotelbyid,
  getHotelsByStatus,
  getInactiveHotels,
  getPublicActiveHotels,
  updateHotel,
} from "../controllers/hotel.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { authorize, isAuthenticated } from "../middleware/auth.middleware.js";

const hotelRouter = express.Router();

//private routes....
// ADMIN - CREATE HOTEL
hotelRouter.post("/create-hotel",isAuthenticated, authorize("admin") , upload.array("images", 5), createHotel);

// ADMIN - UPDATE HOTEL
hotelRouter.put("/updateHotel/:id",isAuthenticated, authorize("admin"), upload.array("images", 5), updateHotel);

// SUPERADMIN - DELETE HOTEL
hotelRouter.delete("/delete-hotel/:id",isAuthenticated, authorize("super_admin"), deleteHotel);

// SUPERADMIN - GET ALL INACTIVE HOTEL
hotelRouter.get("/get-all-Inactive-hotels", isAuthenticated, authorize("super_admin"), getInactiveHotels)

// GET HOTEL BY ID
hotelRouter.get("/get-hotel-by-id/:id",isAuthenticated, authorize("admin"), getHotelbyid);

// ADMIN || SUPERADMIN - GET ACTIVE HOTELS
hotelRouter.get("/activehotel",isAuthenticated, getActiveHotels)

// SUPERADMIN - GET ALL HOTELS
hotelRouter.get("/get-all-hotels",isAuthenticated, getAllHotels)

// ADMIN  - GET HOTEL BY STATUS
hotelRouter.get("/get-hotel-status", isAuthenticated, authorize("admin", "super_admin"), getHotelsByStatus)

// SUPERADMIN - GET ADMIN'S HOTELS
// Only superadmin can access
hotelRouter.get("/admin/:adminId/hotels", isAuthenticated, authorize("super_admin"), getAdminHotels);

//public routes 
hotelRouter.get("/public/hotels", getPublicActiveHotels)
export default hotelRouter;
  