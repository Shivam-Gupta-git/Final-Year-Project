import express from "express"
import { isAuthenticated, authorize } from "../middleware/auth.middleware.js";
import { createPlace, getActivePlace, getplacebyid, updatePlace } from "../controllers/place.controller.js";
import { upload } from "../middleware/multer.middleware.js";

const placeRouter = express.Router();

placeRouter.post("/", isAuthenticated, authorize("admin"), upload.array("images" , 5), createPlace)
placeRouter.put("/updatedata/:id", isAuthenticated, authorize("admin"), upload.array("images" , 5), updatePlace)

//public
placeRouter.get("/cities/:cityId/places" ,  getActivePlace)
placeRouter.get("/getplace/:id", getplacebyid)

export default placeRouter;