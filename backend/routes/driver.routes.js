import express from 'express'
import { authorize, isAuthenticated } from '../middleware/auth.middleware.js'
import { goOnline, updateDriverLocation } from '../controllers/driver.controller.js'

const driverRouter = express.Router()

driverRouter.post("/driver-online", isAuthenticated, authorize("admin"), goOnline)
driverRouter.post("/driver-location", isAuthenticated, authorize("admin", updateDriverLocation))

export { driverRouter }