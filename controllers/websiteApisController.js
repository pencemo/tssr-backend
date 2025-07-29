import StudyCenter from "../models/studyCenterSchema.js";
import User from "../models/userSchema.js";
import bcrypt from "bcryptjs";
import { sendEmail } from "../utils/sendEmail.js";

export const requestATC = async (req, res) => {
  try {
    const {
      name,
      email,
      phoneNumber,
      place,
      pincode,
      district,
      state,
      centerHead,
      courses,
    } = req.body;

    if (
      !name ||
      !email ||
      !phoneNumber ||
      !place ||
      !pincode ||
      !district ||
      !state ||
      !centerHead
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required, including at least one course.",
      });
    }

    const existingCenter = await StudyCenter.findOne({ email });
    const existingUser = await User.findOne({ email });

    if (existingCenter || existingUser) {
      return res.status(409).json({
        success: false,
        message: "A study center with this email already exists.",
      });
    }

    const newStudyCenter = new StudyCenter({
      name,
      email,
      phoneNumber,
      place,
      pincode,
      district,
      state,
      centerHead,
      courses,
      isApproved: false,
      isActive: false,
    });

    await newStudyCenter.save();

    return res.status(201).json({
      success: true,
      message: "Study center request submitted successfully.",
      studyCenterId: newStudyCenter._id,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while submitting the study center request.",
      error: error.message,
    });
  }
};

export const getUnapprovedStudyCenters = async (req, res) => {
  try {
    const unapprovedCenters = await StudyCenter.find({
      isApproved: false,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: unapprovedCenters.length,
      data: unapprovedCenters,
    });
  } catch (error) {
    console.error("Error fetching unapproved study centers:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching unapproved study centers.",
      error: error.message,
    });
  }
};

export const updateAtcRequest = async (req, res) => {
  try {
        console.log("query:", req.body);

    const { status, date, id } = req.body;

    console.log("Update ATC Request:", req.body);

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'accepted' or 'rejected'.",
      });
    }

    const studyCenter = await StudyCenter.findById(id);
    if (!studyCenter) {
      return res.status(404).json({
        success: false,
        message: "Study center not found.",
      });
    }


    if (status === "accepted") {
      if (!date) {
        return res.status(400).json({
          success: false,
          message: "Renewal date is required when accepting the request.",
        });
      }

      let newNumber = 1050;
      let regNo = 50301;
      const lastCenter = await StudyCenter.findOne({ isApproved: true }).sort({
        createdAt: -1, 
      });
      console.log("Last Center:", lastCenter);

      if (lastCenter?.atcId) {
        const parts = lastCenter.atcId.split("/");
        const lastNum = parseInt(parts[2]);
        if (!isNaN(lastNum)) {
          newNumber = lastNum + 1;
        }
      }

      if (lastCenter?.regNo) {
        const lastRegNo = parseInt(lastCenter.regNo);
        if (!isNaN(lastRegNo)) {
          regNo = lastRegNo + 1;
        }
      }

      const namePart = (studyCenter.name || "XXX").slice(0, 3).toUpperCase();
      const districtPart = (studyCenter.district || "XXX").slice(0, 3).toUpperCase();
      const newAtcId = `${namePart}/${districtPart}/${newNumber}`;

      studyCenter.isApproved = true;
      studyCenter.isActive = true;
      studyCenter.renewalDate = new Date(date);
      studyCenter.atcId = newAtcId;
      studyCenter.regNo = regNo;

      await studyCenter.save();

      // Create a user for the study center
      const phone = studyCenter.phoneNumber?.toString() || "";
      const last6Digits = phone.slice(-6);
      const hashedPassword = await bcrypt.hash(last6Digits, 10);

      const user = await User.create({
        name: studyCenter.centerHead,
        email: studyCenter.email,
        password: hashedPassword,
        isAdmin: false,
        isVerified: true,
        role: "studycenter_user",
        studycenterId: studyCenter._id,
        phoneNumber: studyCenter.phoneNumber,
        isActive: true,
      });

      await sendEmail(
        studyCenter.email,
        "Study Center Approval Notification",
        `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Account Has Been Created</title>
  <style type="text/css">
    @media only screen and (max-width: 480px) {
      .header-padding {
        padding: 25px 20px !important;
      }
      .main-title {
        font-size: 24px !important;
      }
      .sub-title {
        font-size: 14px !important;
      }
      .content-padding {
        padding: 30px 20px !important;
      }
      .content-title {
        font-size: 20px !important;
        margin-bottom: 15px !important;
      }
      .content-text {
        font-size: 14px !important;
        margin-bottom: 20px !important;
      }
      .icon-size {
        width: 60px !important;
        margin-bottom: 15px !important;
      }
      .credentials-box {
        padding: 15px !important;
        margin: 20px 0 !important;
      }
      .credential-label {
        font-size: 13px !important;
      }
      .credential-value {
        font-size: 14px !important;
      }
      .password-value {
        font-size: 18px !important;
        letter-spacing: 1px !important;
      }
      .login-button {
        padding: 10px 20px !important;
        font-size: 14px !important;
      }
      .instructions-box {
        padding: 15px !important;
        margin: 20px 0 !important;
      }
      .instructions-title {
        font-size: 15px !important;
      }
      .instructions-list {
        font-size: 13px !important;
      }
      .footer-text {
        font-size: 13px !important;
      }
      .footer-small {
        font-size: 11px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; background-color: #f8fafc;">

  <table align="center" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    
    <!-- Header with Gradient -->
    <tr>
      <td align="center" class="header-padding" style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 40px 30px;">
        <h1 class="main-title" style="color: #ffffff; font-size: 28px; margin-bottom: 10px;">Welcome to TSSR Council</h1>
        <p class="sub-title" style="color: #e2e8f0; font-size: 16px;">Your Account is Ready</p>
      </td>
    </tr>

    <!-- Main Content -->
    <tr>
      <td class="content-padding" style="padding: 50px 30px; text-align: center;">
        <img src="https://cdn-icons-png.flaticon.com/512/2997/2997897.png" width="80" alt="Account Created" class="icon-size" style="margin-bottom: 25px;">
        <h2 class="content-title" style="font-size: 24px; font-weight: 600; color: #1a202c; margin-bottom: 20px;">Your Account Has Been Successfully Created</h2>
        <p class="content-text" style="font-size: 16px; color: #4a5568; margin-bottom: 30px; line-height: 1.8;">
          Thank you for joining TSSR Council. Below are your temporary login credentials. 
          We strongly recommend changing your password after first login.
        </p>

        <!-- Credentials Box -->
        <div class="credentials-box" style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 25px; margin: 30px 0; text-align: left;">
          <table cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="padding-bottom: 15px;">
                <p class="credential-label" style="font-size: 14px; color: #15803d; margin-bottom: 5px; font-weight: 600;">Your Username/Email:</p>
                <p class="credential-value" style="font-size: 16px; color: #166534; font-weight: 500; margin: 0;">${studyCenter.email}</p>
              </td>
            </tr>
            <tr>
              <td style="padding-bottom: 15px;">
                <p class="credential-label" style="font-size: 14px; color: #15803d; margin-bottom: 5px; font-weight: 600;">Temporary Password:</p>
                <p class="password-value" style="font-size: 22px; font-weight: bold; color: #14532d; letter-spacing: 2px; font-family: 'Courier New', monospace; margin: 0;">${last6Digits}</p>
              </td>
            </tr>
            <tr>
              <td>
                <a href="" class="login-button" style="display: inline-block; background-color: #4f46e5; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 500; margin-top: 15px;">Login to Your Account</a>
              </td>
            </tr>
          </table>
        </div>

        <!-- Important Instructions -->
        <div class="instructions-box" style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0; text-align: left;">
          <h3 class="instructions-title" style="color: #1e40af; font-size: 16px; margin-bottom: 10px;">📌 Important Next Steps</h3>
          <ol class="instructions-list" style="color: #1e3a8a; font-size: 14px; line-height: 1.6; padding-left: 20px; margin: 0;">
            <li style="margin-bottom: 8px;">Use the temporary password above to login</li>
            <li style="margin-bottom: 8px;">Navigate to Account Settings after login</li>
            <li>Change your password immediately for security</li>
          </ol>
        </div>

        <p class="footer-text" style="font-size: 14px; color: #64748b; line-height: 1.6;">
          If you have any questions or need assistance, our support team is here to help at<br>
          <a href="mailto:support@tssr.org" style="color: #4f46e5; text-decoration: none; font-weight: 500;">support@tssr.org</a>
        </p>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
        <p class="footer-text" style="color: #64748b; font-size: 14px; margin-bottom: 15px;">
          This email contains sensitive account information. Please keep it secure.
        </p>
        <p class="footer-small" style="color: #94a3b8; font-size: 12px; line-height: 1.5;">
          © 2024 TSSR Council. All rights reserved.<br>
          123 Education Street, Kerala, India<br>
          <a href="#" style="color: #94a3b8; text-decoration: none;">Privacy Policy</a> | 
          <a href="#" style="color: #94a3b8; text-decoration: none;">Terms of Service</a>
        </p>
      </td>
    </tr>

  </table>

</body>
</html>`
      );

      return res.status(200).json({
        success: true,
        message: "Study center approved and user account created successfully.",
        data: {
          studyCenter,
          user,
        },
      });
    } else if (status === "rejected") {
      await StudyCenter.findByIdAndDelete(id);
      return res.status(200).json({
        success: true,
        message: "Study center request rejected and deleted successfully.",
      });
    }
  } catch (error) {
    console.error("Error updating ATC request:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the ATC request.",
      error: error.message,
    });
  }
};
