import express from "express";
import { createStaff, getAllStaffs, updateStaff } from "../controllers/staffController.js";

const router = express.Router();

router.post("/createStaff", createStaff);
router.get("/getAllStaff", getAllStaffs);
router.post("/updateStaff", updateStaff);


export default router;

