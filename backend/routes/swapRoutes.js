import express from "express";
import getLoggedInUser from "../middlewares/userMiddleware.js";
import {
  sendSwapRequest,
  getIncomingRequests,
  respondToRequest,
  selectCourseForSwap,
  getSwapDealWithUser,
  hasPendingSwapRequest,
  canAccessCourse
} from "../controllers/swapController.js";

const router = express.Router();

router.post("/send", getLoggedInUser, sendSwapRequest);
router.get("/incoming", getLoggedInUser, getIncomingRequests);
router.post("/respond", getLoggedInUser, respondToRequest);

/* PHASE 7 */
router.post("/select-course", getLoggedInUser, selectCourseForSwap);
router.get("/deal-with/:userId", getLoggedInUser, getSwapDealWithUser);
router.get("/pending-with/:userId", getLoggedInUser, hasPendingSwapRequest);

/* PHASE 8 */
router.get("/can-access/:ownerId/:courseIndex", getLoggedInUser, canAccessCourse);

export default router;