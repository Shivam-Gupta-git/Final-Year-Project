import express from "express";
import {
  createHotel,
  deleteHotel,
  getHotelbyid,
  getHotelsByCity,
  updateHotel,
} from "../controllers/hotel.controller.js";
import { upload } from "../middleware/multer.middleware.js";

const hotelRouter = express.Router();

hotelRouter.post("/", upload.array("images", 5), createHotel);
hotelRouter.get("/", getHotelbyid);
hotelRouter.get("/:id", getHotelsByCity);
hotelRouter.put("/:id", upload.array("images", 5), updateHotel);
hotelRouter.delete("/:id", deleteHotel);

export default hotelRouter;
  