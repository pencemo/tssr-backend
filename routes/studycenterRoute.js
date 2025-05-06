import express from "express";
import {
  addStudyCenter,
  getVerifiedActiveStudyCenters,
} from "../controllers/studycenterController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/addStudyCenter", isAuthenticated, addStudyCenter);
router.get(
  "/getVerifiedStudyCenters",
  isAuthenticated,
  getVerifiedActiveStudyCenters
);
export default router;
