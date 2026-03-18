import express from "express";
import {
  createHotel,
  deleteHotel,
  getActiveHotels,
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

//private routes
hotelRouter.post("/create-hotel",isAuthenticated, authorize("admin") , upload.array("images", 5), createHotel);
hotelRouter.put("/updateHotel/:id",isAuthenticated, authorize("admin"), upload.array("images", 5), updateHotel);
hotelRouter.delete("/delete-hotel/:id",isAuthenticated, authorize("super_admin"), deleteHotel);
hotelRouter.get("/get-all-Inactive-hotels", isAuthenticated, authorize("super_admin"), getInactiveHotels)
hotelRouter.get("/get-hotel-by-id/:id",isAuthenticated, authorize("admin"), getHotelbyid);
hotelRouter.get("/activehotel",isAuthenticated, getActiveHotels)
hotelRouter.get("/get-all-hotels",isAuthenticated, getAllHotels)
hotelRouter.get("/get-hotel-status", isAuthenticated, authorize("admin"), getHotelsByStatus)

//public routes 
hotelRouter.get("/public/hotels", getPublicActiveHotels)
export default hotelRouter;
  