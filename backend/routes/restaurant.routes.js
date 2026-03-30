import express from "express"
import { authorize, isAuthenticated } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import { allAciveResturant, createRestaurant, deleteResturant, getActiveRestaurant, getAdminRestaurant, getAllActiveRestaurantCityWise, getAllActiveRestaurantsForUser, getAllInActiveRestaurantCityWise, getAllRejectedRestaurantCityWise, getAllRestaurantCityWise, getNearbyRestaurants, getRestaurantStatus, getResturantbyID, inactiveRestaurantByAdmin, updateResturant } from "../controllers/restaurant.controller.js";


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

// SUPERADMIN - GET ALL RESTAURANT CITY WISE
restaurantRouter.get("/restaurant-cityWise", isAuthenticated, authorize("super_admin"), getAllRestaurantCityWise)

// SUPERADMIN - GET ALL ACTIVE RESTAURANT CITY WISE
restaurantRouter.get("/active-restaurant-cityWise", isAuthenticated, authorize("super_admin"), getAllActiveRestaurantCityWise)

// SUPERADMIN - GET ALL INACTIVE RESTAURANT CITY WISE
restaurantRouter.get("/inactive-restaurant-cityWise", isAuthenticated, authorize("super_admin"), getAllInActiveRestaurantCityWise)

// SUPERADMIN - GET ALL REJECTED RESTAURANT CITY WISE
restaurantRouter.get("/rejected-restaurant-cityWise", isAuthenticated, authorize("super_admin"), getAllRejectedRestaurantCityWise)

// SUPERADMIN - DELETE RESTAURANT
restaurantRouter.delete("/delete/:id", isAuthenticated, authorize("super_admin"), deleteResturant)

// SUPERADMIN - GET ACTIVE RESTAURANT FOR A SPECIFIC ADMIN
restaurantRouter.get("/admin/:adminId/restaurant", isAuthenticated, authorize("super_admin"), getAdminRestaurant);

// USER - GET ALL ACTIVE RESTAURANT FOR USER
restaurantRouter.get("/restaurants", getAllActiveRestaurantsForUser);

// GET NEARBY RESTAURANTS (optional auth; lat/lng query for immediate "near me")
restaurantRouter.get("/nearby", getNearbyRestaurants);

//public routes
restaurantRouter.get("/restaurant/:cityId" , allAciveResturant)



export default restaurantRouter;