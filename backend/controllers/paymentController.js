import Stripe from "stripe";
import User from "../models/userModel.js";
import Purchase from "../models/purchaseModel.js";
import {
  sendCoursePurchasedBuyerEmail,
  sendCoursePurchasedOwnerEmail
} from "../utils/emailService.js";

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY);

//  CREATE CHECKOUT SESSION 
export const createCheckoutSession = async (req, res) => {
  const { ownerId, courseIndex } = req.body;

  if (ownerId === req.user._id.toString()) {
    return res
      .status(400)
      .json({ success: false, message: "You cannot buy your own course" });
  }

  const owner = await User.findById(ownerId);
  if (!owner) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const index = parseInt(courseIndex, 10);
  const course = owner.courses[index];
  if (!course) {
    return res.status(404).json({ success: false, message: "Course not found" });
  }

  // Check if already purchased
  const alreadyPurchased = await Purchase.findOne({
    buyer: req.user._id,
    owner: ownerId,
    courseIndex: index
  });

  if (alreadyPurchased) {
    return res
      .status(400)
      .json({ success: false, message: "Course already purchased" });
  }

  const session = await getStripe().checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: course.title,
            description: `Course by ${owner.name}`
          },
          unit_amount: Math.round(course.price * 100) // cents
        },
        quantity: 1
      }
    ],
    metadata: {
      buyerId: req.user._id.toString(),
      ownerId: ownerId,
      courseIndex: index.toString()
    },
    success_url: `http://localhost:5173/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `http://localhost:5173/users/${ownerId}`
  });

  res.json({ success: true, data: { url: session.url } });
};

// VERIFY PAYMENT 
export const verifyPayment = async (req, res) => {
  const { sessionId } = req.params;

  const session = await getStripe().checkout.sessions.retrieve(sessionId);

  if (!session || session.payment_status !== "paid") {
    return res
      .status(400)
      .json({ success: false, message: "Payment not completed" });
  }

  const { buyerId, ownerId, courseIndex } = session.metadata;

  // Ensure the logged-in user matches the buyer
  if (buyerId !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: "Unauthorized" });
  }

  // Idempotent — create only if not already recorded
  const existing = await Purchase.findOne({ stripeSessionId: sessionId });
  if (!existing) {
    await Purchase.create({
      buyer: buyerId,
      owner: ownerId,
      courseIndex: parseInt(courseIndex, 10),
      stripeSessionId: sessionId
    });

    const [buyer, owner] = await Promise.all([
      User.findById(buyerId).select("name email"),
      User.findById(ownerId).select("name email courses")
    ]);

    if (buyer && owner) {
      const course = owner.courses[parseInt(courseIndex, 10)];
      const courseTitle = course ? course.title : "the course";
      sendCoursePurchasedBuyerEmail(buyer.email, courseTitle, owner.name);
      sendCoursePurchasedOwnerEmail(owner.email, buyer.name, courseTitle);
    }
  }

  res.json({ success: true, data: { ownerId, courseIndex } });
};

// GET MY PURCHASES 
export const getMyPurchases = async (req, res) => {
  const purchases = await Purchase.find({ buyer: req.user._id });
  res.json({ success: true, data: purchases });
};
