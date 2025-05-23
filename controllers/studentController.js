import Course from "../models/courseSchema.js";
import Enrollment from "../models/enrollmentSchema.js";
import Student from "../models/studentSchema.js";
import Studycenter from "../models/studyCenterSchema.js";



export const getStudyCenterStudents = async (req, res) => {
  try {
    const studycenterId = req.user.id;

    const {
      batchId,
      courseId,
      year,
      search = "",
      sortBy = "student.name",
      order = "asc",
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {
      studycenterId,
    };

    if (batchId) filter.batchId = batchId;
    if (courseId) filter.courseId = courseId;
    if (year) filter.year = parseInt(year);

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch enrollments and populate related fields
    const enrollments = await Enrollment.find(filter)
      .populate({
        path: "studentId",
        select: "name email phoneNumber registrationNumber profileImage",
        match: {
          $or: [
            { name: new RegExp(search, "i") },
            { phoneNumber: new RegExp(search, "i") },
            { registrationNumber: new RegExp(search, "i") },
          ],
        },
      })
      .populate({
        path: "batchId",
        select: "month",
      })
      .populate({
        path: "courseId",
        select: "name",
      })
      .skip(skip)
      .limit(parseInt(limit));

    // Filter out enrollments where student didn't match search
    let filtered = enrollments.filter((en) => en.studentId);

    // Sort based on student name or phone number
    filtered = filtered.sort((a, b) => {
      const valA =
        sortBy === "student.phoneNumber"
          ? a.studentId.phoneNumber || ""
          : a.studentId.name?.toLowerCase() || "";

      const valB =
        sortBy === "student.phoneNumber"
          ? b.studentId.phoneNumber || ""
          : b.studentId.name?.toLowerCase() || "";

      return order === "desc"
        ? valB.localeCompare(valA)
        : valA.localeCompare(valB);
    });

    // Total count for pagination (only count matching students)
    const total = await Enrollment.countDocuments(filter);

    // Format final data for response (if needed)
    const formatted = filtered.map((en) => ({
      studentName: en.studentId.name,
      email: en.studentId.email,
      phoneNumber: en.studentId.phoneNumber,
      registrationNumber: en.studentId.registrationNumber,
      profileImage: en.studentId.profileImage,
      batchMonth: en.batchId?.month || "",
      courseName: en.courseId?.name || "",
      enrollmentId: en._id,
    }));

    res.json({
      success: true,
      data: formatted,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Failed to fetch enrolled students:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

