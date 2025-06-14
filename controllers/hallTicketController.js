
import Enrollment from "../models/enrollmentSchema.js";
import ExamSchedule from "../models/examScheduleSchema.js";
import Student from "../models/studentSchema.js";
import StudyCenter from "../models/studyCenterSchema.js";

export const hallTicketDownload = async (req, res) => {
  try {
    const { registrationNo } = req.body;

    if (!registrationNo) {
      return res.status(400).json({
        success: false,
        message: "Registration number is required",
      });
    }

    const student = await Student.findOne({
      registrationNumber: registrationNo,
    })
      .select("_id name studyCenterId profileImage")
      .lean();

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }
    //console.log(student);
    const enrollment = await Enrollment.findOne({
      studentId: student._id,
      isCompleted: false,
    })
      .populate("batchId courseId", "month name")
      .lean();
      
      console.log(enrollment);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "No active enrollment or batch/course info found",
      });
    }

    const batchId = enrollment.batchId._id.toString();
    const courseName = enrollment.courseId.name;

    const studyCenter = await StudyCenter.findById(student.studyCenterId)
      .select("name")
      .lean();

    if (!studyCenter) {
      return res.status(404).json({
        success: false,
        message: "Study center not found",
      });
    }

   
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const examSchedule = await ExamSchedule.findOne({
      batches: batchId,
      "examDate.to": { $gte: today },
    })
      .select("examName examDate examTime changedCenters")
      .lean();

    if (!examSchedule) {
      return res.status(403).json({
        success: false,
        message: "No upcoming exam scheduled for this student's batch",
      });
    }

    const centerOverride = examSchedule.changedCenters?.find(
      (c) => c.centerId?.toString() === student.studyCenterId.toString()
    );

    const examCenterLocation = centerOverride?.newLocation || studyCenter.name;

    return res.status(200).json({
      success: true,
      message: "Hall ticket approved",
      data: {
        studentName: student.name,
        registrationNo,
        courseName,
        profileImage: student.profileImage,
        studyCenter:studyCenter.name,
        examName: examSchedule.examName,
        examDate: examSchedule.examDate,
        examTime: examSchedule.examTime,
        examCenter: examCenterLocation,
      },
    });
  } catch (error) {
    console.error("Error approving hall ticket:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while approving hall ticket",
    });
  }
};
