import express from "express"
import { bookRoom, getRoomAvailability } from "../controllers/hotelBooking.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";

const hotelBookingRouter = express.Router();

hotelBookingRouter.get("/availability/:hotelId", getRoomAvailability)
hotelBookingRouter.post("/bookRoom",isAuthenticated, bookRoom)



export default hotelBookingRouter;