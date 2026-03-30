import { Hotel } from "../model/hotel.model.js";
import { Room } from "../model/room.model.js";
import { uploadCloudinary } from "../config/cloudinary.config.js";

export const createRoom = async (req, res) => {
  try {
    // console.log("Controller reached");
    // console.log("Logged Admin:", req.user?.id);

    const {
      hotelId,
      roomType,
      pricePerNight,
      capacity,
      totalRooms,
      amenities,
      description,
    } = req.body;

    // ---------- BASIC VALIDATION ----------
    if (!hotelId || !roomType || !pricePerNight || !capacity || !totalRooms) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    // ---------- NUMBER CONVERSION ----------
    const price = Number(pricePerNight);
    const cap = Number(capacity);
    const total = Number(totalRooms);

    if (price <= 0 || cap <= 0 || total <= 0) {
      return res.status(400).json({
        success: false,
        message: "Values must be greater than zero",
      });
    }

    // ---------- HOTEL CHECK ----------
    const hotel = await Hotel.findById(hotelId);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    // console.log("Hotel Owner:", hotel.createdBy.toString());

    // ---------- OWNERSHIP CHECK ----------
    if (req.user.role === "admin" && !hotel.createdBy.equals(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "You cannot add room in other admin hotel",
      });
    }

    // ---------- HOTEL ACTIVE ----------
    if (hotel.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Hotel must be active to add rooms",
      });
    }

    // ---------- DUPLICATE ROOM ----------
    const existingRoom = await Room.findOne({ hotelId, roomType });

    if (existingRoom) {
      return res.status(409).json({
        success: false,
        message: "This room type already exists",
      });
    }

    // ---------- AMENITIES ----------
    const amenitiesArray =
      typeof amenities === "string"
        ? amenities.split(",").map((a) => a.trim())
        : amenities || [];

    // ---------- IMAGE UPLOAD ----------
    let imageUrls = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          console.log("Uploading:", file.path);

          const upload = await uploadCloudinary(file.path, "rooms");

          if (!upload?.secure_url) {
            throw new Error("Cloudinary upload failed");
          }

          imageUrls.push(upload.secure_url);
        } catch (err) {
          console.log("Cloudinary Error:", err.message);
          return res.status(500).json({
            success: false,
            message: "Image upload failed",
          });
        }
      }
    }

    // ---------- CREATE ROOM ----------
    const room = await Room.create({
      hotelId,
      roomType,
      pricePerNight: price,
      capacity: cap,
      totalRooms: total,
      amenities: amenitiesArray,
      description,
      images: imageUrls,
      status: "pending",
      createdBy: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: "Room created successfully",
      data: room,
    });
  } catch (error) {
    console.log("CREATE ROOM ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllRoomsByID = async (req, res) => {
  try {
    const { hotelId } = req.params;

    // check hotel exists
    const hotel = await Hotel.findById(hotelId);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    // ADMIN OWNERSHIP CHECK
    if (
      req.user.role === "admin" &&
      !hotel.createdBy.equals(req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot view rooms of other admin hotel",
      });
    }

    const rooms = await Room.find({ hotelId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: rooms.length,
      data: rooms,
    });

  } catch (error) {
    console.log("GET ROOMS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getPublicRoomsByHotel = async (req, res) => {
  try {
    const { hotelId } = req.params;

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ success: false, message: "Hotel not found" });
    }

    const rooms = await Room.find({ hotelId, status: "active" })
      .sort({ pricePerNight: 1 });

    return res.status(200).json({
      success: true,
      data: rooms,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getSingleRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    res.status(200).json({
      success: true,
      data: room,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const {
      roomType,
      pricePerNight,
      capacity,
      totalRooms,
      amenities,
      description,
      status,
    } = req.body;

    // Find room
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // Find hotel
    const hotel = await Hotel.findById(room.hotelId);

    // ADMIN OWNERSHIP CHECK
    if (
      req.user.role === "admin" &&
      !hotel.createdBy.equals(req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot update other admin room",
      });
    }

    // ENUM VALIDATION SAFE
    const allowedTypes = ["standard", "deluxe", "suite", "family"];
    if (roomType && !allowedTypes.includes(roomType.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "Invalid room type",
      });
    }

    // Amenities convert
    const amenitiesArray =
      typeof amenities === "string"
        ? amenities.split(",").map((a) => a.trim())
        : amenities;

    // IMAGE UPLOAD
    let imageUrls = room.images;

    if (req.files?.length > 0) {
      imageUrls = [];
      for (const file of req.files) {
        const upload = await uploadCloudinary(file.path, "rooms");
        imageUrls.push(upload.secure_url);
      }
    }

    // UPDATE
    room.roomType = roomType || room.roomType;
    room.pricePerNight = pricePerNight || room.pricePerNight;
    room.capacity = capacity || room.capacity;
    room.totalRooms = totalRooms || room.totalRooms;
    room.amenities = amenitiesArray || room.amenities;
    room.description = description || room.description;
    room.status = status || room.status;
    room.images = imageUrls;

    await room.save();

    return res.status(200).json({
      success: true,
      message: "Room updated successfully",
      data: room,
    });

  } catch (error) {
    console.log("UPDATE ROOM ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const activeRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    if (!roomId) {
      return res.status(400).json({
        success: false,
        message: "Room ID is required",
      });
    }

    // Find the room
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // Mark room as inactive
    room.status = "active";
    await room.save();

    return res.status(200).json({
      success: true,
      message: "Room has been deactivated successfully",
      data: room,
    });
  } catch (error) {
    console.error("INACTIVATE ROOM ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const inactiveRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    if (!roomId) {
      return res.status(400).json({
        success: false,
        message: "Room ID is required",
      });
    }

    // Find the room
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // Mark room as inactive
    room.status = "inactive";
    await room.save();

    return res.status(200).json({
      success: true,
      message: "Room has been deactivated successfully",
      data: room,
    });
  } catch (error) {
    console.error("INACTIVATE ROOM ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};