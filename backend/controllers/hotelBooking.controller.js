
import mongoose from "mongoose";
import { HotelBooking } from "../model/hotelBooking.model.js";
import { Room } from "../model/room.model.js";



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

export const getRoomAvailability = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { checkIn, checkOut } = req.query;

    if (!checkIn || !checkOut) {
      return res.status(400).json({ message: "checkIn and checkOut required" });
    }

    const rooms = await Room.find({
      hotelId: hotelId, // as string
      status: "active"
    });

    console.log("hotelId param:", hotelId);
    console.log("Rooms found:", rooms);

    const availability = await Promise.all(
      rooms.map(async (room) => {
        const bookings = await HotelBooking.find({
          roomType: room._id,
          bookingStatus: { $in: ["pending", "confirmed"] },
          $and: [
            { checkIn: { $lt: new Date(checkOut) } },
            { checkOut: { $gt: new Date(checkIn) } },
          ],
        });

        const bookedRooms = bookings.reduce((acc, b) => acc + b.bookedRooms, 0);

        return {
          ...room._doc,
          availableRooms: room.totalRooms - bookedRooms,
        };
      })
    );

    res.json(availability);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const bookRoom = async (req, res) => {
  try {
    const { hotelId, roomType, bookedRooms, checkIn, checkOut, guests, totalAmount } = req.body;

    // --- Basic input validation ---
    if (!hotelId || !roomType || !bookedRooms || !checkIn || !checkOut || !guests || !totalAmount) {
      return res.status(400).json({ message: "All booking details are required" });
    }

    if (bookedRooms <= 0 || guests <= 0) {
      return res.status(400).json({ message: "Number of rooms and guests must be greater than 0" });
    }

    if (new Date(checkIn) >= new Date(checkOut)) {
      return res.status(400).json({ message: "Check-in must be before check-out" });
    }

    // --- Fetch room and validate hotel ---
    const room = await Room.findById(roomType);
    if (!room) return res.status(404).json({ message: "Room not found" });

    if (room.hotelId.toString() !== hotelId) {
      return res.status(400).json({ message: "Room does not belong to this hotel" });
    }

    // --- Check existing bookings for this room ---
    const bookings = await HotelBooking.find({
      roomType,
      bookingStatus: { $in: ["pending", "confirmed"] },
      $and: [
        { checkIn: { $lt: new Date(checkOut) } },
        { checkOut: { $gt: new Date(checkIn) } },
      ],
    });

    const alreadyBooked = bookings.reduce((acc, b) => acc + b.bookedRooms, 0);

    if (alreadyBooked + bookedRooms > room.totalRooms) {
      return res.status(400).json({ message: "Not enough rooms available" });
    }

    // --- Create booking ---
    const booking = await HotelBooking.create({
      user: req.user.id,
      hotel: hotelId,
      roomType,
      bookedRooms,
      checkIn,
      checkOut,
      guests,
      totalAmount,
      paymentStatus: "pending",
      bookingStatus: "pending",
    });

    return res.status(201).json({ message: "Booking created successfully", booking });

  } catch (err) {
    console.error("Booking error:", err);
    return res.status(500).json({ message: "Server error: " + err.message });
  }
}