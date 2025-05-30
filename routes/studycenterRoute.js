import express from "express";
import {
  addStudyCenter,
  getAllStudyCenterForExcel,
  getCoursesWithBatchesOfAStudyCenter,
  getStudyCenterById,
  getVerifiedActiveStudyCenters,
  updateStudyCenter,
  editStudycenterFieldsByStudycenter,
} from "../controllers/studycenterController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { studyCenterUpdatePermission } from "../middlewares/studyCenterUpdateMiddleware.js";

const router = express.Router();

router.post("/addStudyCenter", addStudyCenter);
router.get("/getVerifiedStudyCenters",getVerifiedActiveStudyCenters);
router.get("/getStudyCenterById", isAuthenticated, getStudyCenterById);
router.put("/updateStudyCenter", isAuthenticated, updateStudyCenter);
router.get("/getAllStudyCenterForExcel",isAuthenticated,getAllStudyCenterForExcel);
// router.put("/getAllStudyCenterForExcel",isAuthenticated,getAllStudyCenterForExcel);
router.get("/getCoursesOfStudyCenter",isAuthenticated,getCoursesWithBatchesOfAStudyCenter );
router.post("/editStudyCenterFields",isAuthenticated,studyCenterUpdatePermission,editStudycenterFieldsByStudycenter);
router.post("/editUserProfile", isAuthenticated);
export default router;

