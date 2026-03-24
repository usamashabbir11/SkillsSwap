import express from "express";
import getLoggedInUser from "../middlewares/userMiddleware.js";
import { submitReview, getReviewsForUser } from "../controllers/reviewController.js";

const router = express.Router();

router.post("/", getLoggedInUser, submitReview);
router.get("/user/:userId", getLoggedInUser, getReviewsForUser);

export default router;
