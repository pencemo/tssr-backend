import Batch from "../models/batchSchema.js";
import ExamSchedule from "../models/examScheduleSchema.js";
import Notification from "../models/NotificationSchema.js";

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
    if (courses.length === 0) {
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
      const newNotification = new Notification({
        title: "Exam Scheduled",
        description: `${examName} is scheduled for ${batch} batch on ${date.from} to ${date.to} .`,
        category: "Exam Schedule",
        receiverIsAdmin: false,
      });
      await newNotification.save();
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
      { $pull: { batches: batchId } },
      { new: true }
    );

    // Check if the schedule was found
    if (!updatedSchedule) {
      return res.status(404).json({
        success: false,
        message: "Exam schedule not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Exam schedule for this batch is now closed.",
      data: updatedSchedule,
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
    console.log(batchIds)
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

