import Review from "../models/reviewModel.js";
import SwapDeal from "../models/swapDealModel.js";
import Notification from "../models/notificationModel.js";

/* ===================== SUBMIT REVIEW ===================== */
export const submitReview = async (req, res) => {
  const { dealId, rating, comment } = req.body;
  const reviewerId = req.user._id;

  if (!dealId || !rating) {
    return res.status(400).json({ success: false, message: "dealId and rating are required" });
  }

  if (typeof rating !== "number" || rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, message: "Rating must be a number between 1 and 5" });
  }

  const deal = await SwapDeal.findById(dealId);
  if (!deal) {
    return res.status(404).json({ success: false, message: "Swap deal not found" });
  }

  // Deal must be fully complete
  if (deal.courseFromA === null || deal.courseFromB === null) {
    return res.status(400).json({ success: false, message: "Swap is not fully completed yet" });
  }

  const userAStr = deal.userA.toString();
  const userBStr = deal.userB.toString();
  const reviewerStr = reviewerId.toString();

  // Reviewer must be part of the deal
  if (reviewerStr !== userAStr && reviewerStr !== userBStr) {
    return res.status(403).json({ success: false, message: "Not part of this swap" });
  }

  // Reviewee is the other user
  const revieweeId = reviewerStr === userAStr ? deal.userB : deal.userA;

  // One review per deal per reviewer
  const existing = await Review.findOne({ reviewer: reviewerId, deal: dealId });
  if (existing) {
    return res.status(400).json({ success: false, message: "You have already reviewed this swap" });
  }

  const review = await Review.create({
    reviewer: reviewerId,
    reviewee: revieweeId,
    deal: dealId,
    rating,
    comment: comment || ""
  });

  await Notification.create({
    user: revieweeId,
    message: `${req.user.name} gave you a ${rating} star rating`
  });

  res.status(201).json({ success: true, data: review });
};

/* ===================== GET REVIEWS FOR USER ===================== */
export const getReviewsForUser = async (req, res) => {
  const reviews = await Review.find({ reviewee: req.params.userId })
    .populate("reviewer", "name")
    .sort({ createdAt: -1 });

  res.json({ success: true, data: reviews });
};
