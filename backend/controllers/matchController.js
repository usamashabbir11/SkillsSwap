import User from "../models/userModel.js";
import { computeMatchScore } from "../utils/matchingEngine.js";

export const getMatchScore = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const targetUserId = req.params.userId;

    const [userA, userB] = await Promise.all([
      User.findById(loggedInUserId).select("skillsOffered skillsRequired"),
      User.findById(targetUserId).select("skillsOffered skillsRequired"),
    ]);

    if (!userA || !userB) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const score = computeMatchScore(userA, userB);

    return res.json({ success: true, data: { score } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
