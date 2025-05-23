import express from "express";
import {
  addStudyCenter,
  getAllStudyCenterForExcel,
  getCoursesWithBatchesOfAStudyCenter,
  getStudyCenterById,
  getVerifiedActiveStudyCenters,
  updateStudyCenter,
} from "../controllers/studycenterController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/addStudyCenter", addStudyCenter);
router.get(
  "/getVerifiedStudyCenters",
   
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

router.get(
  "/getCoursesOfStudyCenter",
  isAuthenticated,
  getCoursesWithBatchesOfAStudyCenter 
);
export default router;

