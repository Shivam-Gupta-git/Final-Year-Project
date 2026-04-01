import { FoodOrder } from "../model/foodOrder.model.js";
import { DeliveryBoy } from "../model/deliveryBoy.model.js";
import { User } from "../model/user.model.js";
import mongoose from "mongoose";


// DELIVERY BOY - Get Delivery Boy Profile
export const getDeliveryBoyProfile = async (req, res) => {
  try {
    console.log(req.user);
    // only delivery boy account can access
    if (
      req.user.role !== "admin" ||
      req.user.host !== "delivery_boy"
    ) {
      return res.status(403).json({
        success: false,
        message: "Only delivery boy accounts can access this profile",
      });
    }

    const user = await User.findById(req.user.id).select(
      "-password -otp -token"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const deliveryBoyData = await DeliveryBoy.findOne({
      user: req.user.id,
    })
      .populate("assignedRestaurant", "name address contactNumber")
      .populate({
        path: "currentOrder",
        populate: [
          {
            path: "user",
            select: "userName email contactNumber",
          },
          // {
          //   path: "restaurant",
          //   select: "name address contactNumber",
          // },
        ],
      });

    if (!deliveryBoyData) {
      return res.status(404).json({
        success: false,
        message: "Delivery boy profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      deliveryBoy: {
        _id: user._id,
        userName: user.userName,
        email: user.email,
        contactNumber: user.contactNumber,
        avatar: user.avatar,
        role: user.role,
        host: user.host,
        
        _id: deliveryBoyData._id,
        isAvailable: deliveryBoyData.isAvailable,
        isOnline: deliveryBoyData.isOnline,
        phone: deliveryBoyData.phone,
        fullAddress: deliveryBoyData.fullAddress,
        location: deliveryBoyData.location,
        assignedRestaurant: deliveryBoyData.assignedRestaurant,
        currentOrder: deliveryBoyData.currentOrder,
        lastLocationUpdatedAt: deliveryBoyData.lastLocationUpdatedAt,
      },
    });
  } catch (error) {
    console.error("Get Delivery Boy Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch delivery boy profile",
    });
  }
};

// DELIVERY BOY - UPDATE DELIVERY BOY STATUS
export const updateDeliveryBoyStatus = async (req, res) => {
  try {
    const { id } = req.params; // this must be the DeliveryBoy _id
    const { isOnline, isAvailable } = req.body;

    // Use _id for consistency
    const deliveryBoy = await DeliveryBoy.findById(id);
    if (!deliveryBoy) {
      console.log("Delivery boy not found for id:", id);
      return res.status(404).json({ success: false, message: "Delivery boy not found" });
    }

    if (typeof isOnline === "boolean") deliveryBoy.isOnline = isOnline;
    if (typeof isAvailable === "boolean") deliveryBoy.isAvailable = isAvailable;

    await deliveryBoy.save();
    return res.status(200).json({ success: true, deliveryBoy });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to update delivery boy status" });
  }
};

// DELIVERY BOY - UPDATE LIVE LOCATION
export const updateLiveLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { latitude, longitude } = req.body;

    if (latitude == null || longitude == null) {
      return res.status(400).json({
        success: false,
        message: "Both latitude and longitude are required",
      });
    }

    const updateData = {
      location: {
        type: "Point", 
        coordinates: [longitude, latitude], 
      },
      lastLocationUpdatedAt: new Date(), 
    };

    const deliveryBoy = await DeliveryBoy.findByIdAndUpdate(id, updateData, {
      returnDocument: "after", 
      runValidators: true,
    });

    if (!deliveryBoy) {
      return res.status(404).json({
        success: false,
        message: "Delivery boy not found or location update failed",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Location updated successfully",
      deliveryBoy,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ADMIN - GET AVAILABLE DELIVERY BOY
export const getAvailableDeliveryBoys = async (req, res) => {
  try {
    const deliveryBoys = await DeliveryBoy.find({ isAvailable: true })
      .populate("user", "userName email phone role"); // populate user info

    return res.status(200).json({
      success: true,
      deliveryBoys,
    });
  } catch (error) {
    console.error("Get Available Delivery Boys Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// DELIVERY BOY - GET PENDING ORDERS
export const getPendingOrders = async (req, res) => {
  try {
    const deliveryBoy = await DeliveryBoy.findOne({ user: req.user.id });

    if (!deliveryBoy) {
      return res.status(404).json({
        success: false,
        message: "Delivery boy not found",
      });
    }

    const orders = await FoodOrder.find({
      deliveryBoy: deliveryBoy._id,
      status: { $in: ["assigned", "accepted_by_delivery_boy", "out_for_delivery"] },
    })
      .populate("user", "userName contactNumber")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get Pending Orders Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// DELIVRY BOY - ACCEPT ORDER 
export const acceptOrder = async (req, res) => {
  try {  
    const userId = req.user._id;
    const orderId = req.params.id;
    const deliveryBoy = await DeliveryBoy.findOne(userId);
    console.log("deliveryBoy", deliveryBoy);

    if (!deliveryBoy) {
      return res.status(404).json({
        success: false,
        message: "Delivery boy not found",
      });
    }

    const order = await FoodOrder.findOne({
      _id: orderId,
      deliveryBoy: deliveryBoy._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.status !== "assigned") {
      return res.status(400).json({
        success: false,
        message: "Only assigned orders can be accepted",
      });
    }

    order.status = "accepted_by_delivery_boy";
    order.acceptedAt = new Date();

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order accepted successfully",
      order,
    });
  } catch (error) {
    console.error("Accept Order Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// DELIVERY BOY - PICKUP ORDER
export const pickupOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const orderId = req.params.id;

    const deliveryBoy = await DeliveryBoy.findOne({ userId });

    if (!deliveryBoy) {
      return res.status(404).json({
        success: false,
        message: "Delivery boy not found",
      });
    }

    const order = await FoodOrder.findOne({
      _id: orderId,
      deliveryBoy: deliveryBoy._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (
      !["accepted_by_delivery_boy", "assigned"].includes(order.status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Cannot pickup this order",
      });
    }

    order.status = "out_for_delivery";
    order.pickedUpAt = new Date();

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order picked up successfully",
      order,
    });
  } catch (error) {
    console.error("Pickup Order Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// DELIVERY BOY - DELIVER ORDER 
export const deliverOrder = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    await session.startTransaction();

    const userId = req.user._id;
    const orderId = req.params.id;

    // Find delivery boy linked to logged in user
    const deliveryBoy = await DeliveryBoy.findOne({
      user: userId,
    }).session(session);

    if (!deliveryBoy) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "Delivery boy not found",
      });
    }

    // Find order assigned to this delivery boy
    const order = await FoodOrder.findOne({
      _id: orderId,
      deliveryBoy: deliveryBoy._id,
    }).session(session);

    if (!order) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Only out_for_delivery orders can be delivered
    if (order.status !== "out_for_delivery") {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: "Only out_for_delivery orders can be marked delivered",
      });
    }

    // Update order
    order.status = "delivered";
    order.deliveredAt = new Date();

    // Optional: stop live tracking after delivery
    order.liveLocation = null;

    // Update delivery boy
    deliveryBoy.isAvailable = true;
    deliveryBoy.currentOrder = null;
    deliveryBoy.totalDeliveredOrders =
      (deliveryBoy.totalDeliveredOrders || 0) + 1;

    await order.save({ session });
    await deliveryBoy.save({ session });

    await session.commitTransaction();

    // Return fully populated order
    const updatedOrder = await FoodOrder.findById(order._id)
      .populate("user", "userName email contactNumber")
      .populate("restaurant", "name address contactNumber")
      .populate({
        path: "deliveryBoy",
        populate: {
          path: "user",
          select: "userName email contactNumber",
        },
      });

    // Optional realtime socket events
    const io = req.app.get("io");

    if (io) {
      io.to(`user_${updatedOrder.user._id}`).emit("orderDelivered", {
        orderId: updatedOrder._id,
        status: "delivered",
        message: "Your order has been delivered successfully",
      });

      if (updatedOrder.restaurant?._id) {
        io.to(`restaurant_${updatedOrder.restaurant._id}`).emit(
          "orderDelivered",
          {
            orderId: updatedOrder._id,
            status: "delivered",
            message: "Order delivered to customer",
          }
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: "Order delivered successfully",
      order: updatedOrder,
      deliveryBoyStats: {
        totalDeliveredOrders: deliveryBoy.totalDeliveredOrders,
        isAvailable: deliveryBoy.isAvailable,
      },
    });
  } catch (error) {
    await session.abortTransaction();

    console.error("Deliver Order Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  } finally {
    session.endSession();
  }
};

// ASSIGN DELIVERY BOY TO ORDER



// Get order for tracking
export const getOrderForTracking = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate("deliveryBoy", "name phone location")
      .populate("user", "name phone");

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.status(200).json({ order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};