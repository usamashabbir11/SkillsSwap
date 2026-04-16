import Complaint from "../models/complaintModel.js";

// POST /complaints — logged-in user submits a complaint
export const submitComplaint = async (req, res) => {
  try {
    const { reportedUserId, reason, description } = req.body;
    const reporterId = req.user._id;

    if (String(reporterId) === String(reportedUserId)) {
      return res.status(400).json({ success: false, message: "You cannot report yourself." });
    }

    const existing = await Complaint.findOne({
      reporter: reporterId,
      reportedUser: reportedUserId,
      status: "pending"
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending complaint against this user."
      });
    }

    const complaint = await Complaint.create({
      reporter: reporterId,
      reportedUser: reportedUserId,
      reason,
      description: description || ""
    });

    return res.status(201).json({ success: true, data: complaint });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /complaints — admin only, returns all complaints
export const getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("reporter", "name email profileImage")
      .populate("reportedUser", "name email profileImage")
      .sort({ createdAt: -1 });

    return res.json({ success: true, data: complaints });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /complaints/:id — admin only, update status
export const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["resolved", "dismissed"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value." });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found." });
    }

    return res.json({ success: true, data: complaint });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
