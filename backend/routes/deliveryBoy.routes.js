import express from "express"
import { getDeliveryBoyProfile, updateDeliveryBoyStatus } from "../controllers/deliveryBoy.controller.js"
import { authorize, isAuthenticated } from "../middleware/auth.middleware.js"

const deliveryBoyRouter = express.Router()

// DELIVERY BOY - Get Delivery Boy Profile
deliveryBoyRouter.get("/profile", isAuthenticated, authorize("admin"), getDeliveryBoyProfile)

// DELIVERY BOY - UPDATE DELIVERY BOY STATUS
deliveryBoyRouter.put("/status/:id", isAuthenticated, authorize("admin"), updateDeliveryBoyStatus)
export default deliveryBoyRouter