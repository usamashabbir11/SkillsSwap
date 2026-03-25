import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    courseIndex: {
      type: Number,
      required: true
    },
    stripeSessionId: {
      type: String,
      required: true,
      unique: true
    }
  },
  { timestamps: true }
);

// Prevent duplicate purchases for the same course
purchaseSchema.index({ buyer: 1, owner: 1, courseIndex: 1 }, { unique: true });

const Purchase = mongoose.model("Purchase", purchaseSchema);
export default Purchase;
