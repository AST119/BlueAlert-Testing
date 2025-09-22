import express from "express";
import {
  createReport,
  listReports,
  getNearbyReports,
  getHotspots,
  importSocialData,
  seedReports,
  verifyReport,
} from "../controllers/reportController.js";

import {
  isAdminAuthenticated,
  isAnalystAuthenticated,
  isCitizenAuthenticated,
} from "../middleware/auth.js";
import { getDashboardSummary } from "../controllers/userController.js";

const report_router = express.Router();


// ✅ Citizen Routes
// Citizens submit hazard reports & fetch nearby info
report_router.post("/citizen/report", isCitizenAuthenticated, createReport);
report_router.get("/citizen/nearby", isCitizenAuthenticated, getNearbyReports);


// ✅ Analyst Routes
// Analysts review reports & check hotspot clustering
report_router.get("/analyst/reports", isAnalystAuthenticated, listReports);
report_router.get("/analyst/hotspots", isAnalystAuthenticated, getHotspots);
report_router.post("/analyst/verify/:id", isAnalystAuthenticated, verifyReport);


// ✅ Admin Routes
// Admin can seed or import social media data for demo/testing
report_router.post("/admin/social/import", isAdminAuthenticated, importSocialData);
report_router.get("/admin/seed", isAdminAuthenticated, seedReports);
report_router.get("/admin/summary", isAdminAuthenticated, getDashboardSummary);

export default report_router;
