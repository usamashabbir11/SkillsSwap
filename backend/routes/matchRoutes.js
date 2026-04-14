import express from "express";
import getLoggedInUser from "../middlewares/userMiddleware.js";
import { getMatchScore } from "../controllers/matchController.js";

const router = express.Router();

router.get("/score/:userId", getLoggedInUser, getMatchScore);

export default router;
