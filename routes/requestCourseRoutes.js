import express from "express";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { changeStatusOfRequestedCourse, getAllNotBookedCourses, getRequestedCourses, getRequestedCoursesByAdmin, requestCourse } from "../controllers/requestCourseController.js";
const router = express.Router();

router.post("/requestACourse", isAuthenticated, requestCourse);
router.post('/changeStatus', changeStatusOfRequestedCourse);
router.get(
  "/getRequestedCoursesOfStudycenter",
  isAuthenticated,
  getRequestedCourses
);

router.get('/getRequestedCoursesForAdmin', getRequestedCoursesByAdmin);
router.get("/getNotBookedCourses", isAuthenticated ,getAllNotBookedCourses);

export default router;
