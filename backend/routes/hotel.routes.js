import express from "express";
import {
  createHotel,
  deleteHotel,
  getActiveHotels,
  getAllHotels,
  getHotelbyid,
  getInactiveHotels,
  updateHotel,
} from "../controllers/hotel.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { authorize, isAuthenticated } from "../middleware/auth.middleware.js";

const hotelRouter = express.Router();

//private routes
hotelRouter.post("/create-hotel",isAuthenticated, authorize("admin") , upload.array("images", 5), createHotel);
hotelRouter.put("/:id",isAuthenticated, authorize("admin"), upload.array("images", 5), updateHotel);
hotelRouter.delete("/delete-hotel/:id",isAuthenticated, authorize("super_admin"), deleteHotel);
hotelRouter.get("/get-all-Inactive-hotels", isAuthenticated, authorize("super_admin"), getInactiveHotels)


//public routes 
hotelRouter.get("/activehotel", getActiveHotels)
hotelRouter.get("/get-all-hotels", getAllHotels)
hotelRouter.get("/:id", getHotelbyid);
export default hotelRouter;
  