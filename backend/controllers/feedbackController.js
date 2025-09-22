import { catchAsyncErrors } from "../middleware/CatchAssyncErrors.js";
import ErrorHandler from "../middleware/errormiddleware.js";
import { Feedback } from "../models/feedback_scheema.js";
import cloudinary from "cloudinary";
import { config } from "dotenv";
import { Resend } from "resend";
config({ path: "./config/config.env" });

const resend = new Resend(process.env.RESEND_API_KEY);

// 📝 Submit Feedback
export const submitFeedback = catchAsyncErrors(async (req, res, next) => {
  try {
    const { type, message } = req.body;
    const userId = req.user._id; // from auth middleware

    if (!type || !message) {
      return next(new ErrorHandler("Type and message are required", 400));
    }

    let attachmentsArr = [];

    // Handle file uploads
    if (req.files && req.files.attachments) {
      const files = Array.isArray(req.files.attachments)
        ? req.files.attachments
        : [req.files.attachments];

      for (let file of files) {
        const allowedFormats = [
          "image/png",
          "image/jpeg",
          "image/webp",
          "application/pdf",
        ];
        if (!allowedFormats.includes(file.mimetype)) {
          return next(new ErrorHandler("Unsupported file format", 400));
        }

        const uploadOptions = {
          folder: "feedback_attachments",
          resource_type: file.mimetype === "application/pdf" ? "raw" : "image",
        };

        const cloudinaryResponse = await cloudinary.uploader.upload(
          file.tempFilePath,
          uploadOptions
        );

        if (!cloudinaryResponse || cloudinaryResponse.error) {
          console.error(
            "Cloudinary Error:",
            cloudinaryResponse.error || "Unknown error"
          );
          return next(new ErrorHandler("Failed to upload to Cloudinary", 500));
        }

        attachmentsArr.push({
          public_id: cloudinaryResponse.public_id,
          url: cloudinaryResponse.secure_url,
        });
      }
    }

    // Save feedback
    const feedback = await Feedback.create({
      submittedBy: userId,
      type,
      message,
      attachments: attachmentsArr,
      status: "Pending",
    });

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      feedback,
    });
  } catch (err) {
    console.error("Feedback submission error:", err);
    return next(new ErrorHandler("Internal server error", 500));
  }
});

// 📜 Get Feedback for Logged-in Supervisor
export const getMyFeedback = catchAsyncErrors(async (req, res, next) => {
  const feedback = await Feedback.find({ submittedBy: req.user._id }).sort({
    createdAt: -1,
  });
  res.status(200).json({ success: true, feedback });
});

// 📋 Admin - Get All Feedback
export const getAllFeedback = catchAsyncErrors(async (req, res, next) => {
  const feedback = await Feedback.find()
    .populate("submittedBy", "firstname lastname email role") // ✅ correct field name
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: feedback.length,
    feedback,
  });
});

export const updateFeedbackStatus = catchAsyncErrors(async (req, res, next) => {
  const { status } = req.body;
  const feedbackId = req.params.id;

  // Validate status input
  const validStatuses = ["Pending", "In Progress", "Resolved"];
  if (!validStatuses.includes(status)) {
    return next(new ErrorHandler("Invalid status value", 400));
  }

  // Find feedback with user details
  const feedback = await Feedback.findById(feedbackId).populate(
    "submittedBy",
    "firstname lastname email"
  );

  if (!feedback) {
    return next(new ErrorHandler("Feedback not found", 404));
  }

  // Update status
  feedback.status = status;
  await feedback.save();

  // Send email notification to user
  try {
    await resend.emails.send({
      from: "SafeVision <feedback@resend.dev>",
      to: feedback.submittedBy.email,
      subject: `Your Feedback Status has been Updated`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Feedback Status Update</title>
  <style>
    body {
      font-family: 'Segoe UI', sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f8f9fa;
      color: #333;
    }
    .container {
      max-width: 650px;
      margin: auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 8px rgba(0,0,0,0.06);
    }
    .header {
      background-color: ${
        status === "Resolved"
          ? "#4CAF50"
          : status === "In Progress"
            ? "#FFC107"
            : "#E74C3C"
      };
      padding: 16px;
      color: white;
      text-align: center;
    }
    .content {
      padding: 24px;
    }
    .content h2 {
      margin-top: 0;
      font-size: 20px;
      color: #444;
    }
    .status-badge {
      display: inline-block;
      padding: 8px 14px;
      font-weight: bold;
      border-radius: 6px;
      background-color: ${
        status === "Resolved"
          ? "rgba(76, 175, 80, 0.1)"
          : status === "In Progress"
            ? "rgba(255, 193, 7, 0.1)"
            : "rgba(231, 76, 60, 0.1)"
      };
      color: ${
        status === "Resolved"
          ? "#2E7D32"
          : status === "In Progress"
            ? "#B28704"
            : "#C0392B"
      };
    }
    blockquote {
      margin: 16px 0;
      padding: 12px 16px;
      background-color: #f7f7f7;
      border-left: 5px solid ${
        status === "Resolved"
          ? "#4CAF50"
          : status === "In Progress"
            ? "#FFC107"
            : "#E74C3C"
      };
      color: #555;
      font-style: italic;
    }
    .footer {
      background-color: #f1f1f1;
      padding: 16px;
      text-align: center;
      font-size: 12px;
      color: #777;
    }
    .cta-btn {
      display: inline-block;
      padding: 12px 18px;
      border-radius: 6px;
      color: white;
      text-decoration: none;
      font-weight: bold;
      margin-top: 16px;
      background: ${
        status === "Resolved"
          ? "linear-gradient(to right, #4CAF50, #81C784)"
          : status === "In Progress"
            ? "linear-gradient(to right, #FFC107, #FFD54F)"
            : "linear-gradient(to right, #E74C3C, #FF6F61)"
      };
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Feedback Status Update</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${feedback.submittedBy.firstname}</strong>,</p>
      <p>Your feedback has been reviewed and its status has been updated to:</p>
      <span class="status-badge">${status}</span>

      <h2>Feedback Details</h2>
      <p><strong>Type:</strong> ${feedback.type}</p>
      <p><strong>Message:</strong></p>
      <blockquote>${feedback.message}</blockquote>

      <p>We appreciate your effort in helping us improve the SafeVision system.</p>
      <a href="${process.env.FRONTEND_URL}/feedback/${feedback._id}" class="cta-btn">View Feedback</a>
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} Hindalco Industries. All rights reserved.<br/>
      SafeVision Feedback System – Created By Shubham Srivastava
    </div>
  </div>
</body>
</html>
`,
    });
    console.log("mail sent ");
  } catch (emailErr) {
    console.error("Failed to send email:", emailErr);
    // Continue even if email fails
  }

  res.status(200).json({
    success: true,
    message: `Feedback status updated to "${status}"`,
    feedback,
  });
});
