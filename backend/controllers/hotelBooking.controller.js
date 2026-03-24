import mongoose from "mongoose";
import { HotelBooking } from "../model/hotelBooking.model.js";
import { Room } from "../model/room.model.js";
import { City } from "../model/city.model.js";
import { Hotel } from "../model/hotel.model.js";

export const getRoomAvailability = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { checkIn, checkOut } = req.query;

    if (!checkIn || !checkOut) {
      return res.status(400).json({ message: "checkIn and checkOut required" });
    }

    const rooms = await Room.find({
      hotelId: hotelId, // as string
      status: "active",
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
      }),
    );

    res.json(availability);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getRoomsAvailabilityBulk = async (req, res) => {
  try {
    const { hotelIds, checkIn, checkOut } = req.query;

    if (!hotelIds) {
      return res
        .status(400)
        .json({ success: false, message: "hotelIds required" });
    }

    const ids = hotelIds.split(",").filter(Boolean);
    const checkInDate = checkIn ? new Date(checkIn) : new Date();
    const checkOutDate = checkOut
      ? new Date(checkOut)
      : new Date(Date.now() + 86400000);

    const result = {};

    await Promise.all(
      ids.map(async (hotelId) => {
        // Is hotel ke saare active rooms fetch karo
        const rooms = await Room.find({ hotelId: hotelId, status: "active" });

        if (rooms.length === 0) {
          result[hotelId] = 0;
          return;
        }

        // Is date range mein overlap karne wali bookings
        const bookings = await HotelBooking.find({
          hotel: hotelId,
          bookingStatus: { $in: ["pending", "confirmed"] },
          checkIn: { $lt: checkOutDate },
          checkOut: { $gt: checkInDate },
        });

        // Total rooms - booked rooms = available
        const totalRooms = rooms.reduce(
          (sum, r) => sum + (r.totalRooms || 0),
          0,
        );
        const bookedRooms = bookings.reduce(
          (sum, b) => sum + (b.bookedRooms || 0),
          0,
        );

        const maxCapacity =
          rooms.length > 0 ? Math.max(...rooms.map((r) => r.capacity || 2)) : 2;

        result[hotelId] = {
          availableRooms: Math.max(0, totalRooms - bookedRooms),
          maxCapacityPerRoom: maxCapacity,
        };
      }),
    );

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getFilterCounts = async (req, res) => {
  try {
    const { city } = req.query;

    let matchQuery = { status: "active" };

    if (city && city.trim()) {
      const cityDoc = await City.findOne({
        name: { $regex: city.trim(), $options: "i" },
      });
      if (cityDoc) matchQuery.city = cityDoc._id;
    }

    const hotels = await Hotel.find(matchQuery).select(
      "pricePerNight facilities starCategory",
    );

    // Price counts
    const price = {
      "0-2500": 0,
      "2500-5000": 0,
      "5000-7000": 0,
      "7000-10000": 0,
      "10000+": 0,
    };
    hotels.forEach((h) => {
      const p = h.pricePerNight || 0;
      if (p < 2500) price["0-2500"]++;
      else if (p < 5000) price["2500-5000"]++;
      else if (p < 7000) price["5000-7000"]++;
      else if (p < 10000) price["7000-10000"]++;
      else price["10000+"]++;
    });

    // Amenity counts
    const amenityKeys = ["wifi", "pool", "parking", "restaurant", "spa", "gym"];
    const amenities = {};
    amenityKeys.forEach((key) => {
      amenities[key] = hotels.filter((h) =>
        (h.facilities || []).some((f) => f.toLowerCase().includes(key)),
      ).length;
    });

    // Star counts
    const stars = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    hotels.forEach((h) => {
      if (h.starCategory >= 1 && h.starCategory <= 5) {
        stars[h.starCategory]++;
      }
    });

    return res.status(200).json({
      success: true,
      data: { total: hotels.length, price, amenities, stars },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const bookRoom = async (req, res) => {
  try {
    const {
      hotelId,
      roomType,
      bookedRooms,
      checkIn,
      checkOut,
      guests,
      totalAmount,
    } = req.body;

    // --- Basic input validation ---
    if (
      !hotelId ||
      !roomType ||
      !bookedRooms ||
      !checkIn ||
      !checkOut ||
      !guests ||
      !totalAmount
    ) {
      return res
        .status(400)
        .json({ message: "All booking details are required" });
    }

    if (bookedRooms <= 0 || guests <= 0) {
      return res
        .status(400)
        .json({ message: "Number of rooms and guests must be greater than 0" });
    }

    if (new Date(checkIn) >= new Date(checkOut)) {
      return res
        .status(400)
        .json({ message: "Check-in must be before check-out" });
    }

    // --- Fetch room and validate hotel ---
    const room = await Room.findById(roomType);
    if (!room) return res.status(404).json({ message: "Room not found" });

    if (room.hotelId.toString() !== hotelId) {
      return res
        .status(400)
        .json({ message: "Room does not belong to this hotel" });
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

    return res
      .status(201)
      .json({ message: "Booking created successfully", booking });
  } catch (err) {
    console.error("Booking error:", err);
    return res.status(500).json({ message: "Server error: " + err.message });
  }
};

export const searchHotels = async (req, res) => {
  try {
    const { city, checkIn, checkOut, rooms, adults, children, stars } =
      req.query;

    let query = { status: "active" };

    if (city && city.trim()) {
      const cityDoc = await City.findOne({
        name: { $regex: city.trim(), $options: "i" },
      });
      if (!cityDoc) {
        return res.status(200).json({ success: true, data: [], totalCount: 0 });
      }
      query.city = cityDoc._id;
    }

    if (stars) {
      const starList = stars
        .split(",")
        .map(Number)
        .filter((n) => n >= 1 && n <= 5);
      if (starList.length > 0) {
        query.starCategory = { $in: starList };
      }
    }

    const hotels = await Hotel.find(query)
      .populate("city", "name state")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: hotels,
      totalCount: hotels.length,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getBookingsByHotel = async (req, res) => {
  try {
    const { hotelId } = req.params;

    const bookings = await HotelBooking.find({ hotel: hotelId })
      .populate("user", "name email")
      .populate("roomType", "roomType pricePerNight");

    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { bookingStatus } = req.body;

    const booking = await HotelBooking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.bookingStatus = bookingStatus;
    await booking.save();

    res.json({
      success: true,
      message: "Booking status updated",
      data: booking,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;

    const bookings = await HotelBooking.find({ user: userId })
      .populate("hotel", "name")
      .populate("roomType", "roomType pricePerNight")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    console.log("BookId: ", bookingId);

    const booking = await HotelBooking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Only user can cancel their booking
    if (booking.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Prevent cancelling already cancelled
    if (booking.bookingStatus === "cancelled") {
      return res.status(400).json({ message: "Already cancelled" });
    }

    booking.bookingStatus = "cancelled";
    await booking.save();

    res.json({
      success: true,
      message: "Booking cancelled successfully",
      data: booking,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
