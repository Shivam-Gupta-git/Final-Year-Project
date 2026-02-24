import express from "express"
import { isAuthenticated, authorize } from "../middleware/auth.middleware.js";
import { createPlace, getActivePlace } from "../controllers/place.controller.js";
import { upload } from "../middleware/multer.middleware.js";

const placeRouter = express.Router();

placeRouter.post("/", isAuthenticated, authorize("admin"), upload.array("images" , 5), createPlace)

//public
placeRouter.get("/getactive" ,  getActivePlace)

export default placeRouter;