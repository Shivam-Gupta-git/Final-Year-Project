import express from 'express'
import { authorize, isAuthenticated } from '../middleware/auth.middleware.js'
import { upload } from '../middleware/multer.middleware.js'
import { createTravelOptions, deleteTravelOptions, getActiveTravelOptions, getMyTravelOptions, rejectTravelOption, searchCityToCityTravelOptions, updateTravelOptions } from '../controllers/travelOption.controller.js'

const travelOptionRouter = express.Router()

travelOptionRouter.post("/create-travel-option", isAuthenticated, authorize('admin'), upload.array("images", 5), createTravelOptions)
travelOptionRouter.get("/search/city-to-city", searchCityToCityTravelOptions)


travelOptionRouter.get("/my-travel-options", isAuthenticated, authorize("admin"), getMyTravelOptions)
travelOptionRouter.get("/get-active-travel-options", getActiveTravelOptions)
travelOptionRouter.put("/update-travel-options/:id", isAuthenticated, authorize("admin"),upload.array("images", 5), updateTravelOptions)
travelOptionRouter.delete("/delete-travel-option/:id", isAuthenticated, authorize("admin"), deleteTravelOptions)

export default travelOptionRouter