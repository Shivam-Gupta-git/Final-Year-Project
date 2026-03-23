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
  getSuperAdminProfile,
  getAllAdmins,
  getAdminProfile,
} from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { approveCity, getPendingCities, inactiveCity, rejectCity } from "../controllers/city.controller.js";
import { approveHotel, getPendingHotels, getRejectedHotel, inactiveHotel, inactiveHotelByAdmin, rejectHotel } from "../controllers/hotel.controller.js";
import { approvePlace, inactivePlace, pendingPlace, rejectPlace } from "../controllers/place.controller.js";
import { allPendingResturant, approveResturant, rejectResturant } from "../controllers/restaurant.controller.js";
import { approveTravelOptions, getPendingTravelOptions, rejectTravelOption } from "../controllers/travelOption.controller.js";
import { approveReview, rejectReview } from "../controllers/review.controller.js";

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

// get Super Admin Profile
adminRouter.get("/superAdmin-profile", isAuthenticated, getSuperAdminProfile)

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

// get all admins
adminRouter.get("/getAllAdmins", isAuthenticated, authorize("super_admin"), getAllAdmins)

// Verification of Admin Account by Super Admin
adminRouter.patch(
  "/approve-admin/:adminId",
  isAuthenticated,
  authorize("super_admin"),
  approveAdmin
);

// get admin Profile
adminRouter.get("/admin-profile", isAuthenticated, getAdminProfile)


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
adminRouter.patch("/review/:id/approve" , isAuthenticated , authorize("super_admin"), approveReview)

//reject 
adminRouter.patch("/city/:id/reject", isAuthenticated, authorize("super_admin"), rejectCity)
adminRouter.patch("/hotel/:id/reject", isAuthenticated, authorize("super_admin"), rejectHotel)
adminRouter.patch("/place/:id/reject", isAuthenticated , authorize("super_admin"), rejectPlace)
adminRouter.patch("/resturant/:id/reject", isAuthenticated, authorize("super_admin"), rejectResturant)
adminRouter.patch("/travel-options/:id/reject", isAuthenticated, authorize("super_admin"), rejectTravelOption)
adminRouter.patch("/review/:id/reject", isAuthenticated, authorize("super_admin"), rejectReview)

//get pending cities
adminRouter.get("/cities/pending", isAuthenticated, authorize("super_admin"), getPendingCities)
adminRouter.get("/hotels/pending", isAuthenticated, authorize("super_admin"), getPendingHotels)
adminRouter.get("/places/pending", isAuthenticated, authorize("super_admin"), pendingPlace)
adminRouter.get("/travel-options", isAuthenticated, authorize("super_admin"), getPendingTravelOptions)
adminRouter.get("/resturant/pending", isAuthenticated , authorize("super_admin"), allPendingResturant)

// inactive by superAdmin......
// SuperAdmin - inactiveCity
adminRouter.patch("/city/:id/inactive", isAuthenticated, authorize("super_admin"), inactiveCity)

// SuperAdmin - inactiveHotel
adminRouter.patch("/hotel/:id/inactive", isAuthenticated, authorize("super_admin"), inactiveHotel)

// SuperAdmin - inactivePlace
adminRouter.patch("/place/:id/inactive",isAuthenticated, authorize("super_admin"), inactivePlace)


// inactive by admin
adminRouter.patch("/adminhotel/:id/inactive", isAuthenticated, authorize("admin"), inactiveHotelByAdmin)

// get rejected hotels
adminRouter.get("/hotels/rejected", isAuthenticated, authorize("super_admin"), getRejectedHotel)

export { adminRouter };
