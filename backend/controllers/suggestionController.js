import User from "../models/userModel.js";
import { computeMatchScore } from "../utils/matchingEngine.js";

const haversineKm = ([lng1, lat1], [lng2, lat2]) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const getSuggestions = async (req, res) => {
  try {
    const me = await User.findById(req.user._id);
    const allUsers = await User.find({ _id: { $ne: req.user._id } });

    const myCoords = me?.location?.coordinates;
    const myHasLocation = myCoords && !(myCoords[0] === 0 && myCoords[1] === 0);

    const scored = allUsers.map((user) => {
      // AI match score — weight 50% (or 80% when no location)
      const matchScore = computeMatchScore(me, user);

      // Distance score — weight 30% (closer = higher, capped at 100km)
      const userCoords = user.location?.coordinates;
      const userHasLocation =
        userCoords && !(userCoords[0] === 0 && userCoords[1] === 0);

      let distanceKm = null;
      let distanceScore = null;

      if (myHasLocation && userHasLocation) {
        distanceKm = haversineKm(myCoords, userCoords);
        distanceScore = Math.max(0, (1 - distanceKm / 100)) * 100;
      }

      // Rating score — weight 20%
      const ratingScore = ((user.avgRating || 0) / 5) * 100;

      // Combined score — redistribute distance weight to match score if no location
      const combinedScore =
        distanceScore !== null
          ? matchScore * 0.5 + distanceScore * 0.3 + ratingScore * 0.2
          : matchScore * 0.8 + ratingScore * 0.2;

      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        city: user.city,
        profileImage: user.profileImage,
        skillsOffered: user.skillsOffered,
        skillsRequired: user.skillsRequired,
        avgRating: user.avgRating || 0,
        coursesCount: user.courses?.length || 0,
        combinedScore: Math.round(combinedScore),
        distanceKm: distanceKm !== null ? Math.round(distanceKm) : null,
      };
    });

    const top5 = scored
      .sort((a, b) => b.combinedScore - a.combinedScore)
      .slice(0, 5);

    return res.json({ success: true, data: top5 });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
