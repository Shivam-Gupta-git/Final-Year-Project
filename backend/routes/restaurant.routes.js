import express from "express"
import { authorize, isAuthenticated } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import { allAciveResturant, createResturant, deleteResturant, getResturantbyID, updateResturant } from "../controllers/restaurant.controller.js";


const restaurantRouter = express.Router()

//private routes
restaurantRouter.post("/", isAuthenticated , authorize("admin"), upload.array("images", 5) , createResturant)
restaurantRouter.put("/updateresturant/:id", isAuthenticated , authorize("admin"), upload.array("images", 5), updateResturant)
restaurantRouter.delete("/delete/:id", isAuthenticated, authorize("admin"), deleteResturant)

//public routes
restaurantRouter.get("/restaurant/:cityid" , allAciveResturant)
restaurantRouter.get("/getresturant/:id", getResturantbyID)


export default restaurantRouter;