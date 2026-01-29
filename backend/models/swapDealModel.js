import mongoose from "mongoose";

const swapDealSchema = new mongoose.Schema(
  {
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SwapRequest",
      required: true
    },

    userA: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    userB: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // ✅ STORE COURSE INDEX (NOT ObjectId)
    courseFromA: {
      type: Number,
      default: null
    },

    courseFromB: {
      type: Number,
      default: null
    }
  },
  { timestamps: true }
);

const SwapDeal = mongoose.model("SwapDeal", swapDealSchema);
export default SwapDeal;
