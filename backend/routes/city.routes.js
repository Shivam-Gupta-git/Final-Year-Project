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

const router = express.Router();

/* ------------ ADMIN ROUTES ------------ */

// Admin creates city
router.post(
  "/",
  isAuthenticated,
  authorize("admin"),
  createCity
);

// Admin updates city
router.put(
  "/:id",
  isAuthenticated,
  authorize("admin"),
  updateCity
);

// Super Admin deactivates city
router.delete(
  "/:id",
  isAuthenticated,
  authorize("superadmin"),
  deactivateCity
);

/* ------------ PUBLIC ROUTES ------------ */

router.get("/", getActiveCities);
router.get("/nearby", getNearbyCities);
router.get("/:id", getCityById);

export default router;
