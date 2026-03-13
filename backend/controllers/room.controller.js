import { Hotel } from "../model/hotel.model.js";
import { Room } from "../model/room.model.js";


export const createRoom = async (req, res) => {
  try {
    const {
      hotelId,
      roomType,
      pricePerNight,
      capacity,
      totalRooms,
      amenities,
      description,
    } = req.body;

    // validation
    if (
      !hotelId ||
      !roomType ||
      !pricePerNight ||
      !capacity ||
      !totalRooms
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    // check hotel exists
    const hotel = await Hotel.findById(hotelId);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    // prevent duplicate room type
    const existingRoom = await Room.findOne({
      hotelId,
      roomType,
    });

    if (existingRoom) {
      return res.status(409).json({
        success: false,
        message: "This room type already exists for this hotel",
      });
    }

    const amenitiesArray =
      typeof amenities === "string"
        ? amenities.split(",").map((a) => a.trim())
        : amenities || [];

    const room = await Room.create({
      hotelId,
      roomType,
      pricePerNight,
      capacity,
      totalRooms,
      amenities: amenitiesArray,
      description,
      createdBy: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: "Room created successfully",
      data: room,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};