
import Enrollment from "../models/enrollmentSchema.js";




export const getStudyCenterStudents = async (req, res) => {
  try {
    const studycenterId = req.user.id;
    console.log("req.query", req.query);  

    const {
      batchId,
      courseId,
      year,
      search = "",
      sortBy = "createdAt",
      order = "asc",
      page = 1,
      limit = 10,
    } = req.query;

    const filter = { studycenterId };
    if (batchId) filter.batchId = batchId;
    if (courseId) filter.courseId = courseId;
    if (year) filter.year = parseInt(year);

    // Get all enrollments (no skip/limit yet)
    let enrollments = await Enrollment.find(filter)
      .populate({
        path: "studentId",
        select:
          "name email phoneNumber registrationNumber profileImage createdAt",
        match: {
          $or: [
            { name: new RegExp(search, "i") },
            { phoneNumber: new RegExp(search, "i") },
            { registrationNumber: new RegExp(search, "i") },
          ],
        },
      })
      .populate({ path: "batchId", select: "month" })
      .populate({ path: "courseId", select: "name" });

    // Filter out students not matched
    enrollments = enrollments.filter((en) => en.studentId);

    // Sort
    enrollments = enrollments.sort((a, b) => {
      let valA, valB;
      if (sortBy === "student.name") {
        valA = a.studentId.name?.toLowerCase() || "";
        valB = b.studentId.name?.toLowerCase() || "";
      } else if (sortBy === "student.phoneNumber") {
        valA = a.studentId.phoneNumber || "";
        valB = b.studentId.phoneNumber || "";
      } else {
        valA = new Date(a.studentId.createdAt);
        valB = new Date(b.studentId.createdAt);
      }
      return order === "desc" ? (valB > valA ? 1 : -1) : valA > valB ? 1 : -1;
    });

    const total = enrollments.length;
    const totalPages = Math.ceil(total / limit);
    const currentPage = parseInt(page);

    // Apply pagination *after* filtering + sorting
    const paginated = enrollments.slice(
      (currentPage - 1) * limit,
      currentPage * limit
    );

    const formatted = paginated.map((en) => ({
      studentName: en.studentId.name,
      email: en.studentId.email,
      phoneNumber: en.studentId.phoneNumber,
      registrationNumber: en.studentId.registrationNumber,
      profileImage: en.studentId.profileImage,
      batchMonth: en.batchId?.month || "",
      courseName: en.courseId?.name || "",
      enrollmentId: en._id,
      year:en.year
    }));

    res.json({
      success: true,
      data: formatted,
        totalData: total,
        currentPage,
        totalPages,
    });
  } catch (error) {
    console.error("Failed to fetch enrolled students:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};



