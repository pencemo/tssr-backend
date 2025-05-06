import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import authenticationRoutes from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import subjectRoutes from "./routes/subjectRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import connectDB from "./config/db.js";
import resultRoutes from "./routes/resultRoutes.js";
import cookieParser from "cookie-parser";
import  studycenterRoute  from "./routes/studycenterRoute.js";
dotenv.config();
const app = express();

// CORS Options
const corsOptions = {
  origin: "http://localhost:5173", // allow your frontend origin
  credentials: true, // allow sending cookies
};

// Middleware
app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(morgan("dev"));

// Routes
app.use("/api/auth", authenticationRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/subject", subjectRoutes);
app.use("/api/course", courseRoutes);
app.use("/api/result", resultRoutes);
app.use("/api/studycenter", studycenterRoute);
// Connect to MongoDB
connectDB();

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
