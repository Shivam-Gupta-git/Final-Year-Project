import express from "express";
import { authorize, isAuthenticated } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import {
  acceptOrder,
  assignDeliveryBoy,
  createFood,
  deleteFood,
  getAllFoodByRestaurantId,
  getAllFoodForUser,
  getAllOrdersAdmin,
  getFoodById,
  getFoodByIdForUser,
  getOrderByIdForAdmin,
  getOrderDetailsAdmin,
  rejectOrder,
  toggleFoodAvailability,
  updateFood,
  updateOrderStatus,
} from "../controllers/food.controller.js";

const foodRouter = express.Router();

// ADMIN - CREATE FOOD
foodRouter.post(
  "/create-Food",
  isAuthenticated,
  authorize("admin"),
  upload.array("images", 5),
  createFood
);

// ADMIN - GET FOOD
foodRouter.get(
  "/admin/foods/:restaurantId",
  isAuthenticated,
  authorize("admin"),
  getAllFoodByRestaurantId
);

// ADMIN - UPDATE FOOD
foodRouter.put(
  "/admin/update-food/:foodId",
  isAuthenticated,
  authorize("admin"),
  upload.array("images", 5),
  updateFood
);

// ADMIN - TOOGLE Availability
foodRouter.patch(
  "/admin/toggle-food/:id",
  isAuthenticated,
  authorize("admin"),
  toggleFoodAvailability
);

// ADMIN - DELETE FOOD
foodRouter.delete(
  "/admin/delete-food/:id",
  isAuthenticated,
  authorize("admin"),
  deleteFood
);


// GET SINGLE FOOD
foodRouter.get("/admin/food/:id", isAuthenticated, getFoodById);

// USER — single food (must be registered before /foods if paths overlap in your stack)
foodRouter.get("/foods/:id", getFoodByIdForUser);

// USER - GET ALL FOOD
foodRouter.get("/foods", getAllFoodForUser);

// ADMIN - GET ALL ORDERS
foodRouter.get("/admin/My-orders", isAuthenticated, authorize("admin"), getAllOrdersAdmin)

// ADMIN -  GET SINGLE ORDER
foodRouter.get("/admin/orderDetails/:orderId", isAuthenticated, authorize("admin"), getOrderDetailsAdmin)

// ADMIN - ACCEPT ORDER 
foodRouter.patch("/admin/acceptOrder/:orderId", isAuthenticated, authorize("admin"), acceptOrder)

// ADMIN - REJECT ORDER
foodRouter.patch("/admin/rejectOrder/:orderId", isAuthenticated, authorize("admin"), rejectOrder)

// ADMIN - . UPDATE STATUS
foodRouter.patch("/admin/updateOrder/:orderId", isAuthenticated, authorize("admin"), updateOrderStatus)

// ADMIN - ASSIGN DELIVERY BOY
foodRouter.post("/assign/:orderId", isAuthenticated, authorize("admin"), assignDeliveryBoy)

// ADMIN - GET ORDER BY ID FOR ADMIN
foodRouter.get("/admin/foodOrder/:orderId", isAuthenticated, authorize("admin"), getOrderByIdForAdmin)

// // ADMIN - GET AVAILABLE DELIVERY BOY
// foodRouter.get("/available", getAvailableDeliveryBoys);

export default foodRouter;
