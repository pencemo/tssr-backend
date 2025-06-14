import express from "express";
import { signUp, login, isOuth, logout, forgotPassword, verifyOtp, createNewPassword } from "../controllers/authController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/signup", signUp);
router.post("/login", login);
router.get("/isAuth", isAuthenticated, isOuth);
router.post('/logout', logout);

router.post("/sendOtp", forgotPassword);
router.post("/verifyOtp", verifyOtp);
router.post("/resetPassword", createNewPassword);

export default router;

