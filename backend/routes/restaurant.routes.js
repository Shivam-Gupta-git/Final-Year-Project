import express from "express"
import { authorize, isAuthenticated } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import { allAciveResturant, createRestaurant, deleteResturant, getActiveRestaurant, getRestaurantStatus, getResturantbyID, inactiveRestaurantByAdmin, updateResturant } from "../controllers/restaurant.controller.js";


const restaurantRouter = express.Router()

//private routes...

// ADMIN - CREATE RESTAURANT 
restaurantRouter.post("/create-restaurent", isAuthenticated , authorize("admin"), upload.array("images", 5) ,createRestaurant)

// ADMIN - GET ACTIVE ADMIN'S RESTAURANT
restaurantRouter.get("/activeRestaurant",isAuthenticated, getActiveRestaurant)

// ADMIN - INACTIVE RESTAURANT BY ADMIN
restaurantRouter.patch("/:id/inactiveByAdmin", isAuthenticated, authorize("admin"), inactiveRestaurantByAdmin)

// ADMIN  - GET RESTAURANT STATUS
restaurantRouter.get("/get-restaurant-status", isAuthenticated, authorize("admin"), getRestaurantStatus)

// ADMIN || SUPERADMIN - GET RESTAURANT BYID
restaurantRouter.get("/getresturant/:id", getResturantbyID)

// ADMIN - UPDATE RESTAURANT
restaurantRouter.put("/updateresturant/:id", isAuthenticated , authorize("admin"), upload.array("images", 5), updateResturant)

// SUPERADMIN - DELETE RESTAURANT
restaurantRouter.delete("/delete/:id", isAuthenticated, authorize("admin"), deleteResturant)

//public routes
restaurantRouter.get("/restaurant/:cityId" , allAciveResturant)



export default restaurantRouter;