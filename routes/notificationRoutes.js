// routes/subjectRoutes.js
import express from "express";
import { createNotification, deleteNotificationById, getNotificationsForEdit, getNotificationsOfEachUser } from "../controllers/notificationController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post('/createNotification',createNotification)
router.get("/getNotificationsOfEachUser",isAuthenticated, getNotificationsOfEachUser);
router.get(
  "/getNoficationsForEdit",
  isAuthenticated,
  getNotificationsForEdit
);
router.post("/deleteNotification", deleteNotificationById);
export default router;
