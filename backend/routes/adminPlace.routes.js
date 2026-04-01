import express from "express";
import { authorize, isAuthenticated } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import {
  createPlace,
  inactivePlace,
  updatePlace,
} from "../controllers/place.controller.js";

const adminPlaceRouter = express.Router();

// POST /api/admin/place
adminPlaceRouter.post(
  "/",
  isAuthenticated,
  authorize("super_admin"),
  upload.array("images", 5),
  createPlace,
);

// PUT /api/admin/place/:id
adminPlaceRouter.put(
  "/:id",
  isAuthenticated,
  authorize("super_admin"),
  upload.array("images", 5),
  updatePlace,
);

// PATCH /api/admin/place/:id/inactive
adminPlaceRouter.patch(
  "/:id/inactive",
  isAuthenticated,
  authorize("super_admin"),
  inactivePlace,
);

export default adminPlaceRouter;

