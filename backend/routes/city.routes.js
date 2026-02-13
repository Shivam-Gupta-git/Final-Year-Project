<<<<<<< HEAD
import express from "express";
import { createCity } from "../controllers/city.controller.js";
import { upload } from "../middleware/multer.middleware.js";
=======
import express from "express"
import { createCity, getActiveCities } from "../controllers/city.controller.js"
import { upload } from "../middleware/multer.middleware.js"
>>>>>>> 2002e65d9ba8a9ebb0f1845a559972e6e89079d3

const router = express.Router();

<<<<<<< HEAD
router.post("/", upload.array("images", 5), createCity);
=======
router.post("/", upload.array("images" , 5) ,  createCity) 
router.get("/getactive-city", getActiveCities)
>>>>>>> 2002e65d9ba8a9ebb0f1845a559972e6e89079d3

export default router;
