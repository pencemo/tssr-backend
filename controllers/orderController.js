import Product from '../models/productSchema.js'
import Order from '../models/orderSchema.js'
import User from '../models/userSchema.js';

export const createOrder = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const buyerId = req.user.studycenterId; 

    if (!buyerId || !productId || !quantity) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }
    const newOrder = new Order({
      buyerId,
      productId,
      quantity,
      status: "pending",
    });

    await newOrder.save();

    res.status(201).json({
      success: true,
      message: "Order placed successfully.",
      order: newOrder,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
  
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("buyerId", "name email phoneNumber")
      .populate("productId", "name price");

    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { id, status } = req.query;
    

    if (!["pending", "accepted", "cancelled"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status value." });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );


    if (!updatedOrder) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found." });
    }

    res
      .status(200)
      .json({ success: true, message: "Order updated.", order: updatedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrdersOfAUser = async (req, res) => {
  try {
    const buyerId = req.user.studycenterId; // Comes from auth middleware
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const total = await Order.countDocuments({ buyerId });
    const orders = await Order.find({ buyerId })
      .populate("productId") // Optional: to get product details
      .sort({ createdAt: -1 }) // Most recent orders first
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      message: "Orders fetched successfully.",
      data: orders,
        total,
        page,
        pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong.",
    });
  }
};

export const getOrdersByStatus = async (req, res) => {
  try {
    const { page, limit, search, status } = req.query;
    const skip = (page - 1) * limit;
    const searchRegex = new RegExp(search, "i");

    // Fetch all matching orders with the given status
    const orders = await Order.find({ status })
      .populate({
        path: "productId",
        match: { name: searchRegex },
        select: "name price description",
      })
      .populate("buyerId", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    // Filter out orders where productId did not match (null after populate)
    const filteredOrders = orders.filter((o) => o.productId);

    // Count total orders matching the status and search
    const totalMatchingOrders = await Order.find({ status }).populate({
      path: "productId",
      match: { name: searchRegex },
      select: "_id",
    });

    const totalCount = totalMatchingOrders.filter((o) => o.productId).length;
    const totalPages = Math.ceil(totalCount / limit);
    res.status(200).json({
      success: true,
      currentPage: Number(page),
      totalPages,
      totalCount,
      data: filteredOrders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
