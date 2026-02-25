import express from "express";
import { isAuthenticated, authorize } from "../middleware/auth.middleware.js";
import {
  superAdminRegistration,
  superAdminLogin,
  superAdminLogout,
  adminLogin,
  adminLogout,
  approveAdmin,
  createAdminRegistration,
  updateSuperAdminProfile,
  updateAdminProfile,
} from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { approveCity, getPendingCities, rejectCity } from "../controllers/city.controller.js";
import { approveHotel, getPendingHotels, rejectHotel } from "../controllers/hotel.controller.js";
import { approvePlace, pendingPlace, rejectPlace } from "../controllers/place.controller.js";
import { approveResturant, rejectResturant } from "../controllers/restaurant.controller.js";
import { approveTravelOptions, pendingTravelOptions, rejectTravelOption } from "../controllers/travelOption.controller.js";

const adminRouter = express.Router();

// Super Admin Registration
adminRouter.post(
  "/super-admin-registration",
  upload.fields([{ name: "avatar", maxCount: 1 }]),
  superAdminRegistration
);
// Login Super Admin
adminRouter.post("/super-admin-login", superAdminLogin);

// Logout Super Admin
adminRouter.delete(
  "/super-admin-logout",
  isAuthenticated,
  authorize("super_admin"),
  superAdminLogout
);

// update Super Admin Profile
adminRouter.put(
  "/update-super-admin-profile",
  isAuthenticated,
  authorize("super_admin"),
  upload.fields([{ name: "avatar", maxCount: 1 }]),
  updateSuperAdminProfile
);

// admin registration by Super Admin
adminRouter.post(
  "/admin-registration",
  isAuthenticated,
  authorize("super_admin"),
  createAdminRegistration
);

// Verification of Admin Account by Super Admin
adminRouter.patch(
  "/approve-admin/:adminId",
  isAuthenticated,
  authorize("super_admin"),
  approveAdmin
);

// Logout admin
adminRouter.post("/admin-login", adminLogin);
adminRouter.delete(
  "/admin-logout",
  isAuthenticated,
  authorize("admin"),
  adminLogout
);

// update admin profile
adminRouter.put(
  "/update-admin-profile",
  isAuthenticated,
  authorize("admin"),
  upload.fields([{ name: "avatar", maxCount: 1 }]),
  updateAdminProfile
);

//approved 
adminRouter.patch("/city/:id/approve", isAuthenticated, authorize("super_admin"),  approveCity)
adminRouter.patch("/hotel/:id/approve", isAuthenticated, authorize("super_admin"), approveHotel)
adminRouter.patch("/place/:id/approve", isAuthenticated, authorize("super_admin"), approvePlace)
adminRouter.patch("/resturant/:id/approve", isAuthenticated , authorize("super_admin"), approveResturant)
adminRouter.patch("/travel-options/:id/approve", isAuthenticated, authorize("super_admin"), approveTravelOptions)

//reject 
adminRouter.patch("/city/:id/reject", isAuthenticated, authorize("super_admin"), rejectCity)
adminRouter.patch("/hotel/:id/reject", isAuthenticated, authorize("super_admin"), rejectHotel)
adminRouter.patch("/place/:id/reject", isAuthenticated , authorize("super_admin"), rejectPlace)
adminRouter.patch("/resturant/:id/reject", isAuthenticated, authorize("super_admin"), rejectResturant)
adminRouter.patch("/travel-options/:id/reject", isAuthenticated, authorize("super_admin"), rejectTravelOption)

//get pending cities
adminRouter.get("/cities/pending", isAuthenticated, authorize("super_admin"), getPendingCities)
adminRouter.get("/hotels/pending", isAuthenticated, authorize("super_admin"), getPendingHotels)
adminRouter.get("/place/pending", isAuthenticated, authorize("super_admin"), pendingPlace)
adminRouter.get("/travel-options", isAuthenticated, authorize("super_admin"), pendingTravelOptions)

export { adminRouter };
