import express from "express";
import { createCity } from "../controllers/city.controller.js";
import { upload } from "../middleware/multer.middleware.js";

const router = express.Router();

router.post("/", upload.array("images", 5), createCity);

export default router;
