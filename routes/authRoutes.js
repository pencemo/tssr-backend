import express from "express";
import { signUp, login, isOuth } from "../controllers/authController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/signup", signUp);
router.post("/login", login);
router.get("/isAuth", isAuthenticated, isOuth);

export default router;

