import express from "express";
const router = express.Router();

import {
  createOrder,
  getAllOrders,
  getOrdersByStatus,
  getOrdersOfAUser,
  updateStatus,
} from "../controllers/orderController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

router.post("/createOrder",isAuthenticated, createOrder);
router.get('/getAllOrders', getAllOrders);
router.post('/updateStatus', updateStatus);
router.get("/getOrderOfUser", isAuthenticated, getOrdersOfAUser);
router.get("/getOrdersByStatus", getOrdersByStatus);




export default router;
