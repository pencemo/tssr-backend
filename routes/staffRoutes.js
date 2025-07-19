import express from "express";
import { createStaff, deleteStaff, getAllStaffs, getAllStaffsForDl, updateStaff } from "../controllers/staffController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { passwordMiddleware } from "../middlewares/passwordMiddleware.js";

const router = express.Router();

router.post("/createStaff", createStaff);
router.get("/getAllStaff", getAllStaffs);
router.post("/updateStaff", updateStaff);
router.get("/getAllStaffForDl", getAllStaffsForDl);
router.post("/deleteStaff",isAuthenticated,passwordMiddleware, deleteStaff);


export default router;

