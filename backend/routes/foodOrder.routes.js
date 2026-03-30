import express from 'express'
import { authorize, isAuthenticated } from '../middleware/auth.middleware.js'
import { cancelOrder, createOrder, getMyOrders, getOrderById } from '../controllers/FoodOrder.controller.js'


const foodOrderRouter = express.Router()

// USER - CREATE ORDER
foodOrderRouter.post("/foodOrder", isAuthenticated, authorize("user"), createOrder)

// USER - My ORDERS
foodOrderRouter.get("/My-orders", isAuthenticated, authorize("user"), getMyOrders)

// USER - GET SINGLE ORDER DETAILS
foodOrderRouter.get("/My-order/:orderId", isAuthenticated, authorize("user"), getOrderById)

// USER - CANCEL ORDER
foodOrderRouter.put("/cancel-order/:orderId", isAuthenticated, authorize("user"), cancelOrder)



export default foodOrderRouter