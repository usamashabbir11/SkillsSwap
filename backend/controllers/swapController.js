import SwapRequest from "../models/swapRequestModel.js";
import Notification from "../models/notificationModel.js";
import SwapDeal from "../models/swapDealModel.js";
import User from "../models/userModel.js";
import Purchase from "../models/purchaseModel.js";

/* ===================== SEND REQUEST ===================== */
export const sendSwapRequest = async (req, res) => {
  const { userId } = req.body;

  const exists = await SwapRequest.findOne({
    from: req.user._id,
    to: userId,
    status: "pending"
  });

  if (exists) {
    return res
      .status(400)
      .json({ success: false, message: "Request already sent" });
  }

  const request = await SwapRequest.create({
    from: req.user._id,
    to: userId,
    status: "pending"
  });

  res.json({ success: true, data: request });
};

/* ===================== GET INCOMING REQUESTS ===================== */
export const getIncomingRequests = async (req, res) => {
  const requests = await SwapRequest.find({
    to: req.user._id
  })
    .populate("from", "name")
    .sort({ createdAt: -1 });

  res.json({ success: true, data: requests });
};

/* ===================== RESPOND TO REQUEST ===================== */
export const respondToRequest = async (req, res) => {
  const { requestId, action } = req.body;

  if (!["accepted", "rejected"].includes(action)) {
    return res.status(400).json({ success: false, message: "Invalid action" });
  }

  const request = await SwapRequest.findById(requestId);

  if (!request) {
    return res
      .status(404)
      .json({ success: false, message: "Request not found" });
  }

  if (request.status !== "pending") {
    return res
      .status(400)
      .json({ success: false, message: "Request already processed" });
  }

  request.status = action;
  await request.save();

  await Notification.create({
    user: request.from,
    message: `${req.user.name} ${action} your skill swap request`
  });

  if (action === "accepted") {
    const exists = await SwapDeal.findOne({ request: request._id });

    if (!exists) {
      await SwapDeal.create({
        request: request._id,
        userA: request.from,
        userB: request.to,
        courseFromA: null,
        courseFromB: null
      });
    }
  }

  res.json({ success: true });
};

/* ===================== PHASE 7.2 — SELECT COURSE ===================== */
export const selectCourseForSwap = async (req, res) => {
  const { dealId, courseIndex } = req.body;

  const deal = await SwapDeal.findById(dealId);
  if (!deal) {
    return res
      .status(404)
      .json({ success: false, message: "Swap deal not found" });
  }

  const selectingUser = await User.findById(req.user._id);

  if (
    typeof courseIndex !== "number" ||
    courseIndex < 0 ||
    courseIndex >= selectingUser.courses.length
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid course selection" });
  }

  let courseOwnerId = null;
  let courseTitle = selectingUser.courses[courseIndex].title;

  // User B selects → courseFromA (course owned by User A)
  if (req.user._id.toString() === deal.userB.toString()) {
    if (deal.courseFromA !== null) {
      return res
        .status(400)
        .json({ success: false, message: "Course already selected" });
    }

    deal.courseFromA = courseIndex;
    courseOwnerId = deal.userA;
  }

  // User A selects → courseFromB (course owned by User B)
  else if (req.user._id.toString() === deal.userA.toString()) {
    if (deal.courseFromB !== null) {
      return res
        .status(400)
        .json({ success: false, message: "Course already selected" });
    }

    deal.courseFromB = courseIndex;
    courseOwnerId = deal.userB;
  } else {
    return res
      .status(403)
      .json({ success: false, message: "Not part of this swap" });
  }

  await deal.save();

  await Notification.create({
    user: courseOwnerId,
    message: `${selectingUser.name} selected your course "${courseTitle}"`
  });

  res.json({ success: true });
};

/* ===================== GET DEAL WITH USER ===================== */
export const getSwapDealWithUser = async (req, res) => {
  const otherUserId = req.params.userId;

  const deal = await SwapDeal.findOne({
    $or: [
      { userA: req.user._id, userB: otherUserId },
      { userA: otherUserId, userB: req.user._id }
    ]
  });

  if (!deal) {
    return res.json({ success: true, data: null });
  }

  // Courses the logged-in user has already purchased from the visited user
  const purchases = await Purchase.find({
    buyer: req.user._id,
    owner: otherUserId
  });
  const purchasedCourseIndexes = purchases.map((p) => p.courseIndex);

  res.json({
    success: true,
    data: {
      dealId: deal._id,
      userA: deal.userA,
      userB: deal.userB,
      courseFromA: deal.courseFromA,
      courseFromB: deal.courseFromB,
      purchasedCourseIndexes
    }
  });
};

/* ===================== CHECK PENDING REQUEST ===================== */
export const hasPendingSwapRequest = async (req, res) => {
  const otherUserId = req.params.userId;

  const exists = await SwapRequest.findOne({
    from: req.user._id,
    to: otherUserId,
    status: "pending"
  });

  res.json({
    success: true,
    data: Boolean(exists)
  });
};

/* ===================== PHASE 8 — CAN ACCESS COURSE ===================== */
export const canAccessCourse = async (req, res) => {
  const { ownerId, courseIndex } = req.params;
  const requestingUserId = req.user._id.toString();
  const ownerIdStr = ownerId.toString();
  const index = parseInt(courseIndex, 10);

  // Rule 1: User owns the course
  if (requestingUserId === ownerIdStr) {
    return res.json({ success: true, data: { canAccess: true } });
  }

  // Rule 2: Check for a fully completed swap deal between the two users
  // where the requesting user was granted this specific course
  const deal = await SwapDeal.findOne({
    $or: [
      { userA: requestingUserId, userB: ownerIdStr },
      { userA: ownerIdStr, userB: requestingUserId }
    ]
  });

  if (deal && deal.courseFromA !== null && deal.courseFromB !== null) {
    const userAStr = deal.userA.toString();
    const userBStr = deal.userB.toString();

    let grantedIndex = null;

    if (requestingUserId === userBStr && ownerIdStr === userAStr) {
      grantedIndex = deal.courseFromA;
    } else if (requestingUserId === userAStr && ownerIdStr === userBStr) {
      grantedIndex = deal.courseFromB;
    }

    if (grantedIndex === index) {
      return res.json({ success: true, data: { canAccess: true } });
    }
  }

  // Rule 3: Check if the user has purchased this course
  const purchased = await Purchase.findOne({
    buyer: requestingUserId,
    owner: ownerIdStr,
    courseIndex: index
  });

  return res.json({ success: true, data: { canAccess: Boolean(purchased) } });
};