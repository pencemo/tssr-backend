import Batch from "../models/batchSchema.js";
import Course from "../models/courseSchema.js";
import Enrollment from "../models/enrollmentSchema.js";
import StudyCenter from "../models/studyCenterSchema.js";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export async function getRecentBatchesWithEnrollmentCount(req, res) {
    try {
      const now = new Date();
      const stats = [];

      for (let i = 0; i < 6; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const month = date.getMonth();
        const year = date.getFullYear();

        const startOfMonth = new Date(year, month, 1);
        const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

        const count = await Enrollment.countDocuments({
          createdAt: {
            $gte: startOfMonth,
            $lte: endOfMonth,
          },
        }).lean();

        stats.push({
          month: MONTHS[month],
          year,
          enrolledStudentCount: count,
        });
        }
        stats.reverse();
        const today = new Date();
        const totalEnrollmentInThisYear = await Enrollment.find({ year: today.getFullYear() }).countDocuments();
        const totalEnrollments = await Enrollment.countDocuments();
        

        const totalStudyCenters = await StudyCenter.countDocuments();
        const totalCourses = await Course.countDocuments();

        return res.status(200).json({
          success: true,
          data: {
            chart: stats,
            totalCourses,
            totalEnrollments,
            totalStudyCenters,
            totalEnrollmentInThisYear,
          },
        });
    } catch (error) {
      console.error("Error fetching enrollment stats:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
}
