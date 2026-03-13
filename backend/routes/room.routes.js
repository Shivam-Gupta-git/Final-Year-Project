import express from 'express'
import { createRoom } from '../controllers/room.controller.js';
import { authorize, isAuthenticated } from '../middleware/auth.middleware.js';

const roomRouter = express.Router()

roomRouter.post(
  "/create-room",
  isAuthenticated,
  authorize("admin"),
  createRoom
);

export default roomRouter