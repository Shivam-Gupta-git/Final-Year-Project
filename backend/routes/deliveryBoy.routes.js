import express from "express"
import { acceptOrder, deliverOrder, getAvailableDeliveryBoys, getDeliveryBoyProfile, getPendingOrders, pickupOrder, updateDeliveryBoyStatus, updateLiveLocation } from "../controllers/deliveryBoy.controller.js"
import { authorize, isAuthenticated } from "../middleware/auth.middleware.js"


const deliveryBoyRouter = express.Router()

// DELIVERY BOY - Get Delivery Boy Profile
deliveryBoyRouter.get("/profile", isAuthenticated, authorize("admin"), getDeliveryBoyProfile)

// DELIVERY BOY - UPDATE DELIVERY BOY STATUS
deliveryBoyRouter.put("/status/:id", isAuthenticated, authorize("admin"), updateDeliveryBoyStatus)

// DELIVERY BOY - UPDATE LIVE LOCATION
deliveryBoyRouter.put("/location/:id", isAuthenticated, authorize("admin"), updateLiveLocation)

// DELIVERY BOY - GET PENDING ORDERS
deliveryBoyRouter.get("/orders/pending", isAuthenticated, authorize("admin"), getPendingOrders)

// ADMIN - GET AVAILABLE DELIVERY BOY
deliveryBoyRouter.get("/available", getAvailableDeliveryBoys);

// DELIVRY BOY - ACCEPT ORDER 
deliveryBoyRouter.put("/accept-order/:id", isAuthenticated, authorize("admin"), acceptOrder)

// DELIVERY BOY - PICKUP ORDER
deliveryBoyRouter.put("/pickup-order/:id", isAuthenticated, authorize("admin"), pickupOrder)

// DELIVERY BOY - DELIVER ORDER 
deliveryBoyRouter.put("/deliver-order/:id", isAuthenticated, authorize("admin"), deliverOrder)

export default deliveryBoyRouter