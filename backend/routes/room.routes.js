import express from 'express'
import { activeRoom, createRoom, getAllRoomsByID, getSingleRoom, inactiveRoom, updateRoom } from '../controllers/room.controller.js';
import { authorize, isAuthenticated } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/multer.middleware.js';


const roomRouter = express.Router()

roomRouter.post(
  "/create-room",
  isAuthenticated,
  authorize("admin"),
  upload.array("images", 5),
  createRoom
);

roomRouter.get(
  "/admin/rooms/:hotelId",
  isAuthenticated,
  authorize("admin"),
  getAllRoomsByID
);

roomRouter.get(
  "/single-room/:roomId",
  isAuthenticated,
  authorize("admin"),
  getSingleRoom
);

roomRouter.put(
  "/update-room/:roomId",
  isAuthenticated,
  authorize("admin"),
  upload.array("images", 5),
  updateRoom
);

roomRouter.patch("/active-room/:roomId", isAuthenticated, authorize("admin"), activeRoom);
roomRouter.patch("/inactive-room/:roomId", isAuthenticated, authorize("admin"), inactiveRoom);

export default roomRouter