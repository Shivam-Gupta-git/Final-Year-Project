import express from "express"
import { createHotel } from "../controllers/hotel.controller.js";
import { upload } from "../middleware/multer.middleware.js";

const hotelRouter = express.Router();

hotelRouter.post("/" , upload.array("images" , 5), createHotel)

export default hotelRouter;