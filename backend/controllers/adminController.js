import User from "../models/userModel.js";
import SwapRequest from "../models/swapRequestModel.js";
import SwapDeal from "../models/swapDealModel.js";
import Review from "../models/reviewModel.js";

/* ===================== GET ADMIN STATS ===================== */
export const getAdminStats = async (req, res) => {
  const totalUsers = await User.countDocuments();

  const totalSwapRequests = await SwapRequest.countDocuments();

  const totalCompletedSwaps = await SwapDeal.countDocuments({
    courseFromA: { $ne: null },
    courseFromB: { $ne: null }
  });

  const usersWithCourses = await User.aggregate([
    { $project: { courseCount: { $size: "$courses" } } },
    { $group: { _id: null, total: { $sum: "$courseCount" } } }
  ]);
  const totalCourses = usersWithCourses[0]?.total ?? 0;

  const totalReviews = await Review.countDocuments();

  res.json({
    success: true,
    data: {
      totalUsers,
      totalSwapRequests,
      totalCompletedSwaps,
      totalCourses,
      totalReviews
    }
  });
};
