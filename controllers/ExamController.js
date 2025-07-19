import Batch from "../models/batchSchema.js";
import ExamSchedule from "../models/examScheduleSchema.js";
import StudyCenter from "../models/studyCenterSchema.js";
import { sendNotification } from "../utils/notification.js";
import moment from "moment";

export const scheduleExam = async (req, res) => {
  try {
    const { examName, date, batch, year, changedCenters , time ,courses} = req.body;

    // Check if any required field is missing
    if (!examName || !date || !batch || !year || !time ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all the required fields",
      });
    }
    let batchIds = [];
    if (!courses || courses.length === 0 ) {
      batchIds = (
        await Batch.find(
          { month: { $regex: `^${batch}$`, $options: "i" } },
          { _id: 1, month: 1 }
        ).lean()
      ).map((b) => b._id);

      if (!batchIds || batchIds.length == 0) {
        return res.json({
          message: `No Batches are available for ${batch} month`,
        });
      }
    } else {
      batchIds = (
        await Batch.find(
        {
          month: { $regex: `^${batch}$`, $options: "i" }, 
          courseId: { $in: courses }, 
        },
        { _id: 1, month: 1 } 
        ).lean()
      ).map((b) => b._id);   

      if (!batchIds || batchIds.length == 0) {
        return res.json({
          message: ` There is No ${batch} Batch for Selected Course `,
          success: false,
        });
      }
    }

    // Create new HallTicket entry
    const ScheduledExam = await ExamSchedule.create({
      examName,
      batches: batchIds,
      year,
      changedCenters,
      examDate: {
        from: new Date(date.from),
        to: new Date(date.to),
      },
      examTime: {
        from: time.from,
        to:time.to,
      },
    });
    if (ScheduledExam) {
      await sendNotification({
        title: "Exam Scheduled",
        description: `${examName} is scheduled for ${batch} batch from ${moment(date.from).format("DD/MM/YYYY")} to ${moment(date.to).format("DD/MM/YYYY")}.\n Please note the dates and prepare accordingly.`,
        category: "Exam Schedule",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Exam scheduled successfully",
      data: ScheduledExam,
    });
  } catch (error) {
    console.error("Error scheduling exam:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const closeScheduledExamBatch = async (req, res) => {
  try {
    const { examScheduleId, batchId } = req.body;

    // Validate input
    if (!examScheduleId || !batchId) {
      return res.status(400).json({
        success: false,
        message: "Please provide both examScheduleId and batchId",
      });
    }

    // Find and update the schedule by ID, removing the batchId
    const updatedSchedule = await ExamSchedule.findByIdAndUpdate(
      examScheduleId,
      { $pull: { batches: batchId } }
    );

    // Check if the schedule was found
    if (!updatedSchedule) {
      return res.status(404).json({
        success: false,
        message: "Exam schedule not founded",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Exam schedule for this batch is now closed.",
    });
  } catch (error) {
    console.error("Error removing batch from exam schedule:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
  
export const getScheduledExamBatches = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const schedules = await ExamSchedule.find({
      "examDate.to": { $gte: today },
    })
      .select("batches examDate examTime examName year")
      .lean();

    if (schedules.length == 0) {
      return res.status(200).json({ success: true, message:"No batch is schedules" });
    }

    const batchIds = schedules.flatMap((schedule) =>
      schedule.batches.map((batchId) => batchId.toString())
    );

    const batches = await Batch.find({ _id: { $in: batchIds } })
      .populate("courseId", "name")
      .lean();
    
    const batchMap = {};
    batches.forEach((b) => {
      batchMap[b._id.toString()] = {
        batchId: b._id,
        batchMonth: b.month,
        courseName: b.courseId?.name || "Unknown",
      };
    });

    const response = schedules.map((s) => ({
      examScheduleId: s._id,
      examName: s.examName,
      year: s.year,
      examDate: s.examDate,
      examTime: s.examTime || "not available",
      batches: s.batches.map((batchId) => batchMap[batchId.toString()]), // Array of batch data
    }));
    return res.status(200).json({ success: true, data: response });
  } catch (err) {
    console.error("Error fetching upcoming exam schedules:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch upcoming exam schedules",
    });
  }
};

export const getScheduledExamBatchesOfStudyCenter = async (req, res) => {
  try {
    const studyCenterId = req.user?.studycenterId;

    if (!studyCenterId) {
      return res.status(400).json({
        success: false,
        message: "Invalid study center ID",
      });
    }

    const studyCenter = await StudyCenter.findById(studyCenterId)
      .select("courses name")
      .lean();

    if (!studyCenter || !studyCenter.courses?.length) {
      return res.status(404).json({
        success: false,
        message: "No courses found for this study center",
      });
    }

    const centerBatches = await Batch.find({
      courseId: { $in: studyCenter.courses },
    })
      .select("_id month courseId")
      .populate("courseId", "name")
      .lean();

    const batchIds = centerBatches.map((batch) => batch._id.toString());

    if (!batchIds.length) {
      return res.status(200).json({
        success: true,
        message: "No batches available for this center",
        data: [],
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const examSchedules = await ExamSchedule.find({
      "examDate.to": { $gte: today },
      batches: { $in: batchIds },
    })
      .select("examName examDate examTime year batches changedCenters")
      .lean();

    if (!examSchedules.length) {
      return res.status(200).json({
        success: true,
        message: "No upcoming scheduled exams found for this center",
        data: [],
      });
    }

    const batchMap = {};
    centerBatches.forEach((batch) => {
      batchMap[batch._id.toString()] = {
        batchId: batch._id,
        batchMonth: batch.month,
        courseName: batch.courseId?.name || "N/A",
      };
    });

    
    const formattedSchedules = examSchedules.map((schedule) => {
      const matchedBatches = schedule.batches
        .map((id) => batchMap[id.toString()])
        .filter(Boolean);

    
      const changedCenter = schedule.changedCenters?.find(
        (c) => c.centerId?.toString() === studyCenterId.toString()
      );

      const location = changedCenter?.newLocation || studyCenter.name;

      return {
        examScheduleId: schedule._id,
        examName: schedule.examName,
        year: schedule.year,
        examDate: schedule.examDate,
        examTime: schedule.examTime,
        location, 
        batches: matchedBatches,
      };
    });

    return res.status(200).json({
      success: true,
      data: formattedSchedules.filter((s) => s.batches.length > 0),
    });
  } catch (err) {
    console.error("Error in getScheduledExamBatchesOfStudyCenter:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching exam schedules",
    });
  }
};

export const deleteExamSchedule = async (req, res) => {
  try {
    const { examScheduleId } = req.body;

    if (!examScheduleId) {
      return res.status(400).json({
        success: false,
        message: "Exam schedule ID is required",
      });
    }

    const examSchedule = await ExamSchedule.findByIdAndDelete(examScheduleId);

    if (!examSchedule) {
      return res.status(404).json({
        success: false,
        message: "Exam schedule not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Exam schedule deleted successfully",
    })
  }
  catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error while deleting exam schedule",
    });
  }
}


