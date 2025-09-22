import mongoose from "mongoose";

const alertLogSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    severity: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "High",
    },
    report: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report", // link to source report
      required: true,
    },
    triggeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // analyst/admin who verified it
      required: true,
    },
    recipients: {
      sms: [{ type: String }], // phone numbers
      email: [{ type: String }], // email addresses
    },
    status: {
      type: String,
      enum: ["Sent", "Failed"],
      default: "Sent",
    },
  },
  { timestamps: true }
);

export const AlertLog = mongoose.model("AlertLog", alertLogSchema);
