import express from "express"
import { isAuthenticated, authorize } from "../middleware/auth.middleware.js";
import { createPlace } from "../controllers/place.controller.js";
import { upload } from "../middleware/multer.middleware.js";

const placeRouter = express.Router();

placeRouter.post("/", isAuthenticated, authorize("admin"), upload.array("images" , 5), createPlace)

export default placeRouter;