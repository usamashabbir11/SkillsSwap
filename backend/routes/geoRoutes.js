import express from "express";
import getLoggedInUser from "../middlewares/userMiddleware.js";
import { getNearbyUsers } from "../controllers/geoController.js";

const router = express.Router();

router.get("/nearby", getLoggedInUser, getNearbyUsers);

export default router;
