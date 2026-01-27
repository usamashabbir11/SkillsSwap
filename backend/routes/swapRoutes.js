import express from "express";
import getLoggedInUser from "../middlewares/userMiddleware.js";
import {
  sendSwapRequest,
  getIncomingRequests,
  respondToRequest
} from "../controllers/swapController.js";

const router = express.Router();

router.post("/send", getLoggedInUser, sendSwapRequest);
router.get("/incoming", getLoggedInUser, getIncomingRequests);
router.post("/respond", getLoggedInUser, respondToRequest);

export default router;
