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
} from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";

const adminRouter = express.Router();

adminRouter.post(
  "/super-admin-registration",
  upload.fields([{ name: "avatar", maxCount: 1 }]),
  superAdminRegistration
);
adminRouter.post("/super-admin-login", superAdminLogin);
adminRouter.delete(
  "/super-admin-logout",
  isAuthenticated,
  authorize("super_admin"),
  superAdminLogout
);

adminRouter.post(
  "/admin-registration",
  isAuthenticated,
  authorize("super_admin"),
  createAdminRegistration
);
adminRouter.patch(
  "/approve-admin/:adminId",
  isAuthenticated,
  authorize("super_admin"),
  approveAdmin
);
adminRouter.post("/admin-login", adminLogin);
adminRouter.delete(
  "/admin-logout",
  isAuthenticated,
  authorize("admin"),
  adminLogout
);

export { adminRouter };
