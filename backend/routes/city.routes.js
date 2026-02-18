import express from "express";
import {
  createCity,
  getActiveCities,
  getCityById,
  updateCity,
  deactivateCity,
  getNearbyCities,
} from "../controllers/city.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const cityRouter = express.Router();

/* ------------ ADMIN ROUTES ------------ */

// Admin creates city
cityRouter.post(
  "/", upload.array("images", 5),//whenever you use multer here you can remove this upload
  // isAuthenticated,
  // authorize("admin"),
  createCity
);

// Admin updates city
cityRouter.put(
  "/:id",
  // isAuthenticated,
  // authorize("admin"),
  updateCity
);

// Super Admin deactivates city
cityRouter.delete(
  "/:id",
  // isAuthenticated,
  // authorize("superadmin"),
  deactivateCity
);

/* ------------ PUBLIC ROUTES ------------ */

cityRouter.get("/", getActiveCities);
cityRouter.get("/nearby", getNearbyCities);
cityRouter.get("/:id", getCityById);

export default cityRouter;
