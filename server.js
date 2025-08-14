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
import batchRoutes from "./routes/batchRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";
import settingsRoutes from './routes/settingsRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import ExamScheduleRoutes from './routes/ExamRoutes.js';
import hallTicketRoutes from './routes/hallTicketRoutes.js';
import requestCourseRoutes from "./routes/requestCourseRoutes.js";
import ApprovalRoutes from "./routes/pendingStudentRoutes.js";
import staffRoutes from "./routes/staffRoutes.js";
import externalApiRoutes from "./routes/websiteApisRoutes.js";
import galleryRoutes from "./routes/galleryRoutes.js";

dotenv.config();
const app = express();
app.use(cookieParser());
// CORS Options
const corsOptions = {
  origin: true, // allow your frontend origin
  credentials: true, // allow sending cookies
};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// app.use(cors(corsOptions));
const allowedOrigins = [
  process.env.FRONTEND_URL?.trim().replace(/\/$/, ""),
  process.env.FRONTEND_URL2?.trim().replace(/\/$/, ""),
  'http://localhost:5173',
  'http://localhost:3000'
];

// app.use(cors({
//       origin: allowedOrigins,
//       credentials: true,
//       methods: ["GET", "POST","PUT","DELETE"],
// }))
app.use(cors({
  origin: function (origin, callback) {
    
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"]
}));

// app.use(morgan("dev"));

// Routes
app.use("/api/auth", authenticationRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/subject", subjectRoutes);
app.use("/api/course", courseRoutes);
app.use("/api/result", resultRoutes);
app.use("/api/studycenter", studycenterRoute);
app.use("/api/batch", batchRoutes);
app.use("/api/enrollment", enrollmentRoutes);
app.use("/api/settings", settingsRoutes);
app.use('/api/products', productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/exam", ExamScheduleRoutes);
app.use('/api/hallticket',hallTicketRoutes)
app.use("/api/request", requestCourseRoutes);
app.use("/api/approval", ApprovalRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/externalApi",externalApiRoutes);
app.use("/api/gallery", galleryRoutes);
app.use('/', (req,res) => {
  res.send("This api not listed"); 
})
// Connect to MongoDB
connectDB();

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running on port ${PORT}`)
);
