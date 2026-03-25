import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reviewee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    deal:     { type: mongoose.Schema.Types.ObjectId, ref: "SwapDeal" },
    rating:   { type: Number, required: true, min: 1, max: 5 },
    comment:  { type: String, default: "" }
  },
  { timestamps: true }
);

// One review per reviewer per swap deal (purchase reviews have no deal field and are excluded)
reviewSchema.index(
  { reviewer: 1, deal: 1 },
  { unique: true, partialFilterExpression: { deal: { $exists: true } } }
);

const Review = mongoose.model("Review", reviewSchema);
export default Review;
