// import mongoose from "mongoose";
// import { Hotel } from "../model/hotel.model";
// import { HotelBooking } from "../model/hotelBooking.model";

// export const checkAvailability = async (req, res) => {
//   try {
//     const {hotelId , checkIn , checkOut , guests} = req.body;

//     if (!hotelId || !checkIn || !checkOut) {
//       return res.status(400).json({
//         success: false,
//         message: "hotelId, checkIn and checkOut are required",
//       })
//     }

//     if (!mongoose.Types.ObjectId.isValid(hotelId)) {
//       return res.status(404).json({
//         success: false,
//         message: "Invalid hotelId",
//       })
//     }

//     const checkInDate = new Date(checkIn);
//     const checkOutDate = new Date(checkOut);
//     if (checkInDate >= checkOutDate) {
//       return res.status(400).json({
//         success: false,
//         message: "Check-out date must be after check-in date",
//       });
//     }

//     if (checkInDate < new Date()) {
//       return res.status(400).json({
//         success: false,
//         message: "Check-in date cannot be in the past",
//       });
//     }

//     const hotel = await Hotel.findById(hotelId)
//     if (!hotel || hotel.status !== "active") {
//       return res.status(404).json({
//         success: false,
//         message: "Hotel not found or not active",
//       });
//     }

//     if (guests && guests > hotel.maxGuestsPerRoom) {
//       return res.status(400).json({
//         success: false,
//         message: `Maximum ${hotel.maxGuestsPerRoom} guests allowed per room`,
//       });
//     }

//     const conflictBooking = await HotelBooking.countDocuments({
//       hotel : hotelId,
//       bookingStatus : "confirmed",
//       checkIn : { $It : checkOutDate},
//       checkOut : { $gt : checkInDate}
//     });

//     const availableRooms = hotel.totalRooms - conflictBooking
//     if (availableRooms < 0) {
//       return res.status(200).json({
//         success: true,
//         available: false,
//         availableRooms: 0,
//       });
//     }

//     const nights = (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24);
//     const totalAmount = nights * hotel.pricePerNight;

//     return res.status(200).json({
//       success : true,
//       available : true,
//       availableRooms,
//       nights,
//       pricePerNight : hotel.pricePerNight,
//       totalAmount,
//     })

//   } catch (error) {
//     return res.status(500).json({
//       success : false,
//       message : error.message
//     })
//   }
// }

// export const createBooking = async (req, res) => {}

// export const confirmBookingAfterPayment = async (req, res) => {}

// export const cancelBooking = async (req, res) => {}

// export const getMyBookings = async (req, res) => {}

// export const getSingleBooking = async (req, res) => {}