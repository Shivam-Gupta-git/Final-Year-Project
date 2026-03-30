import { FoodOrder } from "../model/foodOrder.model.js";
import { DeliveryBoy } from "../model/deliveryBoy.model.js";
import { User } from "../model/user.model.js";


// DELIVERY BOY - Get Delivery Boy Profile
export const getDeliveryBoyProfile = async (req, res) => {
  try {
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
          {
            path: "restaurant",
            select: "name address contactNumber",
          },
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

// ASSIGN DELIVERY BOY TO ORDER
export const assignDeliveryBoy = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { orderId, deliveryBoyId } = req.body;

    const order = await FoodOrder.findById(orderId).session(session);
    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.deliveryBoy) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Order already assigned to a delivery boy",
      });
    }

    if (
      order.status === "delivered" ||
      order.status === "cancelled"
    ) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Cannot assign delivery boy to ${order.status} order`,
      });
    }

    const deliveryBoy = await DeliveryBoy.findById(deliveryBoyId).session(session);

    if (!deliveryBoy) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Delivery boy not found",
      });
    }

    if (!deliveryBoy.isAvailable) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Delivery boy is not available",
      });
    }

    order.deliveryBoy = deliveryBoy._id;
    order.status = "out_for_delivery";
    order.assignedAt = new Date();

    deliveryBoy.isAvailable = false;
    deliveryBoy.currentOrder = order._id;

    await order.save({ session });
    await deliveryBoy.save({ session });

    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message: "Delivery boy assigned successfully",
      order,
    });
  } catch (error) {
    await session.abortTransaction();

    console.error("Assign Delivery Boy Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
    session.endSession();
  }
};

// Update delivery boy location (called from driver app)
export const updateDeliveryLocation = async (req, res) => {
  try {
    const { deliveryBoyId } = req.params;
    const { coordinates } = req.body; // [lng, lat]

    const deliveryBoy = await DeliveryBoy.findById(deliveryBoyId);
    if (!deliveryBoy) return res.status(404).json({ message: "Delivery boy not found" });

    deliveryBoy.location.coordinates = coordinates;
    await deliveryBoy.save();

    // Emit via socket
    const order = await Order.findOne({ deliveryBoy: deliveryBoy._id });
    if (order) {
      req.io.to(order._id.toString()).emit("orderUpdate", {
        coordinates,
        status: order.status,
      });
    }

    res.status(200).json({ message: "Location updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

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