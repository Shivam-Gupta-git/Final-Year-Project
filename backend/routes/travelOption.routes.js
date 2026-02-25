import express from 'express'
import { authorize, isAuthenticated } from '../middleware/auth.middleware.js'
import { upload } from '../middleware/multer.middleware.js'
import { createTravelOptions, getActiveTravelOptions, getMyTravelOptions, searchCityToCityTravelOptions } from '../controllers/travelOption.controller.js'

const travelOptionRouter = express.Router()

travelOptionRouter.post("/create-travel-option", isAuthenticated, authorize('admin'), upload.array("images", 5), createTravelOptions)
travelOptionRouter.get("/search/city-to-city", searchCityToCityTravelOptions)


travelOptionRouter.get("/my-travel-options", isAuthenticated, authorize("admin"), getMyTravelOptions)
travelOptionRouter.get("/get-active-travel-options", getActiveTravelOptions)

export default travelOptionRouter