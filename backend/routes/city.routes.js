import express from "express";
import {
  createCity,
  getActiveCities,
  getCityById,
  updateCity,
  deleteCity,
  getNearbyCities,
} from "../controllers/city.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const cityRouter = express.Router();

/* ------------ ADMIN ROUTES ------------ */

// Admin creates city
cityRouter.post(
  "/",//whenever you use multer here you can remove this upload
  isAuthenticated,
  authorize("super_admin"),
  upload.array("images", 5),
  createCity
);

// Admin updates city
cityRouter.put(
  "/:id",
  // isAuthenticated,
  // authorize("super_admin"),
  updateCity
);

// Super Admin deactivates city
cityRouter.delete(
  "/:id",
  // isAuthenticated,
  // authorize("super_admin"),
  deleteCity
);

/* ------------ PUBLIC ROUTES ------------ */

cityRouter.get("/", getActiveCities);
cityRouter.get("/nearby", getNearbyCities);
cityRouter.get("/:id", getCityById);

export default cityRouter;
