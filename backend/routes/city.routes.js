import express from "express";
import {
  createCity,
  getActiveCities,
  getCityById,
  updateCity,
  deactivateCity,
  getNearbyCities,
} from "../controllers/city.controller.js";

const router = express.Router();

// Admin
router.post("/", createCity);
router.put("/:id", updateCity);
router.delete("/:id", deactivateCity);

// Public
router.get("/", getActiveCities);
router.get("/nearby", getNearbyCities);
router.get("/:id", getCityById);

export default router;
