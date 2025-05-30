import Enrollment from "../models/enrollmentSchema.js";

// export const getStudyCenterStudents = async (req, res) => {
//   const user = req.user;
//   let studycenterId;

//   try {
//     if (user.isAdmin) {
//       studycenterId = req.query.studyCentre;
//     } else {
//       studycenterId = req.user.studycenterId;
//     }

//     const {
//       batchId,
//       courseId,
//       year,
//       search = "",
//       sortBy = "createdAt",
//       order = "asc",
//       page = 1,
//       limit = 10,
//     } = req.query;

//     const filter = {  };
//     if (studycenterId) filter.studycenterId = studycenterId;
//       if (batchId) filter.batchId = batchId;
//     if (courseId) filter.courseId = courseId;
//     if (year) filter.year = parseInt(year);

//     // Get all enrollments (no skip/limit yet)
//     let enrollments = await Enrollment.find(filter)
//       .populate({
//         path: "studentId",
//         select:
//           "name email phoneNumber registrationNumber profileImage createdAt",
//         match: {
//           $or: [
//             { name: new RegExp(search, "i") },
//             { phoneNumber: new RegExp(search, "i") },
//             { registrationNumber: new RegExp(search, "i") },
//           ],
//         },
//       })
//       .populate({ path: "batchId", select: "month" })
//       .populate({ path: "courseId", select: "name" })
//       .populate({
//         path: "studycenterId",
//         select: "name"
//       });

//     // Filter out students not matched
//     enrollments = enrollments.filter((en) => en.studentId);

//     // Sort
//     enrollments = enrollments.sort((a, b) => {
//       let valA, valB;
//       if (sortBy === "student.name") {
//         valA = a.studentId.name?.toLowerCase() || "";
//         valB = b.studentId.name?.toLowerCase() || "";
//       } else if (sortBy === "student.phoneNumber") {
//         valA = a.studentId.phoneNumber || "";
//         valB = b.studentId.phoneNumber || "";
//       } else {
//         valA = new Date(a.studentId.createdAt);
//         valB = new Date(b.studentId.createdAt);
//       }
//       return order === "desc" ? (valB > valA ? 1 : -1) : valA > valB ? 1 : -1;
//     });

//     const total = enrollments.length;
//     const totalPages = Math.ceil(total / limit);
//     const currentPage = parseInt(page);

//     // Apply pagination *after* filtering + sorting
//     const paginated = enrollments.slice(
//       (currentPage - 1) * limit,
//       currentPage * limit
//     );

//     const formatted = paginated.map((en) => ({
//       studentName: en.studentId.name,
//       email: en.studentId.email,
//       phoneNumber: en.studentId.phoneNumber,
//       registrationNumber: en.studentId.registrationNumber,
//       profileImage: en.studentId.profileImage,
//       batchMonth: en.batchId?.month || "",
//       courseName: en.courseId?.name || "",
//       studycenterName: en.studycenterId?.name || "",
//       enrollmentId: en._id,
//       year:en.year
//     }));

//     res.json({
//       success: true,
//       data: formatted,
//         totalData: total,
//         currentPage,
//         totalPages,
//     });
//   } catch (error) {
//     console.error("Failed to fetch enrolled students:", error);
//     res.status(500).json({ success: false, message: "Server Error" });
//   }
// };

export const getStudyCenterStudents = async (req, res) => {
  const user = req.user;
  let studycenterId;

  try {
    if (user.isAdmin) {
      studycenterId = req.query.studyCentre;
    } else {
      studycenterId = req.user.studycenterId;
    }

    const {
      batchId,
      courseId,
      year,
      search = "",
      sortBy = "Name",
      order = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};
    if (studycenterId) filter.studycenterId = studycenterId;
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
      .populate({ path: "courseId", select: "name" })
      .populate({
        path: "studycenterId",
        select: "name",
      });

    // Filter out enrollments where studentId is null (no match on search)
    enrollments = enrollments.filter((en) => en.studentId);

    // Group by studentId but keep enrollments if they match search, show only one per student
    const seenStudentIds = new Set();
    const uniqueOrMatchedEnrollments = [];

    enrollments.forEach((en) => {
      const studentId = en.studentId._id.toString();

      // Check if search matched this enrollment's student fields
      const matched =
        search &&
        (en.studentId.name?.toLowerCase().includes(search.toLowerCase()) ||
          en.studentId.phoneNumber?.includes(search) ||
          en.studentId.registrationNumber
            ?.toLowerCase()
            .includes(search.toLowerCase()));

      if (!seenStudentIds.has(studentId) || matched) {
        seenStudentIds.add(studentId);
        uniqueOrMatchedEnrollments.push(en);
      }
    });

    enrollments = uniqueOrMatchedEnrollments;

    // Sort enrollments
    enrollments = enrollments.sort((a, b) => {
      let valA, valB;
      if (sortBy === "byName") {
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

    // Format response as before
    const formatted = paginated.map((en) => ({
      studentName: en.studentId.name,
      email: en.studentId.email,
      phoneNumber: en.studentId.phoneNumber,
      registrationNumber: en.studentId.registrationNumber,
      profileImage: en.studentId.profileImage,
      batchMonth: en.batchId?.month || "",
      courseName: en.courseId?.name || "",
      studycenterName: en.studycenterId?.name || "",
      enrollmentId: en._id,
      year: en.year,
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

export const getOneStudent = async (req, res) => {
  try {
    const { id } = req.query;
    
    const enrollment = await Enrollment.findById(id)
      .populate({
        path: "studentId",
      })
      .populate({ path: "batchId", select: "month" })
      .populate({ path: "studycenterId", select: "name" })
      .populate({ path: "courseId", select: "name" });

    if (!enrollment) {
      return res.status(404).json({ success: false, message: "Enrollment not found" });
    }
    const {studentId, batchId, courseId, studycenterId, ...rest}=enrollment._doc
    return res.status(200).json({
      success: true,
      data : {
        ...rest,
        ...studentId._doc,
        studycenter: studycenterId?.name || '',
        batchMonth: batchId?.month || "",
        ourseName: courseId?.name || "",
      }
      
    })
    
    }catch (error) {
    console.error("Failed to fetch enrolled students:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
    }
}

// export const getStudentsForDl = async (req, res) => {
//   try {
//     const studycenterId = req.user.studycenterId;
//     const {courseId, batchId, year, fields} = req.body;
//     const enrollments = await Enrollment.find({ studycenterId, courseId, batchId, year })
//       .populate({
//         path: "studentId",
//         select: fields ? fields.join(" ") : "",
//       })
//       .populate({ path: "batchId", select: "month" })
//       .populate({ path: "courseId", select: "name" });
//     console.log("Enrollments for download:", enrollments);
//     return res.status(200).json({
//       success: true,
//       data: enrollments.map(en => {
//         const {studentId, batchId, courseId,year, enrolledDate,isPassed, isCompleted, ...rest} = en._doc;
//         console.log("doc",studentId)
//           const { _id, ...studentData } = studentId._doc;
//           return {
//             // ...rest,
//             ...studentData,
//             year,
//             enrolledDate,
//             isCompleted : isCompleted ? "Completed" : "Not Completed",
//             isPassed : isPassed ? "Passed" : "Not Passed",
//             batchMonth: batchId?.month || "",
//             courseName: courseId?.name || "",
//           }
//         })

//       })

//   } catch (error) {
//     console.error("Failed to fetch students for download:", error);
//     return res.status(500).json({ success: false, message: "Server Error" });
//   }
// };

export const getStudentsForDl = async (req, res) => {
  try {
    const studycenterId = req.user.studycenterId || req.body.studycenterId;
    if (!req.user.isAdmin) {
      if (req.user.studycenterId == null) {
        return res.status(403).json({
          success: false,
          message: "Access denied. Study center ID is required.",
        });
      }
    }
    const { courseId, batchId, year, fields } = req.body || {}; ;

    const query = {};
    if (studycenterId) query.studycenterId = studycenterId;
    if (courseId) query.courseId = courseId;
    if (batchId) query.batchId = batchId;
    if (year) query.year = year;

    const enrollments = await Enrollment.find(query)
      .populate({
        path: "studentId",
        select: fields ? fields.join(" ") : "",
      })
      .populate({ path: "batchId", select: "month admissionYear" })
      .populate({ path: "courseId", select: "name" })
      .populate({ path: "studycenterId", select: "name" });

    console.log("Enrollments for download:", enrollments);
    if(enrollments.length === 0) {
      return res.status(404).json({ success: false, message: "No enrollments found for the given criteria." });
    }

    const formattedData = enrollments
      .map((en) => {
        const {
          studentId,
          batchId,
          courseId,
          year,
          enrolledDate,
          isPassed,
          isCompleted,
        } = en._doc;

        if (!studentId || !studentId._doc) {
          console.warn(`Missing student for enrollment ID: ${en._id}`);
          return null;
        }

        const { _id, ...studentData } = studentId._doc;

        return {
          ...studentData,
          year,
          enrolledDate,
          isCompleted: isCompleted ? "Completed" : "Not Completed",
          isPassed: isPassed ? "Passed" : "Not Passed",
          batchMonth: batchId?.month || "",
          courseName: courseId?.name || "",
        };
      })
      .filter(Boolean); // Remove nulls

    return res.status(200).json({
      success: true,
      data: formattedData,
      studycenterName:
        studycenterId ? enrollments[0]?.studycenterId?.name : "All Study Centers",

      courseName: courseId ? enrollments[0].courseId.name : "All Courses",
      batchMonth: batchId ? enrollments[0].batchId.month : "All Batches",
      year: year || "All Years",
    });
  } catch (error) {
    console.error("Failed to fetch students for download:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
export const getAllStudentsDownloadForAdmin = async (req, res) => {
  try {
    const { courseId, batchId, year, fields } = req.body || {};

    const query = {};
    if (courseId) query.courseId = courseId;
    if (batchId) query.batchId = batchId;
    if (year) query.year = year;

    const enrollments = await Enrollment.find(query)
      .populate({
        path: "studentId",
        select: fields ? fields.join(" ") : "",
      })
      .populate({ path: "batchId", select: "month admissionYear" })
      .populate({ path: "courseId", select: "name" })
      .populate({ path: "studycenterId", select: "name" });

    if (!enrollments.length) {
      return res
        .status(404)
        .json({ success: false, message: "No enrollments found." });
    }

    // Group by studycenterId
    const groupedByCenter = {};

    for (const en of enrollments) {
      const centerId = en.studycenterId?._id?.toString() || "unknown";
      const centerName = en.studycenterId?.name || "Unknown Study Center";

      if (!en.studentId || !en.studentId._doc) continue;

      const { _id, ...studentData } = en.studentId._doc;

      const formatted = {
        ...studentData,
        year: en.year,
        enrolledDate: en.enrolledDate,
        isCompleted: en.isCompleted ? "Completed" : "Not Completed",
        isPassed: en.isPassed ? "Passed" : "Not Passed",
        batchMonth: en.batchId?.month || "",
        courseName: en.courseId?.name || "",
      };

      if (!groupedByCenter[centerId]) {
        groupedByCenter[centerId] = {
          studycenterId: centerId,
          studycenterName: centerName,
          students: [],
        };
      }

      groupedByCenter[centerId].students.push(formatted);
    }

    return res.status(200).json({
      success: true,
      data: Object.values(groupedByCenter),
      courseName: courseId ? enrollments[0].courseId.name : "All Courses",
      batchMonth: batchId ? enrollments[0].batchId.month : "All Batches",
      year: year || "All Years",
    });
  } catch (error) {
    console.error("Error in getAllEnrollmentsGroupedByStudyCenter:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
