import express from "express";
import {
  addStudyCenter,
  getStudyCenterById,
  getVerifiedActiveStudyCenters,
} from "../controllers/studycenterController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/addStudyCenter", isAuthenticated, addStudyCenter);
router.get("/getVerifiedStudyCenters",isAuthenticated,getVerifiedActiveStudyCenters);
router.get("/getStudyCenterById/:id", isAuthenticated, getStudyCenterById);
export default router;
