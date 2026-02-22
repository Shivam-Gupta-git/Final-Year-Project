import express from "express";
import {
  createCity,
  deleteCity,
  getActiveCities,
  getCityById,
  getNearbyCities,
  updateCity,
} from "../controllers/city.controller.js";
import { authorize, isAuthenticated } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const cityRouter = express.Router();

/* ------------ ADMIN ROUTES ------------ */

// Admin creates city
cityRouter.post(
  "/",
  isAuthenticated,
  authorize("super_admin" , "admin"), upload.array("images", 5),
  authorize("admin"),
  upload.array("images", 5),
  createCity,
);



// Admin updates city
cityRouter.put(
  "/updatecity/:id",
  isAuthenticated,
  authorize("admin"),
  upload.array("images", 5),
  updateCity,
);

// Super Admin deactivates city
cityRouter.delete(
  "/deletecity/:id",
  isAuthenticated,
  authorize("admin"),
  deleteCity,
);

/* ------------ PUBLIC ROUTES ------------ */

cityRouter.get("/activecity", getActiveCities);
cityRouter.get("/nearby", getNearbyCities);
cityRouter.get("/getcity/:id", getCityById);

export default cityRouter;
