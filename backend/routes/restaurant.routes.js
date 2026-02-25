import express from "express"
import { authorize, isAuthenticated } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import { createResturant } from "../controllers/restaurant.controller.js";


const restaurantRouter = express.Router()

//private routes
restaurantRouter.post("/", isAuthenticated , authorize("admin"), upload.array("images", 5) , createResturant)

//public routes

export default restaurantRouter;