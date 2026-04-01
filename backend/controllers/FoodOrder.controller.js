import { FoodOrder } from "../model/foodOrder.model.js";

// USER - CREATE ORDER
export const createOrder = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Login required" });
  }

  const { items, totalAmount, paymentMethod, deliveryAddress, isSynced } =
    req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res
      .status(400)
      .json({ message: "Order must have at least one item" });
  }

  // Ensure items array has proper structure
  const formattedItems = items.map((i) => ({
    food: {
      id: i.food?.id || i.foodId, // accept both
      name: i.food?.name || i.name,
      quantity: i.food?.quantity || i.quantity,
      price: i.food?.price || i.price,
      image: i.food?.image || i.image || "",
    },
  }));

  const order = new FoodOrder({
    user: req.user.id,
    items: formattedItems,
    totalAmount,
    paymentMethod,
    deliveryAddress,
    isSynced: isSynced ?? true,
  });

  await order.save();
  res.status(201).json(order);
};

// USER - My ORDERS (Show user all past and current orders. Can include filters like pending, delivered.)
export const getMyOrders = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Login required" });
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const query = { user: req.user.id };

    if (req.query.status) {
      query.status = req.query.status;
    }

    const orders = await FoodOrder.find(query)
      .populate("items.restaurant", "name image")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await FoodOrder.countDocuments(query);

    res.json({
      success: true,
      orders,
      page,
      totalPages: Math.ceil(total / limit),
      totalOrders: total,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// USER - GET SINGLE ORDER DETAILS ( Get detailed info of one order (status, items, restaurant info, delivery location).)
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await FoodOrder.findById(orderId)
      .populate("items.restaurant", "name")
      .populate("restaurantInfo", "name phone address")
      .populate({
        path: "deliveryBoy",
        select: "phone isOnline isAvailable totalDeliveredOrders location",
        populate: {
          path: "user",
          select: "userName contactNumber email",
        },
      });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // Ensure user can only access their own order
    if (!order.user.equals(req.user.id)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Hide delivery boy info if order is delivered or cancelled
    const deliveryBoyData = ["delivered", "cancelled"].includes(order.status)
      ? null
      : order.deliveryBoy;

    if (!order.user.equals(req.user.id)) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    res.json({
      order: {
        ...order.toObject(),
        deliveryBoy: deliveryBoyData,
      },
      restaurantDetails:
        order.status !== "pending" ? order.restaurantInfo : null,
    });
  } catch (error) {
    console.error("Get Order By Id Error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// USER - CANCEL ORDER (Allow user to cancel if status is still pending or confirmed.)
export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body; // optional

    const order = await FoodOrder.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check ownership
    if (!order.user.equals(req.user.id)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Allow cancel only in early stages
    if (!["pending", "confirmed"].includes(order.status)) {
      return res.status(400).json({
        message: "Order cannot be cancelled at this stage",
      });
    }

    //  Update status
    order.status = "cancelled";

    //  Save cancel reason
    order.cancelReason = reason || "User cancelled";

    // ✅ Save cancel time
    order.cancelledAt = new Date();

    await order.save();

    res.json({
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
