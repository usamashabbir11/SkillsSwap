import express from "express";
import getLoggedInUser, { requireAdmin } from "../middlewares/userMiddleware.js";
import { getAdminStats } from "../controllers/adminController.js";

const router = express.Router();

router.get("/stats", getLoggedInUser, requireAdmin, getAdminStats);

export default router;
