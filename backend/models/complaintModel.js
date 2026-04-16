import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    reportedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    reason: {
      type: String,
      enum: ["Fake Profile", "Inappropriate Content", "Spam", "Harassment", "Other"],
      required: true
    },
    description: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: ["pending", "resolved", "dismissed"],
      default: "pending"
    }
  },
  { timestamps: true }
);

const Complaint = mongoose.model("Complaint", complaintSchema);

export default Complaint;
