import express from "express";
import getLoggedInUser, { requireAdmin } from "../middlewares/userMiddleware.js";
import {
  submitComplaint,
  getComplaints,
  updateComplaintStatus
} from "../controllers/complaintController.js";

const router = express.Router();

router.post("/", getLoggedInUser, submitComplaint);
router.get("/", getLoggedInUser, requireAdmin, getComplaints);
router.put("/:id", getLoggedInUser, requireAdmin, updateComplaintStatus);

export default router;
