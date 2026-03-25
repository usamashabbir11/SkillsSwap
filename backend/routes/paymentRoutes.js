import express from "express";
import getLoggedInUser from "../middlewares/userMiddleware.js";
import {
  createCheckoutSession,
  verifyPayment,
  getMyPurchases
} from "../controllers/paymentController.js";

const router = express.Router();

router.post("/create-checkout-session", getLoggedInUser, createCheckoutSession);
router.get("/verify/:sessionId", getLoggedInUser, verifyPayment);
router.get("/my-purchases", getLoggedInUser, getMyPurchases);

export default router;
