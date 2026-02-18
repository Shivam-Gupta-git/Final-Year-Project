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

export { adminRouter };
