import SwapRequest from "../models/swapRequestModel.js";
import Notification from "../models/notificationModel.js";

/* SEND REQUEST */
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

/* ✅ GET ALL REQUESTS (HISTORY + PENDING) */
export const getIncomingRequests = async (req, res) => {
  const requests = await SwapRequest.find({
    to: req.user._id
  })
    .populate("from", "name")
    .sort({ createdAt: -1 });

  res.json({ success: true, data: requests });
};

/* RESPOND TO REQUEST */
export const respondToRequest = async (req, res) => {
  const { requestId, action } = req.body;

  if (!["accepted", "rejected"].includes(action)) {
    return res.status(400).json({ success: false, message: "Invalid action" });
  }

  const request = await SwapRequest.findById(requestId).populate("from");

  if (!request) {
    return res
      .status(404)
      .json({ success: false, message: "Request not found" });
  }

  request.status = action;
  await request.save();

  await Notification.create({
    user: request.from._id,
    message: `${req.user.name} ${action} your skill swap request`
  });

  res.json({ success: true });
};
