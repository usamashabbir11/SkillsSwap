import Review from "../models/reviewModel.js";
import SwapDeal from "../models/swapDealModel.js";
import Purchase from "../models/purchaseModel.js";
import Notification from "../models/notificationModel.js";

/* ===================== SUBMIT REVIEW ===================== */
export const submitReview = async (req, res) => {
  const { dealId, revieweeId, courseIndex, rating, comment } = req.body;
  const reviewerId = req.user._id;

  if (!rating) {
    return res.status(400).json({ success: false, message: "rating is required" });
  }

  if (typeof rating !== "number" || rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, message: "Rating must be a number between 1 and 5" });
  }

  /* ---- COURSE-BASED PATH ---- */
  if (revieweeId !== undefined && courseIndex !== undefined && courseIndex !== null) {
    const idx = typeof courseIndex === "number" ? courseIndex : parseInt(courseIndex, 10);

    // Verify access: purchased OR swap grant
    const purchased = await Purchase.findOne({ buyer: reviewerId, owner: revieweeId, courseIndex: idx });

    let swapAccess = false;
    if (!purchased) {
      const swapDeal = await SwapDeal.findOne({
        $or: [
          { userA: reviewerId, userB: revieweeId },
          { userA: revieweeId, userB: reviewerId }
        ]
      });
      if (swapDeal && swapDeal.courseFromA !== null && swapDeal.courseFromB !== null) {
        const rStr = reviewerId.toString();
        const eStr = revieweeId.toString();
        if (rStr === swapDeal.userB.toString() && eStr === swapDeal.userA.toString()) {
          swapAccess = swapDeal.courseFromA === idx;
        } else if (rStr === swapDeal.userA.toString() && eStr === swapDeal.userB.toString()) {
          swapAccess = swapDeal.courseFromB === idx;
        }
      }
    }

    if (!purchased && !swapAccess) {
      return res.status(403).json({ success: false, message: "You do not have access to this course" });
    }

    const existing = await Review.findOne({ reviewer: reviewerId, reviewee: revieweeId, courseIndex: idx });
    if (existing) {
      return res.status(400).json({ success: false, message: "You have already reviewed this course" });
    }

    const review = await Review.create({
      reviewer: reviewerId,
      reviewee: revieweeId,
      courseIndex: idx,
      rating,
      comment: comment || ""
    });

    await Notification.create({
      user: revieweeId,
      message: `${req.user.name} gave you a ${rating} star rating`
    });

    return res.status(201).json({ success: true, data: review });
  }

  /* ---- PURCHASE PATH ---- */
  if (!dealId && revieweeId) {
    const purchase = await Purchase.findOne({ buyer: reviewerId, owner: revieweeId });
    if (!purchase) {
      return res.status(403).json({ success: false, message: "You have not purchased any course from this user" });
    }

    // One purchase review per reviewer-reviewee pair (deal field absent)
    const existing = await Review.findOne({ reviewer: reviewerId, reviewee: revieweeId, deal: { $exists: false } });
    if (existing) {
      return res.status(400).json({ success: false, message: "You have already reviewed this user" });
    }

    const review = await Review.create({
      reviewer: reviewerId,
      reviewee: revieweeId,
      rating,
      comment: comment || ""
    });

    await Notification.create({
      user: revieweeId,
      message: `${req.user.name} gave you a ${rating} star rating`
    });

    return res.status(201).json({ success: true, data: review });
  }

  /* ---- SWAP DEAL PATH ---- */
  if (!dealId) {
    return res.status(400).json({ success: false, message: "dealId or revieweeId is required" });
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
  const revieweeIdFromDeal = reviewerStr === userAStr ? deal.userB : deal.userA;

  // One review per deal per reviewer
  const existing = await Review.findOne({ reviewer: reviewerId, deal: dealId });
  if (existing) {
    return res.status(400).json({ success: false, message: "You have already reviewed this swap" });
  }

  const review = await Review.create({
    reviewer: reviewerId,
    reviewee: revieweeIdFromDeal,
    deal: dealId,
    rating,
    comment: comment || ""
  });

  await Notification.create({
    user: revieweeIdFromDeal,
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
