import User from "../models/userModel.js";

// Haversine formula — returns distance in km between two [lng, lat] coordinate pairs
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
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

export const getNearbyUsers = async (req, res) => {
  try {
    const me = await User.findById(req.user._id).select("location");
    const coords = me?.location?.coordinates;
    const hasLocation = coords && !(coords[0] === 0 && coords[1] === 0);

    // No location set — return all other users sorted by rating
    if (!hasLocation) {
      const users = await User.find({ _id: { $ne: req.user._id } }).sort({
        avgRating: -1,
      });
      return res.json({ success: true, data: users });
    }

    // Use $near to get users sorted by proximity
    const nearbyUsers = await User.find({
      _id: { $ne: req.user._id },
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: coords },
        },
      },
    });

    // Attach distanceKm to each user that has valid coordinates
    const usersWithDistance = nearbyUsers.map((user) => {
      const userCoords = user.location?.coordinates;
      const hasCoords =
        userCoords && !(userCoords[0] === 0 && userCoords[1] === 0);
      const distanceKm = hasCoords ? haversineKm(coords, userCoords) : null;
      return { ...user.toObject(), distanceKm };
    });

    return res.json({ success: true, data: usersWithDistance });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
