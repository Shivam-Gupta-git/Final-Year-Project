import express from 'express'
import { activeRoom, createRoom, getAllRoomsByID, getPublicRoomsByHotel, getSingleRoom, inactiveRoom, updateRoom } from '../controllers/room.controller.js';
import { authorize, isAuthenticated } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/multer.middleware.js';



const roomRouter = express.Router()

roomRouter.post(
  "/create-room",
  isAuthenticated,
  authorize("admin", "super_admin"),
  upload.array("images", 5),
  createRoom
);

roomRouter.get(
  "/admin/rooms/:hotelId",
  isAuthenticated,
  authorize("admin", "super_admin"),
  getAllRoomsByID
);

roomRouter.get("/public/:hotelId", getPublicRoomsByHotel)

roomRouter.get(
  "/single-room/:roomId",
  isAuthenticated,
  authorize("admin", "super_admin"),
  getSingleRoom
);

roomRouter.put(
  "/update-room/:roomId",
  isAuthenticated,
  authorize("admin", "super_admin"),
  upload.array("images", 5),
  updateRoom
);

roomRouter.patch(
  "/active-room/:roomId",
  isAuthenticated,
  authorize("admin", "super_admin"),
  activeRoom
);
roomRouter.patch(
  "/inactive-room/:roomId",
  isAuthenticated,
  authorize("admin", "super_admin"),
  inactiveRoom
);

export default roomRouter