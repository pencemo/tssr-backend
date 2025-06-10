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

export async function getDashBoardDataForAdmin(req, res) {
  try {
    const now = new Date();
    const statsPromises = [];

    for (let i = 0; i < 6; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = date.getMonth();
      const year = date.getFullYear();

      const startOfMonth = new Date(year, month, 1);
      const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

      const promise = Enrollment.countDocuments({
        createdAt: {
          $gte: startOfMonth,
          $lte: endOfMonth,
        },
      }).then((count) => ({
        month: MONTHS[month],
        year,
        students: count,
      }));

      statsPromises.push(promise);
    }

    // Run all stats count queries in parallel
    const stats = (await Promise.all(statsPromises)).reverse();

    const todayYear = now.getFullYear();

    // Run total counts in parallel
    const [
      totalEnrollmentInThisYear,
      totalEnrollments,
      totalStudyCenters,
      totalCourses,
    ] = await Promise.all([
      Enrollment.countDocuments({ year: todayYear }),
      Enrollment.estimatedDocumentCount(), // faster than countDocuments
      StudyCenter.estimatedDocumentCount(),
      Course.estimatedDocumentCount(),
    ]);

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
    console.error("Error fetching dashboard stats:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}


export const getDashboardDataForStudycenter = async (req, res) => {
  try {
    const studyCenterId = req.user?.studycenterId;

    if (!studyCenterId) {
      return res.status(400).json({
        success: false,
        message: "Study center ID not provided in the user object.",
      });
    }

    const currentYear = new Date().getFullYear();

    const [totalStudents, currentYearStudents, studyCenter] = await Promise.all(
      [
        Enrollment.countDocuments({ studycenterId: studyCenterId }),
        Enrollment.countDocuments({
          studycenterId: studyCenterId,
          year: currentYear,
        }),
        StudyCenter.findById(studyCenterId).populate("courses").lean(),
      ]
    );

    if (!studyCenter) {
      return res.status(404).json({
        success: false,
        message: "Study center not found.",
      });
    }

    const coursesCount = Array.isArray(studyCenter.courses)
      ? studyCenter.courses.length
      : 0;

    return res.status(200).json({
      success: true,
      message: "Dashboard data fetched successfully.",
      data: {
        students: totalStudents,
        studentsOfCurrentYear: currentYearStudents,
        courses: coursesCount,
      },
    });
  } catch (error) {
    console.error("Error in getDashboardDataForStudycenter:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
};

