import express from "express";
import getLoggedInUser from "../middlewares/userMiddleware.js";
import {
  sendSwapRequest,
  getIncomingRequests,
  respondToRequest,
  selectCourseForSwap,
  getSwapDealWithUser
} from "../controllers/swapController.js";

const router = express.Router();

router.post("/send", getLoggedInUser, sendSwapRequest);
router.get("/incoming", getLoggedInUser, getIncomingRequests);
router.post("/respond", getLoggedInUser, respondToRequest);

/* PHASE 7.2 */
router.post("/select-course", getLoggedInUser, selectCourseForSwap);
router.get("/deal-with/:userId", getLoggedInUser, getSwapDealWithUser);

export default router;
