// routes/subjectRoutes.js
import express from "express";
import { createNotification, getNotificationsOfEachUser } from "../controllers/notificationController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post('/createNotification',createNotification)
router.get("/getNotificationsOfEachUser",isAuthenticated, getNotificationsOfEachUser);

export default router;
