import express from "express";
import {
  addStudyCenter,
  getAllStudyCenterForExcel,
  getStudyCenterById,
  getVerifiedActiveStudyCenters,
  updateStudyCenter,
} from "../controllers/studycenterController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/addStudyCenter", isAuthenticated, addStudyCenter);
router.get(
  "/getVerifiedStudyCenters",
   isAuthenticated,
  getVerifiedActiveStudyCenters
);

router.get("/getStudyCenterById", isAuthenticated, getStudyCenterById);
router.put("/updateStudyCenter", isAuthenticated, updateStudyCenter);
router.get(
  "/getAllStudyCenterForExcel",
  isAuthenticated,
  getAllStudyCenterForExcel
);
router.put(
  "/getAllStudyCenterForExcel",
  isAuthenticated,
  getAllStudyCenterForExcel
);
export default router;
