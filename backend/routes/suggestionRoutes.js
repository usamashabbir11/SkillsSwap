import express from "express";
import getLoggedInUser from "../middlewares/userMiddleware.js";
import { getSuggestions } from "../controllers/suggestionController.js";

const router = express.Router();

router.get("/", getLoggedInUser, getSuggestions);

export default router;
