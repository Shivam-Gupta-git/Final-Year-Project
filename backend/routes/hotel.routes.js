import express from "express";
import {
  createHotel,
  deleteHotel,
  getActiveHotels,
  getHotelbyid,
  updateHotel,
} from "../controllers/hotel.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { authorize, isAuthenticated } from "../middleware/auth.middleware.js";

const hotelRouter = express.Router();

//private routes
hotelRouter.post("/",isAuthenticated, authorize("admin") , upload.array("images", 5), createHotel);
hotelRouter.put("/:id",isAuthenticated, authorize("admin"), upload.array("images", 5), updateHotel);
hotelRouter.delete("/:id",isAuthenticated, authorize("admin"), deleteHotel);


//public routes 
hotelRouter.get("/:id", getHotelbyid);
hotelRouter.get("/activehotel/:cityid", getActiveHotels)
export default hotelRouter;
  