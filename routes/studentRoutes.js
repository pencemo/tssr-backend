import express from "express";
import {  getStudyCenterStudents } from "../controllers/studentController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
const router = express.Router();


router.get("/getAllStudents", isAuthenticated, getStudyCenterStudents);

export default router;

