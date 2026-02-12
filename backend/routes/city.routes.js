import express from "express"
import { createCity, getActiveCities } from "../controllers/city.controller.js"
import { upload } from "../middleware/multer.middleware.js"

const router = express.Router()

router.post("/", upload.array("images" , 5) ,  createCity) 
router.get("/getactive-city", getActiveCities)

export default router