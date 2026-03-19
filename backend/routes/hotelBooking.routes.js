import express from "express"
import { bookRoom, cancelBooking, getBookingsByHotel, getMyBookings, getRoomAvailability, updateBookingStatus } from "../controllers/hotelBooking.controller.js";
import { authorize, isAuthenticated } from "../middleware/auth.middleware.js";

const hotelBookingRouter = express.Router();

// user - get availability
hotelBookingRouter.get("/availability/:hotelId", getRoomAvailability)

// user - post book rooms
hotelBookingRouter.post("/bookRoom",isAuthenticated, bookRoom)

// user - get my bookings
hotelBookingRouter.get("/my-bookings", isAuthenticated, getMyBookings);

// user - cancel booking
hotelBookingRouter.put("/cancel/:bookingId", isAuthenticated, cancelBooking);

// Admin - get all bookings
hotelBookingRouter.get("/admin/:hotelId", isAuthenticated, authorize("admin"), getBookingsByHotel);

// Admin - update booking status
hotelBookingRouter.put("/status/:bookingId", isAuthenticated, authorize("admin"), updateBookingStatus);



export default hotelBookingRouter;