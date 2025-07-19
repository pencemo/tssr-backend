import Staff from "../models/staffSchema.js";

export const createStaff = async (req, res) => {
  try {
    const data = req.body.data; 

    const requiredFields = [
      "name",
      "phoneNumber",
      "email",
      "gender",
      "address",
      "department",
      "qualification",
      "profileImage",
      "age",
      "designation",
      "dob",
    ];

    for (let i = 0; i < data.length; i++) {
      const entry = data[i];
      for (const field of requiredFields) {
        if (!entry[field]) {
          return res.status(400).json({
            success: false,
            message: `Missing field '${field}' in entry ${i + 1}`,
          });
        }
      }
    }

    // ✅ Get the latest staffId and prepare new entries
    const currentYear = new Date().getFullYear();
    const latestStaff = await Staff.findOne().sort({ createdAt: -1 }).lean();

    let nextNumber = 1;
    if (latestStaff && latestStaff.staffId) {
      const parts = latestStaff.staffId.split("/");
      const lastNumber = parseInt(parts[3]);
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }

    const staffEntries = data.map((entry, index) => {
      const staffId = `TSSR/STF/${currentYear}/${(nextNumber + index)
        .toString()
        .padStart(3, "0")}`;

      return {
        ...entry,
        isActive:true,
        staffId,
      };
    });

    const insertedStaffs = await Staff.insertMany(staffEntries);

    return res.status(201).json({
      success: true,
      message: `${insertedStaffs.length} staff(s) created successfully`,
      staffs: insertedStaffs,
    });
  } catch (error) {
    console.error("Error creating staff(s):", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


export const getAllStaffs = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.query;

    const query = {
      name: { $regex: search, $options: "i" }, // Case-insensitive name search
    };

    const total = await Staff.countDocuments(query);

    const staffs = await Staff.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    return res.status(200).json({
      success: true,
      message: "Staffs fetched successfully",
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
      totalCount: total,
      staffs,
    });
  } catch (error) {
    console.error("Error fetching staffs:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


export const updateStaff = async (req, res) => {
  try {
    const { staffId } = req.query; 
    const updatedData = req.body;

    if (!staffId) {
      return res.status(400).json({
        success: false,
        message: "Staff ID is required",
      });
    }

    const updatedStaff = await Staff.findByIdAndUpdate(
      staffId ,
      updatedData,
      { new: true } 
    );

   
    if (!updatedStaff) {
      return res.status(404).json({
        success: false,
        message: "Staff not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Staff updated successfully",
      staff: updatedStaff,
    });
  } catch (error) {
    console.error("Error updating staff:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const deleteStaff = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID is required",
      });
    }

    const deletedStaff = await Staff.findByIdAndDelete(id);

    if (!deletedStaff) {
      return res.status(404).json({
        success: false,
        message: "Staff not found",
      });
    }

    return res.status(200).json({
      
      success: true,
      message: "Staff deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting staff:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    }
    )
  }
}


export const getAllStaffsForDl = async (req, res) => {
  try{
    const data = await Staff.find({isActive:true}).lean().select("-_id -createdAt  -updatedAt -__v -isActive -profileImage").sort({createdAt:-1});

    if(!data){
      return res.status(404).json({
        success: false,
        message: "No staffs found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Staffs fetched successfully",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}