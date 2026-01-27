import express from "express";
import getLoggedInUser from "../middlewares/userMiddleware.js";
import {
  getNotifications,
  markNotificationsRead
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", getLoggedInUser, getNotifications);
router.put("/read", getLoggedInUser, markNotificationsRead);

export default router;
