import express from "express";
import {
  submitFeedback,
  getMyFeedback,
  getAllFeedback,
  updateFeedbackStatus,
} from "../controllers/feedbackController.js";
import {isAdminAuthenticated, isCitizenAuthenticated} from "../middleware/auth.js";

const feedback_router = express.Router();

// Supervisor submit feedback
feedback_router.post("/submit", isCitizenAuthenticated, submitFeedback);

// Supervisor view their own feedback
feedback_router.get("/my", isCitizenAuthenticated, getMyFeedback);

// Admin view all feedback
feedback_router.get("/all", isAdminAuthenticated, getAllFeedback);

// Admin update feedback status
feedback_router.put("/:id", isAdminAuthenticated, updateFeedbackStatus);

export default feedback_router;
